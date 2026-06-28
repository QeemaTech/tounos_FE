import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, membersApi, servicesApi, schedulesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';
import { 
  User, Calendar, Clock, MapPin, Activity, 
  CreditCard, CheckCircle2, AlertCircle, Search, Info
} from 'lucide-react';

const BOOKING_TYPES = [
  { id: 'GROUP_CLASS', label: 'Group Class' },
  { id: 'PRIVATE_TRAINING', label: 'Private Training' },
  { id: 'MASSAGE', label: 'Massage' },
];

export default function CreateBookingModal({ open, onClose }) {
  const { branches, isBranchLocked, defaultBranchId } = useBranchScope({ enabled: open });
  const qc = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [bookingType, setBookingType] = useState('GROUP_CLASS');

  const { register, handleSubmit, watch, setValue, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      memberId: '',
      bookingType: 'GROUP_CLASS',
      branchId: '',
      scheduleId: '',
      serviceId: '',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      deductQuota: true,
      notes: ''
    }
  });

  const watchBranchId = watch('branchId');
  const watchServiceId = watch('serviceId');
  const watchScheduleId = watch('scheduleId');
  const watchDeductQuota = watch('deductQuota');

  // ── Data Fetching ──

  // 1. Members List (Initial & Search)
  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => membersApi.list({ 
      search: memberSearch || undefined, 
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }).then(r => r.data.data || []),
    enabled: open
  });

  // 2. Member's Active Subscription
  const { data: activeSub, isLoading: loadingSub } = useQuery({
    queryKey: ['member-active-sub', selectedMember?.id],
    queryFn: () => membersApi.getSubscriptions(selectedMember.id).then(r => {
      const subs = r.data.data || [];
      return subs.find(s => s.status === 'ACTIVE');
    }),
    enabled: !!selectedMember?.id
  });

  // 3. Services (for Private/Massage)
  const { data: services } = useQuery({
    queryKey: ['services-by-type', bookingType],
    queryFn: () => servicesApi.list({ serviceType: bookingType, pageSize: 100 }).then(r => r.data.data),
    enabled: open && bookingType !== 'GROUP_CLASS'
  });

  // 4. Schedules (for Group Class)
  const { data: schedules } = useQuery({
    queryKey: ['schedules-by-branch', watchBranchId],
    queryFn: () => schedulesApi.list({ branchId: watchBranchId, pageSize: 100 }).then(r => r.data.data),
    enabled: open && bookingType === 'GROUP_CLASS' && !!watchBranchId
  });

  // ── Business Logic ──

  const selectedService = useMemo(() => {
    let service = null;
    if (bookingType === 'GROUP_CLASS') {
      const sched = schedules?.find(s => s.id === watchScheduleId);
      service = sched?.groupClass?.service;
    } else {
      service = services?.find(s => s.id === watchServiceId);
    }
    
    if (!service) return null;
    return {
      ...service,
      price: Number(service.price) || 0
    };
  }, [bookingType, watchScheduleId, watchServiceId, schedules, services]);

  const quotaInfo = useMemo(() => {
    if (!activeSub) return null;
    const mapping = {
      'GROUP_CLASS': { remaining: activeSub.groupClassRemaining, label: 'Classes' },
      'PRIVATE_TRAINING': { remaining: activeSub.privateTrainingRemaining, label: 'PT Sessions' },
      'MASSAGE': { remaining: activeSub.massageRemaining, label: 'Massage Sessions' },
    };
    return mapping[bookingType];
  }, [activeSub, bookingType]);


  const canDeduct = useMemo(() => {
    return !!activeSub && (quotaInfo?.remaining > 0);
  }, [activeSub, quotaInfo]);

  // Smart Toggle Constraint: If no quota, force off
  useEffect(() => {
    if (!canDeduct) {
      setValue('deductQuota', false);
    }
  }, [canDeduct, setValue]);

  useEffect(() => {
    if (open) {
      reset();
      setSelectedMember(null);
      setMemberSearch('');
      if (defaultBranchId) {
        setValue('branchId', defaultBranchId);
      }
    }
  }, [open, reset, defaultBranchId, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => bookingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create booking')
  });

  const onSubmit = (data) => {
    const payload = {
      memberId: selectedMember.id,
      bookingType,
      branchId: data.branchId,
      bookingDate: new Date(data.bookingDate).toISOString(),
      notes: data.notes,
      sessionDeducted: watchDeductQuota && canDeduct,
      subscriptionId: (watchDeductQuota && canDeduct) ? activeSub.id : undefined,
    };

    if (bookingType === 'GROUP_CLASS') {
      payload.scheduleId = data.scheduleId;
      // Auto-set time from schedule
      const sched = schedules.find(s => s.id === data.scheduleId);
      payload.startTime = sched.startTime;
      payload.endTime = sched.endTime;
    } else {
      payload.serviceId = data.serviceId;
      payload.startTime = data.startTime;
      payload.endTime = data.endTime;
    }

    mutation.mutate(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Manual Reservation" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 font-inter">
        
        {/* Member Search */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> 1. Select Member
          </label>
          
          {selectedMember ? (
            <div className="flex items-center justify-between bg-brand-green/5 border border-brand-green/20 p-4 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-black">
                  {selectedMember.firstName[0]}
                </div>
                <div>
                  <p className="font-black text-slate-900">{selectedMember.firstName} {selectedMember.lastName}</p>
                  <p className="text-xs text-slate-500 font-bold">{selectedMember.membershipNo}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setSelectedMember(null); setMemberSearch(''); }}
                className="text-[10px] font-black text-red-500 uppercase hover:underline"
              >
                Change Member
              </button>
            </div>
          ) : (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-green transition-all" />
              <input 
                type="text"
                placeholder="Search member by name, ID or phone (min 3 chars)..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/10 focus:bg-white transition-all outline-none"
              />
              {loadingMembers && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-[60] py-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching Records...</p>
                </div>
              )}

              {members && members.length > 0 && !loadingMembers && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {members.map(m => (
                    <button 
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMember(m)}
                      className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between group/item"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover/item:text-brand-green">{m.firstName} {m.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{m.membershipNo} • {m.phone || 'No Phone'}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-brand-green opacity-0 group-hover/item:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {members && members.length === 0 && memberSearch.length > 0 && !loadingMembers && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-[60] py-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <User className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching members found</p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Try a different name or membership ID</p>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedMember && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Subscription & Quota Audit */}
            <div className={`p-5 rounded-[28px] border-2 transition-all ${activeSub ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeSub ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                       <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Subscription Status</p>
                       <p className={`text-sm font-black ${activeSub ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {activeSub ? activeSub.package?.name : 'No Active Subscription'}
                       </p>
                    </div>
                 </div>
                 {activeSub && (
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-tighter">Valid Until</p>
                          <p className="text-[11px] font-black text-emerald-700">{new Date(activeSub.endDate).toLocaleDateString()}</p>
                       </div>
                    </div>
                 )}
              </div>

              {activeSub ? (
                <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-4">
                    <p className="text-xs font-black text-slate-700">Available Quota:</p>
                    <div className="flex gap-2">
                       <QuotaBadge label="Classes" count={activeSub.groupClassRemaining} active={bookingType === 'GROUP_CLASS'} />
                       <QuotaBadge label="PT" count={activeSub.privateTrainingRemaining} active={bookingType === 'PRIVATE_TRAINING'} />
                       <QuotaBadge label="Massage" count={activeSub.massageRemaining} active={bookingType === 'MASSAGE'} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase ${!canDeduct ? 'text-slate-300' : 'text-slate-400'}`}>Deduct session</span>
                    <label className={`relative inline-flex items-center ${!canDeduct ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      <input 
                        type="checkbox" 
                        {...register('deductQuota')} 
                        className="sr-only peer" 
                        disabled={!canDeduct} 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-100/30 p-4 rounded-2xl flex items-start gap-3">
                   <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                   <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                      This member has no active plan. Any booking created will be flagged as "Pay-As-You-Go" and will require a separate payment record.
                   </p>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-2 gap-6">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking Segment</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  {BOOKING_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBookingType(t.id)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${bookingType === t.id ? 'bg-white text-brand-green shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch — 3 modes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <MapPin className="w-3 h-3" /> Location
                </label>
                {isBranchLocked ? (
                  <div className="h-11 bg-blue-50 border border-blue-100 rounded-xl px-4 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-sm font-black text-blue-700 uppercase tracking-tight">
                      {branches?.[0]?.name || 'Your Branch'}
                    </span>
                    <span className="ml-auto text-[9px] font-black text-blue-400 uppercase tracking-widest">Auto</span>
                    <input type="hidden" {...register('branchId')} />
                  </div>
                ) : (
                  <select 
                    {...register('branchId', { required: true })}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/10 appearance-none"
                  >
                    <option value="">Select Branch...</option>
                    {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                )}
              </div>

              {/* Dynamic Content: Schedule or Service */}
              {bookingType === 'GROUP_CLASS' ? (
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Select Class Slot
                  </label>
                  <select 
                    {...register('scheduleId', { required: bookingType === 'GROUP_CLASS' })}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/10 appearance-none"
                  >
                    <option value="">Choose available session...</option>
                    {schedules?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.groupClass?.name} ({s.dayOfWeek} @ {s.startTime}) — Trainer: {s.trainer?.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="col-span-2 grid grid-cols-2 gap-6">
                   <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Service</label>
                      <select 
                        {...register('serviceId', { required: bookingType !== 'GROUP_CLASS' })}
                        className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/10 appearance-none"
                      >
                        <option value="">Choose {bookingType.replace('_', ' ')}...</option>
                        {services?.map(s => <option key={s.id} value={s.id}>{s.name} (EGP {s.price})</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time Start</label>
                      <input type="time" {...register('startTime')} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time End</label>
                      <input type="time" {...register('endTime')} className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800" />
                   </div>
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Calendar className="w-3 h-3" /> Booking Date
                </label>
                <input 
                  type="date" 
                  {...register('bookingDate', { required: true })}
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800"
                />
              </div>

              {/* Settlement Price Display */}
              {selectedService && (
                <div className={`p-4 rounded-2xl flex flex-col justify-center animate-in zoom-in duration-300 ${watchDeductQuota ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20' : 'bg-white border-2 border-slate-100 text-slate-900'}`}>
                   <p className={`text-[9px] font-black uppercase tracking-widest ${watchDeductQuota ? 'opacity-60' : 'text-slate-400'}`}>
                      {watchDeductQuota ? 'Subscription Settlement' : 'Pay-At-Reception'}
                   </p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black">
                        EGP {watchDeductQuota ? '0.00' : selectedService.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[9px] font-black uppercase ${watchDeductQuota ? 'opacity-60' : 'text-slate-400'}`}>
                        {watchDeductQuota ? 'Covered by Subscription' : 'Standard Rate'}
                      </span>
                   </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Internal Audit Notes</label>
              <textarea 
                {...register('notes')}
                placeholder="Specific requests, health notices..."
                className="w-full h-24 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 resize-none"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Abort</button>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex-[2] h-14 bg-brand-green text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark transition-all disabled:opacity-50"
              >
                {mutation.isPending ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

function QuotaBadge({ label, count, active }) {
  return (
    <div className={`px-2.5 py-1 rounded-lg border flex flex-col items-center min-w-[50px] transition-all ${active ? 'bg-brand-green border-brand-green text-white shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}>
       <span className="text-[7px] font-black uppercase leading-none mb-1">{label}</span>
       <span className="text-xs font-black leading-none">{count}</span>
    </div>
  );
}
