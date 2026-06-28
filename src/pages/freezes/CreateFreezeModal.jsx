import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Snowflake, User, Calendar, StickyNote, AlertCircle, CheckCircle2 } from 'lucide-react';
import { freezesApi, membersApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function CreateFreezeModal({ open, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      memberId: '',
      subscriptionId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reason: ''
    }
  });

  const selectedMemberId = watch('memberId');
  const selectedSubId = watch('subscriptionId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // 1. Fetch Members
  const { data: membersData } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => membersApi.list({ search: memberSearch, pageSize: 5 }).then(r => r.data.data),
    enabled: open
  });

  // 2. Fetch Member Active Subscriptions
  const { data: subscriptionsData, isLoading: isLoadingSubs } = useQuery({
    queryKey: ['member-subs-active', selectedMemberId],
    queryFn: () => membersApi.getSubscriptions(selectedMemberId).then(r => r.data.data.filter(s => s.status === 'ACTIVE')),
    enabled: open && !!selectedMemberId
  });

  const selectedSub = useMemo(() => 
    subscriptionsData?.find(s => s.id === selectedSubId),
    [subscriptionsData, selectedSubId]
  );

  const freezeDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = e - s;
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const remainingQuota = useMemo(() => {
    if (!selectedSub) return 0;
    return (selectedSub.package?.freezeDaysAllowed || 0) - (selectedSub.freezeDaysUsed || 0);
  }, [selectedSub]);

  // --- Submission ---
  const mutation = useMutation({
    mutationFn: (data) => freezesApi.create(data),
    onSuccess: () => {
      toast.success('Freeze request submitted for approval');
      reset();
      onSuccess?.();
      queryClient.invalidateQueries(['freezes']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create freeze');
    }
  });

  const onSubmit = (data) => {
    if (freezeDays > remainingQuota) {
      toast.error(`Exceeds remaining quota of ${remainingQuota} days`);
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Modal open={open} onClose={onClose} title="Request Subscription Freeze" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 font-inter bg-slate-50/30">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Member & Subscription */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Step 1: Select Member
              </label>
              <input 
                type="text"
                placeholder="Search member..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-green/20 outline-none"
              />
              <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                {membersData?.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setValue('memberId', m.id); setValue('subscriptionId', ''); }}
                    className={`w-full text-left p-3 rounded-xl text-[11px] font-bold transition-all ${selectedMemberId === m.id ? 'bg-brand-green text-white shadow-md' : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                  >
                    {m.firstName} {m.lastName}
                  </button>
                ))}
              </div>
            </div>

            {selectedMemberId && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Snowflake className="w-3 h-3" /> Step 2: Choose Active Plan
                </label>
                <div className="space-y-2">
                  {isLoadingSubs ? <LoadingSpinner size="sm" /> : subscriptionsData?.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setValue('subscriptionId', s.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedSubId === s.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-tight ${selectedSubId === s.id ? 'text-blue-700' : 'text-slate-700'}`}>{s.package?.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Ends: {new Date(s.endDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-blue-600">{(s.package?.freezeDaysAllowed || 0) - (s.freezeDaysUsed || 0)} Days</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Quota Left</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {subscriptionsData?.length === 0 && <p className="text-[10px] text-red-400 font-bold uppercase py-4">No active subscriptions found</p>}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Freeze Timing */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">Step 3: Freeze Period</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                  <input 
                    type="date"
                    {...register('startDate', { required: true })}
                    className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                  <input 
                    type="date"
                    {...register('endDate', { required: true })}
                    className="w-full h-10 bg-slate-50 border-none rounded-lg px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${freezeDays > remainingQuota ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Days</p>
                  <p className={`text-xl font-black ${freezeDays > remainingQuota ? 'text-red-500' : 'text-slate-900'}`}>{freezeDays} Days</p>
                </div>
                {freezeDays > remainingQuota && <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <StickyNote className="w-3 h-3" /> Reason / Notes
                </label>
                <textarea 
                  {...register('reason')}
                  placeholder="Why is this member freezing?"
                  className="w-full h-24 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !selectedSubId || freezeDays === 0 || freezeDays > remainingQuota}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : <>Request Freeze Approval <CheckCircle2 className="w-4 h-4" /></>}
            </button>
          </div>

        </div>
      </form>
    </Modal>
  );
}
