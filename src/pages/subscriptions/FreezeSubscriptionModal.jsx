import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Snowflake, Calendar, AlertCircle, X, Check, Info, ShieldAlert, Package, MapPin } from 'lucide-react';
import { freezesApi, membersApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';

export default function FreezeSubscriptionModal({ open, onClose, memberId, initialSubscription = null, onSuccess }) {
  const qc = useQueryClient();
  
  // 1. Fetch Member's Active Subscriptions
  const { data: subscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ['member-active-subs', memberId],
    queryFn: () => membersApi.getSubscriptions(memberId).then(r => 
      (r.data.data || []).filter(s => s.status === 'ACTIVE' || s.status === 'PENDING')
    ),
    enabled: !!memberId && open
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      subscriptionId: initialSubscription?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reason: ''
    }
  });

  const watchSubId = watch('subscriptionId');
  const watchStart = watch('startDate');
  const watchEnd = watch('endDate');

  // 2. Identify Selected Subscription & Calculate Quota
  const selectedSub = useMemo(() => {
    return subscriptions?.find(s => s.id === watchSubId) || (watchSubId === initialSubscription?.id ? initialSubscription : null);
  }, [subscriptions, watchSubId, initialSubscription]);

  const quota = useMemo(() => {
    if (!selectedSub) return { allowed: 0, used: 0, remaining: 0 };
    const allowed = selectedSub.package?.freezeDaysAllowed || 0;
    const used = selectedSub.freezeDaysUsed || 0;
    return {
      allowed,
      used,
      remaining: Math.max(0, allowed - used)
    };
  }, [selectedSub]);

  // 3. Requested Days Calculation
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  // 4. Check for Existing Freezes
  const existingFreeze = useMemo(() => {
    return selectedSub?.freezes?.find(f => f.status === 'PENDING' || f.status === 'ACTIVE');
  }, [selectedSub]);

  const requestedDays = calculateDays(watchStart, watchEnd);
  const exceedsQuota = requestedDays > quota.remaining;

  useEffect(() => {
    if (open) {
      if (initialSubscription) {
        setValue('subscriptionId', initialSubscription.id);
      } else if (subscriptions?.length > 0 && !watchSubId) {
        setValue('subscriptionId', subscriptions[0].id);
      }
    }
  }, [open, initialSubscription, subscriptions, setValue, watchSubId]);

  const mutation = useMutation({
    mutationFn: (data) => freezesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['member-detail'] });
      qc.invalidateQueries({ queryKey: ['member', memberId] });
      toast.success('Subscription frozen successfully');
      reset();
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Synchronization failed';
      toast.error(`Backend Error: ${msg}`);
    }
  });

  if (!memberId && !initialSubscription) return null;

  return (
    <Modal open={open} onClose={onClose} title="Suspend Membership (Freeze)" size="md">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-8 space-y-8 font-inter">
        
        {/* 1. Subscription Selection */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> 1. Select Subscription to Freeze
          </label>
          
          {loadingSubs ? (
            <div className="h-14 bg-slate-50 animate-pulse rounded-2xl" />
          ) : (
            <select 
              {...register('subscriptionId', { required: true })}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
            >
              <option value="">Choose active plan...</option>
              {subscriptions?.map(s => (
                <option key={s.id} value={s.id}>
                  {s.package?.name} — {s.branch?.name || 'Any Branch'} ({s.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedSub && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-8">
            
            {/* 2. Quota & Status Display */}
            <div className={`p-5 rounded-[28px] border-2 transition-all ${existingFreeze || quota.remaining <= 0 ? 'bg-red-50/50 border-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
               {existingFreeze ? (
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-tight">Freeze Restricted</p>
                        <p className="text-lg font-black text-red-900 leading-tight">Already {existingFreeze.status}</p>
                      </div>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-red-100">
                      <p className="text-[11px] font-bold text-red-700 leading-relaxed">
                        This subscription currently has a <span className="underline">{existingFreeze.status}</span> freeze request. 
                        You must complete or cancel the existing request before adding a new one.
                      </p>
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${quota.remaining > 0 ? 'bg-blue-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-200'}`}>
                          <Snowflake className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">Remaining Freeze Quota</p>
                          <p className={`text-lg font-black leading-tight ${quota.remaining > 0 ? 'text-blue-900' : 'text-red-900'}`}>{quota.remaining} Days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Allowed</p>
                        <p className="text-xs font-black text-slate-600">{quota.allowed} Days</p>
                      </div>
                   </div>

                   {quota.remaining <= 0 && (
                     <div className="bg-white/80 p-4 rounded-2xl border border-red-100 flex gap-3">
                       <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                       <p className="text-[11px] font-bold text-red-700 leading-relaxed">
                         This specific package has no remaining freeze days. No further suspensions can be issued for this plan.
                       </p>
                     </div>
                   )}
                 </>
               )}
            </div>

            {!existingFreeze && quota.remaining > 0 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* 3. Date Selection */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5" /> Start Date
                    </label>
                    <input 
                      type="date"
                      {...register('startDate', { required: true })}
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5" /> End Date
                    </label>
                    <input 
                      type="date"
                      {...register('endDate', { required: 'Required' })}
                      className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none ${errors.endDate || exceedsQuota ? 'ring-2 ring-red-100 bg-red-50/50' : ''}`}
                    />
                  </div>
                </div>

                {/* Requested Days Feedback */}
                {watchStart && watchEnd && (
                  <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${exceedsQuota ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                     <div className="flex items-center gap-3">
                        {exceedsQuota ? <AlertCircle className="w-5 h-5 text-red-500" /> : <Check className="w-5 h-5 text-emerald-500" />}
                        <p className={`text-xs font-black uppercase tracking-tight ${exceedsQuota ? 'text-red-700' : 'text-emerald-700'}`}>
                           {requestedDays} Days Requested
                        </p>
                     </div>
                     {exceedsQuota && (
                       <span className="text-[9px] font-black bg-red-500 text-white px-2.5 py-1 rounded-lg uppercase tracking-widest">EXCEEDS LIMIT</span>
                     )}
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Justification</label>
                  <textarea 
                    {...register('reason', { required: 'Please provide a reason' })}
                    placeholder="e.g., Medical leave, Travel, Member request..."
                    className={`w-full h-28 bg-slate-50 border-none rounded-[24px] px-5 py-4 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none resize-none ${errors.reason ? 'ring-2 ring-red-100' : ''}`}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-6 flex items-center gap-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={mutation.isPending || !selectedSub || quota.remaining <= 0 || exceedsQuota || !!existingFreeze}
            className={`
              flex-[2] h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2
              ${!selectedSub || quota.remaining <= 0 || exceedsQuota || !!existingFreeze
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5'}
            `}
          >
            {mutation.isPending ? 'Syncing...' : <><Snowflake className="w-4 h-4" /> Finalize Freeze</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
