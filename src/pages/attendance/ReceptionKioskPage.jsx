import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Volume2, VolumeX, Camera, CameraOff,
  Maximize2, Minimize2, ArrowLeft, CheckCircle2,
  XCircle, AlertTriangle, RefreshCw, User, Calendar,
  Clock, Sparkles, ShieldCheck, ShieldAlert, Layers,
  Check, Phone, MapPin, Hash, QrCode
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { attendanceApi } from '../../api/endpoints';
import { useBranchScope } from '../../hooks/useBranchScope';
import { useAuth } from '../../hooks/useAuth';
import { playSuccessBeep, playErrorBeep, playWarningBeep } from '../../utils/audioFeedback';

export default function ReceptionKioskPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { branchFilter, setBranchFilter, branches, currentBranch, isBranchLocked } = useBranchScope();

  // Settings / Toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Kiosk Operational State
  // gateState: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'DENIED' | 'SELECTION'
  const [gateState, setGateState] = useState('IDLE');
  const [activePayload, setActivePayload] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [manualCode, setManualCode] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdownPercent, setCountdownPercent] = useState(100);

  const scannerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const autoResetTimerRef = useRef(null);
  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const isProcessingRef = useRef(false);

  // Live Clock
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Sound triggers
  const triggerSound = useCallback((type) => {
    if (!soundEnabled) return;
    if (type === 'success') playSuccessBeep();
    else if (type === 'error') playErrorBeep();
    else if (type === 'warning') playWarningBeep();
  }, [soundEnabled]);

  // Clean reset to ready/idle
  const resetToIdle = useCallback(() => {
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setGateState('IDLE');
    setActivePayload(null);
    setErrorDetails(null);
    setCountdownPercent(100);
    isProcessingRef.current = false;
  }, []);

  // Schedule auto-reset with visual progress countdown
  const scheduleAutoReset = useCallback((durationMs = 3500) => {
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const startTime = Date.now();
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setCountdownPercent(remaining);
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 50);

    autoResetTimerRef.current = setTimeout(() => {
      resetToIdle();
    }, durationMs);
  }, [resetToIdle]);

  // Main QR Verification & Check-in Handler
  const processQrCode = useCallback(async (rawQrData) => {
    if (!rawQrData || isProcessingRef.current) return;
    const cleanData = String(rawQrData).trim();
    if (!cleanData) return;

    isProcessingRef.current = true;
    setGateState('PROCESSING');
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    try {
      // Step 1: Validate with backend (and auto check-in if enabled)
      const res = await attendanceApi.validateQR({
        qrData: cleanData,
        autoCheckIn: autoCheckIn,
      });

      const data = res.data?.data;
      if (!data) throw new Error('Invalid response from server');

      // Check access validity
      if (!data.valid) {
        // Access Denied
        triggerSound('error');
        setGateState('DENIED');
        setErrorDetails({
          code: data.reasonCode || 'NOT_ELIGIBLE',
          message: data.reasonMessage || 'Access denied: Subscription expired or inactive account.',
          member: data.member,
        });
        scheduleAutoReset(4500);
        return;
      }

      // If backend already auto-checked in (single booking or walk-in)
      if (data.autoCheckedIn && data.checkInResult) {
        triggerSound('success');
        setGateState('SUCCESS');
        setActivePayload({
          mode: data.checkInResult.mode,
          member: data.member,
          subscription: data.subscription,
          booking: data.checkInResult.booking,
          message: data.checkInResult.message,
          checkInTime: data.checkInResult.checkInTime || new Date(),
        });

        // Add to recent feed
        setRecentCheckIns((prev) => [
          {
            id: data.checkInResult.attendanceId || Date.now(),
            member: data.member,
            mode: data.checkInResult.mode,
            booking: data.checkInResult.booking,
            time: new Date(),
          },
          ...prev.slice(0, 7),
        ]);

        scheduleAutoReset(3500);
        return;
      }

      // If multiple bookings exist today, ask staff for selection
      if (data.requiresBookingSelection && data.bookings?.length > 1) {
        triggerSound('warning');
        setGateState('SELECTION');
        setActivePayload({
          member: data.member,
          subscription: data.subscription,
          bookings: data.bookings.filter((b) => !b.checkedIn && ['CONFIRMED', 'PENDING'].includes(b.status)),
          qrData: cleanData,
          canWalkIn: data.canWalkIn,
        });
        // We do NOT auto-reset while waiting for selection
        return;
      }

      // Single booking or walk-in pending manual confirmation (when autoCheckIn is OFF)
      if (data.bookings?.length === 1 && !data.bookings[0].checkedIn) {
        triggerSound('warning');
        setGateState('SELECTION');
        setActivePayload({
          member: data.member,
          subscription: data.subscription,
          bookings: [data.bookings[0]],
          qrData: cleanData,
          canWalkIn: data.canWalkIn,
        });
        return;
      }

      // Fallback: If no bookings, allow staff to confirm walk-in
      triggerSound('warning');
      setGateState('SELECTION');
      setActivePayload({
        member: data.member,
        subscription: data.subscription,
        bookings: [],
        qrData: cleanData,
        canWalkIn: data.canWalkIn,
      });

    } catch (err) {
      triggerSound('error');
      setGateState('DENIED');
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Access denied: Invalid QR code or unauthorized.';
      setErrorDetails({
        code: 'ERROR',
        message: msg,
        member: null,
      });
      scheduleAutoReset(4500);
    }
  }, [autoCheckIn, scheduleAutoReset, triggerSound]);

  // Handle explicit session selection
  const handleSelectBooking = async (booking) => {
    if (!activePayload?.qrData) return;
    setGateState('PROCESSING');
    try {
      const res = await attendanceApi.qrCheckIn({
        qrData: activePayload.qrData,
        bookingId: booking.id,
      });
      const checkInResult = res.data?.data;
      triggerSound('success');
      setGateState('SUCCESS');
      setActivePayload({
        mode: 'BOOKING',
        member: activePayload.member,
        subscription: activePayload.subscription,
        booking: {
          ...booking,
          serviceName: booking.service?.name || booking.schedule?.groupClass?.name || booking.bookingType,
        },
        message: checkInResult?.message || 'Session checked in successfully',
        checkInTime: new Date(),
      });

      setRecentCheckIns((prev) => [
        {
          id: checkInResult?.attendanceId || Date.now(),
          member: activePayload.member,
          mode: 'BOOKING',
          booking,
          time: new Date(),
        },
        ...prev.slice(0, 7),
      ]);

      scheduleAutoReset(3500);
    } catch (err) {
      triggerSound('error');
      setGateState('DENIED');
      setErrorDetails({
        code: 'SELECTION_ERROR',
        message: err.response?.data?.message || 'Failed to check in session',
        member: activePayload.member,
      });
      scheduleAutoReset(4000);
    }
  };

  // Handle explicit walk-in confirmation
  const handleConfirmWalkIn = async () => {
    if (!activePayload?.qrData) return;
    setGateState('PROCESSING');
    try {
      const res = await attendanceApi.qrCheckIn({
        qrData: activePayload.qrData,
        walkIn: true,
      });
      const checkInResult = res.data?.data;
      triggerSound('success');
      setGateState('SUCCESS');
      setActivePayload({
        mode: 'WALK_IN',
        member: activePayload.member,
        subscription: {
          ...activePayload.subscription,
          groupClassRemaining: checkInResult?.groupClassRemaining ?? activePayload.subscription?.groupClassRemaining - 1,
        },
        booking: null,
        message: 'Walk-in gym entry recorded (1 session deducted)',
        checkInTime: new Date(),
      });

      setRecentCheckIns((prev) => [
        {
          id: checkInResult?.attendanceId || Date.now(),
          member: activePayload.member,
          mode: 'WALK_IN',
          booking: null,
          time: new Date(),
        },
        ...prev.slice(0, 7),
      ]);

      scheduleAutoReset(3500);
    } catch (err) {
      triggerSound('error');
      setGateState('DENIED');
      setErrorDetails({
        code: 'WALKIN_ERROR',
        message: err.response?.data?.message || 'Failed to record walk-in check-in',
        member: activePayload.member,
      });
      scheduleAutoReset(4000);
    }
  };

  // Hardware Scanner: Global Keypress Rapid Buffer Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside the manual search modal input
      if (isManualModalOpen) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Scanners send keys within 5-40ms of each other
      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          const scannedString = barcodeBufferRef.current;
          barcodeBufferRef.current = '';
          processQrCode(scannedString);
        } else {
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 120) {
          // Reset buffer if delay indicates human typing rather than barcode scanner
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isManualModalOpen, processQrCode]);

  // Camera Scanner: Continuous Html5Qrcode Integration
  useEffect(() => {
    let html5QrCode = null;

    if (cameraEnabled && gateState === 'IDLE') {
      const container = document.getElementById('kiosk-scanner-view');
      if (container) {
        html5QrCode = new Html5Qrcode('kiosk-scanner-view');
        scannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 280, height: 280 } },
          (decodedText) => {
            if (html5QrCode?.isScanning) {
              html5QrCode.pause();
            }
            processQrCode(decodedText);
          },
          () => {}
        ).catch(() => {
          // Camera permission or device missing
        });
      }
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [cameraEnabled, gateState, processQrCode]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-inter select-none overflow-hidden">
      {/* 1. Kiosk Top Bar */}
      <header className="h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/attendance')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-sm font-semibold border border-slate-700"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Exit to Dashboard</span>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-lg leading-none">TONUS CLUB</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  KIOSK MODE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentBranch?.name || 'All Branches'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Branch Switcher (if super admin) & Live Clock */}
        <div className="hidden lg:flex items-center gap-6 text-sm">
          {!isBranchLocked && branches.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400">Branch:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-800/60 px-4 py-1.5 rounded-xl border border-slate-700/60">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-base text-white">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auto Check-in Toggle */}
          <button
            onClick={() => setAutoCheckIn((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              autoCheckIn
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Auto Check-in immediately upon valid scan"
          >
            <Zap className={`w-4 h-4 ${autoCheckIn ? 'fill-emerald-400' : ''}`} />
            <span className="hidden md:inline">Auto Check-in:</span>
            <span>{autoCheckIn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setCameraEnabled((prev) => !prev)}
            className={`p-2.5 rounded-xl border transition-all ${
              cameraEnabled
                ? 'bg-slate-800 text-teal-400 border-slate-700'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
          >
            {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Main Gate Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
        {/* Left / Center Area: Dynamic Gate Display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-center items-center p-6 md:p-12 relative">
          
          {/* ================= STATE 1: IDLE / READY FOR SCAN ================= */}
          {gateState === 'IDLE' && (
            <div className="w-full max-w-xl flex flex-col items-center text-center space-y-6 animate-fade-in">
              {/* Scanner Box / Visual Target */}
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-3xl border-2 border-dashed border-emerald-500/40 bg-slate-900/60 p-4 flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/10 backdrop-blur-sm group overflow-hidden">
                {/* Visual Corner Target Marks */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {cameraEnabled ? (
                  <div id="kiosk-scanner-view" className="w-full h-full rounded-2xl overflow-hidden" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-slate-400 p-6">
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 animate-pulse">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-medium">Barcode Scanner Ready</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Point handheld USB/Bluetooth scanner at the member&apos;s QR code or barcode.
                    </p>
                  </div>
                )}

                {/* Laser animation bar */}
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-bounce" />
              </div>

              {/* Status Indicator */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Ready for Next Member</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Scan QR Code to Check In
                </h2>
                <p className="text-slate-400 text-sm max-w-md">
                  Hold member QR code under the scanner or use the barcode handheld reader.
                </p>
              </div>

              {/* Manual Entry Trigger */}
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Hash className="w-4 h-4 text-emerald-400" />
                <span>Manual Membership Code Entry</span>
              </button>
            </div>
          )}

          {/* ================= STATE 2: PROCESSING ================= */}
          {gateState === 'PROCESSING' && (
            <div className="flex flex-col items-center justify-center gap-6 p-12 text-center animate-pulse">
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Verifying Subscription...</h3>
                <p className="text-slate-400 text-sm mt-1">Checking member status and booking quota</p>
              </div>
            </div>
          )}

          {/* ================= STATE 3: SUCCESS (GREEN GATE) ================= */}
          {gateState === 'SUCCESS' && activePayload && (
            <div className="w-full max-w-2xl bg-gradient-to-b from-emerald-950/80 to-slate-900 border-4 border-emerald-400 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-500/30 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Countdown Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${countdownPercent}%` }}
                />
              </div>

              {/* Verified Badge */}
              <div className="w-20 h-20 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/50 mb-6 animate-bounce">
                <Check className="w-12 h-12 stroke-[3.5]" />
              </div>

              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black tracking-widest uppercase mb-4">
                ACCESS GRANTED • تم التحقق بنجاح
              </span>

              {/* Member Visuals */}
              <div className="flex flex-col sm:flex-row items-center gap-6 my-4 p-6 bg-slate-900/90 rounded-2xl border border-emerald-500/30 w-full text-left">
                {activePayload.member?.avatar ? (
                  <img
                    src={activePayload.member.avatar.startsWith('http') ? activePayload.member.avatar : `/uploads/avatars/${activePayload.member.avatar}`}
                    alt="Member"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 text-2xl font-black shrink-0">
                    {activePayload.member?.firstName?.[0]}{activePayload.member?.lastName?.[0]}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-2xl font-black text-white">
                    {activePayload.member?.firstName} {activePayload.member?.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300 mt-1.5 font-medium">
                    <span className="font-mono text-emerald-300 font-bold">
                      #{activePayload.member?.membershipNo}
                    </span>
                    {activePayload.member?.branch?.name && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {activePayload.member.branch.name}
                      </span>
                    )}
                  </div>

                  {/* Mode Banner */}
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {activePayload.mode === 'BOOKING'
                        ? `Session: ${activePayload.booking?.serviceName || activePayload.booking?.bookingType} (${activePayload.booking?.startTime || ''})`
                        : 'Walk-in Gym Session'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quota Highlights */}
              {activePayload.subscription && (
                <div className="grid grid-cols-3 gap-3 w-full my-2 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                    <p className="text-slate-400">Classes</p>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">
                      {activePayload.subscription.groupClassRemaining ?? '-'}
                    </p>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                    <p className="text-slate-400">Private PT</p>
                    <p className="text-lg font-black text-teal-400 mt-0.5">
                      {activePayload.subscription.privateTrainingRemaining ?? '-'}
                    </p>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                    <p className="text-slate-400">Massage</p>
                    <p className="text-lg font-black text-amber-400 mt-0.5">
                      {activePayload.subscription.massageRemaining ?? '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Next Button */}
              <button
                onClick={resetToIdle}
                className="mt-6 px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Next Member</span>
                <span className="text-xs opacity-75 font-mono">({Math.ceil(countdownPercent / 30)}s)</span>
              </button>
            </div>
          )}

          {/* ================= STATE 4: ACCESS DENIED (RED GATE) ================= */}
          {gateState === 'DENIED' && errorDetails && (
            <div className="w-full max-w-2xl bg-gradient-to-b from-red-950/90 to-slate-900 border-4 border-red-500 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-red-500/30 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
                <div
                  className="h-full bg-red-500 transition-all duration-75"
                  style={{ width: `${countdownPercent}%` }}
                />
              </div>

              <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/50 mb-6 animate-pulse">
                <XCircle className="w-12 h-12 stroke-[2.5]" />
              </div>

              <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black tracking-widest uppercase mb-2">
                ACCESS DENIED • الدخول مرفوض
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-3">
                {errorDetails.message}
              </h3>

              {errorDetails.member && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-red-500/30 w-full max-w-md my-4 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-red-500/40 flex items-center justify-center font-bold text-red-400">
                    {errorDetails.member.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">
                      {errorDetails.member.firstName} {errorDetails.member.lastName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      #{errorDetails.member.membershipNo}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={resetToIdle}
                className="mt-6 px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-red-600/30"
              >
                Dismiss & Scan Next
              </button>
            </div>
          )}

          {/* ================= STATE 5: MULTI-SESSION SELECTION (AMBER GATE) ================= */}
          {gateState === 'SELECTION' && activePayload && (
            <div className="w-full max-w-2xl bg-gradient-to-b from-amber-950/80 to-slate-900 border-4 border-amber-400 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber-500/20 flex flex-col items-center relative overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shadow-lg mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-white text-center">
                Select Session to Check In
              </h3>
              <p className="text-sm text-slate-400 text-center mt-1 mb-6">
                {activePayload.member?.firstName} has multiple scheduled sessions or needs manual confirmation.
              </p>

              {/* Sessions List */}
              <div className="space-y-3 w-full mb-6 max-h-60 overflow-y-auto pr-1">
                {activePayload.bookings?.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-amber-400/40 hover:border-amber-400 flex items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <p className="font-bold text-white text-base">
                        {b.service?.name || b.schedule?.groupClass?.name || b.bookingType}
                      </p>
                      <p className="text-xs text-amber-300 font-mono mt-0.5">
                        {b.startTime} - {b.endTime}
                      </p>
                      {b.trainer && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Coach: {b.trainer.firstName} {b.trainer.lastName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelectBooking(b)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all"
                    >
                      Check In This Session
                    </button>
                  </div>
                ))}
              </div>

              {/* Walk-in or Cancel Option */}
              <div className="flex gap-3 w-full">
                {activePayload.canWalkIn && (
                  <button
                    onClick={handleConfirmWalkIn}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                  >
                    Record as Walk-in (Deduct Group Session)
                  </button>
                )}
                <button
                  onClick={resetToIdle}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold border border-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Area: Recent Check-in Feed Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border-t lg:border-t-0 lg:border-l border-slate-800/80 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-extrabold text-sm text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Today&apos;s Live Check-in Feed</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                {recentCheckIns.length} recent
              </span>
            </div>

            {recentCheckIns.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <User className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                <p>No check-ins recorded yet during this kiosk session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 animate-fade-in"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                      {item.member?.firstName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {item.member?.firstName} {item.member?.lastName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        #{item.member?.membershipNo}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {item.mode === 'WALK_IN' ? 'Walk-in' : 'Session'}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hardware Scanner Guide */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Barcode Reader Tip</span>
            </p>
            <p className="leading-relaxed">
              Plug any 2D barcode scanner via USB. It works automatically without clicking any input box.
            </p>
          </div>
        </div>
      </main>

      {/* Manual Search Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-emerald-400" />
                <span>Manual Check-in Search</span>
              </h4>
              <button
                onClick={() => { setIsManualModalOpen(false); setManualCode(''); }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Type member membership number (e.g. TC-12345) or member UUID:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) {
                  setIsManualModalOpen(false);
                  const code = manualCode.trim();
                  setManualCode('');
                  processQrCode(code);
                }
              }}
              className="space-y-4"
            >
              <input
                type="text"
                autoFocus
                placeholder="e.g. TC-1710000000-0"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsManualModalOpen(false); setManualCode(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold disabled:opacity-50"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
