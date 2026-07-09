import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Calendar, GitBranch, ShieldCheck, UserCheck, 
  Camera, X, Check, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { attendanceApi, bookingsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { useBranchScope } from '../../hooks/useBranchScope';

export default function AttendancePage() {
  const qc = useQueryClient();
  const { branchFilter, setBranchFilter, branches, isBranchLocked } = useBranchScope();
  
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Fetch Attendance Log
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendance', { branchId: branchFilter, search, date, page }],
    queryFn: () => attendanceApi.list({
      page,
      pageSize: 15,
      branchId: branchFilter || undefined,
      search: search || undefined,
      date: date || undefined,
    }).then(r => r.data),
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="px-4 py-6 md:p-8 space-y-6 md:space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Attendance & Check-in" 
        subtitle="Manage member entry logs and verify attendance QR codes" 
        breadcrumbs={[{ label: 'Attendance' }]}
        actions={
          <button 
            onClick={() => setIsScanModalOpen(true)}
            className="bg-brand-green hover:bg-[#082a10] text-white !rounded-2xl !py-2.5 !px-4 md:!py-3 md:!px-6 shadow-lg shadow-brand-green/20 flex items-center gap-2 font-bold transition-all transform hover:-translate-y-0.5 text-sm md:text-base"
          >
            <Camera className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Scan QR Code</span>
            <span className="sm:hidden">Scan QR</span>
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative sm:col-span-2 md:col-span-1">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search member name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-sm"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-sm"
          />
        </div>

        {/* Branch Scope Dropdown */}
        <div className="relative">
          <GitBranch className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
            disabled={isBranchLocked}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table/Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12"><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <UserCheck className="w-12 h-12 text-slate-300" />
            <p className="font-semibold text-lg">No Check-in records found</p>
            <p className="text-sm">Scan a QR code or create a manual entry to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table — hidden on small screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Member Name</th>
                    <th className="px-6 py-4">Membership No</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4">Check-in Time</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {log.member?.firstName} {log.member?.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {log.member?.membershipNo}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {log.branch?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(log.checkInTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${
                          log.method === 'QR' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards — shown only on small screens */}
            <div className="md:hidden divide-y divide-slate-100">
              {logs.map(log => (
                <div key={log.id} className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors">
                  {/* Top row: name + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">
                        {log.member?.firstName} {log.member?.lastName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {log.member?.membershipNo}
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>

                  {/* Bottom row: branch + time + method */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      {log.branch?.name || '-'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(log.checkInTime).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      log.method === 'QR' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {log.method}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-sm font-medium text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary !py-2 !px-4 disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary !py-2 !px-4 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner & Verification Modal */}
      {isScanModalOpen && (
        <QRScannerModal 
          isOpen={isScanModalOpen} 
          onClose={() => setIsScanModalOpen(false)} 
          onSuccess={() => {
            setIsScanModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function QRScannerModal({ isOpen, onClose, onSuccess }) {
  const [scannerError, setScannerError] = useState('');
  const [simulatedData, setSimulatedData] = useState('');
  const [scanResult, setScanResult] = useState(null); // Member info after validate-qr
  const [scanError, setScanError] = useState('');     // Error shown inside the scanner view
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const scannerRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isOpen && !scanResult) {
      // Delay initialization slightly to guarantee the modal animation has finished and DOM element is attached
      timer = setTimeout(() => {
        const element = document.getElementById("scanner-view");
        if (!element) {
          console.warn("Scanner element not found in DOM yet");
          return;
        }

        const html5QrCode = new Html5Qrcode("scanner-view");
        scannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            // Success
            await stopScanner();
            handleValidateQR(decodedText);
          },
          (err) => {
            // Silent scan frame failure
          }
        ).catch(err => {
          console.error("Camera access failed", err);
          setScannerError("Camera not found or permission denied. You can manually enter/paste the QR data below:");
        });
      }, 100);
    }

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, scanResult]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const handleValidateQR = async (qrData) => {
    if (!qrData?.trim()) return;
    setIsVerifying(true);
    setScanError('');
    setErrorMessage('');
    try {
      const res = await attendanceApi.validateQR(qrData);
      const data = res.data.data;
      if (!data.valid) {
        setErrorMessage('No active subscription or member is inactive.');
      }
      setScanResult(data);
    } catch (err) {
      console.error(err);
      // Show error inside the scanner area — scanResult stays null so scanner panel is visible
      const msg = err.response?.data?.message
        || err.response?.data?.error?.message
        || 'Invalid or unauthorized QR code. Please try again.';
      setScanError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    setIsConfirming(true);
    try {
      const qrDataStr = JSON.stringify({
        memberId: scanResult.member.id,
        membershipNo: scanResult.member.membershipNo
      });
      await attendanceApi.qrCheckIn(qrDataStr);
      toast.success('General Walk-in Check-in successful! Session deducted.');
      onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message
        || err.response?.data?.error?.message
        || 'Walk-in check-in failed. Please try again.';
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirmBookingCheckIn = async (booking) => {
    setIsConfirming(true);
    try {
      await bookingsApi.update(booking.id, { status: 'COMPLETED' });
      toast.success('Check-in successful! Booking marked COMPLETED & attendance recorded.');
      onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message
        || err.response?.data?.error?.message
        || 'Booking check-in failed. Please try again.';
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="QR Code Check-in" size="md">
      <div className="space-y-6 p-1">
        
        {/* Verification Loading State */}
        {isVerifying && (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <RefreshCw className="w-10 h-10 text-brand-green animate-spin" />
            <p className="text-slate-600 font-medium">Verifying member subscription...</p>
          </div>
        )}

        {/* 1. Showing Scanner Feed (Using class-based show/hide so scanner-view element remains in the DOM) */}
        <div className={!scanResult && !isVerifying ? "block space-y-4" : "hidden"}>

          {/* Scan Error Banner */}
          {scanError && (
            <div className="flex gap-3 items-start p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <h4 className="font-bold mb-0.5">Scan Failed</h4>
                <p className="text-red-700">{scanError}</p>
              </div>
              <button
                onClick={() => { setScanError(''); setSimulatedData(''); }}
                className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          <p className="text-sm text-slate-500 text-center">
            Position the QR code within the frame below to scan, or type the member's number manually.
          </p>

          {/* Scanner box — fixed square using padding-bottom trick */}
          <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-inner ${scannerError ? 'hidden' : 'block'}`} style={{ paddingBottom: '100%' }}>
            <div id="scanner-view" className="absolute inset-0" />
          </div>

          {/* Manual input */}
          <div className="space-y-3">
            {scannerError && (
              <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{scannerError}</p>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Membership No. (e.g. TC-001) or Member ID"
                value={simulatedData}
                onChange={(e) => setSimulatedData(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidateQR(simulatedData)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:outline-none"
              />
              <button
                onClick={() => handleValidateQR(simulatedData)}
                disabled={!simulatedData.trim()}
                className="bg-brand-green hover:bg-[#082a10] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
              >
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* 2. Showing Member Profile & Subscription Preview */}
        {scanResult && !isVerifying && (
          <div className="space-y-6">
            
            {/* Error Message if Validation Denies entry */}
            {errorMessage && (
              <div className="flex gap-2 items-start p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <div className="text-sm">
                  <h4 className="font-bold">Access Denied</h4>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Verification Success Details */}
            {!errorMessage && (
              <div className="flex gap-2 items-start p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <Check className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5 bg-emerald-100 rounded-full p-0.5" />
                <div className="text-sm">
                  <h4 className="font-bold">Verification Successful</h4>
                  <p>Membership is active and subscription was found.</p>
                </div>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {scanResult.member.firstName} {scanResult.member.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Member ID: {scanResult.member.membershipNo}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  scanResult.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {scanResult.valid ? 'ACTIVE MEMBER' : 'INACTIVE'}
                </span>
              </div>

              {scanResult.subscription ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase">Current Package</span>
                    <span className="font-bold text-slate-800">{scanResult.subscription.packageName}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-semibold uppercase">Expiration Date</span>
                    <span className="font-bold text-slate-800">
                      {new Date(scanResult.subscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-slate-500 italic text-sm">
                  No active package found.
                </div>
              )}
            </div>

            {/* Today's Bookings */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Bookings</h4>
              {scanResult.bookings && scanResult.bookings.length > 0 ? (
                <div className="space-y-2">
                  {scanResult.bookings.map(b => (
                    <div key={b.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="block text-sm font-bold text-slate-800">
                          {b.bookingType === 'GROUP_CLASS' ? b.schedule?.groupClass?.name : b.service?.name}
                        </span>
                        <span className="block text-xs text-slate-500 font-medium mt-1">
                          {b.startTime} - {b.endTime} | <span className="font-bold text-brand-green">{b.bookingType.replace('_', ' ')}</span>
                          {b.trainer && ` | Trainer: ${b.trainer.firstName}`}
                          {b.therapist && ` | Therapist: ${b.therapist.firstName}`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleConfirmBookingCheckIn(b)}
                        disabled={isConfirming}
                        className="px-4 py-2 bg-brand-green hover:bg-[#082a10] disabled:opacity-55 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Confirm Attendance
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
                  No active bookings found for today.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setScanResult(null);
                  setErrorMessage('');
                }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
              >
                Scan Another
              </button>
              
              {!errorMessage && (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={isConfirming}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-55 text-white font-bold rounded-xl transition-all text-sm shadow-sm"
                >
                  {isConfirming ? 'Checking in...' : 'Confirm General Walk-in'}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
}