import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, User, CreditCard, Calendar, FileText, X, Check, Search, MapPin } from 'lucide-react';
import { paymentsApi, membersApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';

export default function RecordPaymentModal({ open, onClose }) {
  const { branches, isBranchLocked, defaultBranchId } = useBranchScope({ enabled: open });
  const qc = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      memberId: '',
      branchId: '',
      amount: '',
      method: 'CASH',
      status: 'PAID',
      notes: ''
    }
  });

  useEffect(() => {
    if (open) {
      setMemberSearch('');
      setShowResults(false);
      reset({
        memberId: '',
        branchId: defaultBranchId || '',
        amount: '',
        method: 'CASH',
        status: 'PAID',
        notes: ''
      });
    }
  }, [open, reset, defaultBranchId]);

  const selectedMemberId = watch('memberId');

  // Fetch Members for search
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => membersApi.list({ search: memberSearch, pageSize: 8 }).then(r => r.data.data),
    enabled: open
  });

  const mutation = useMutation({
    mutationFn: (data) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment recorded successfully');
      reset();
      setMemberSearch('');
      setShowResults(false);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to record payment')
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      amount: Number(data.amount)
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Manual Payment" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 font-inter">
        
        <div className="grid grid-cols-2 gap-6">
          {/* Member Selection */}
          <div className="space-y-2 col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <User className="w-3 h-3" /> Payer / Member
            </label>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search member by name or phone..."
                 value={memberSearch}
                 onFocus={() => setShowResults(true)}
                 onChange={(e) => {
                   setMemberSearch(e.target.value);
                   setShowResults(true);
                   if (selectedMemberId) setValue('memberId', ''); 
                 }}
                 className="w-full h-12 bg-slate-50 border-none rounded-xl pl-12 pr-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
               />

               {/* Results List - Absolute Positioning */}
               {showResults && (members && members.length > 0) && !selectedMemberId && (
                 <div className="absolute top-full left-0 w-full mt-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xl space-y-1 z-[100] max-h-64 overflow-y-auto ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-200">
                   <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                         {memberSearch ? `Matching "${memberSearch}"` : "Suggested Members"}
                      </p>
                   </div>
                   {members.map(m => (
                     <button
                       key={m.id}
                       type="button"
                       onClick={() => {
                         setValue('memberId', m.id);
                         setValue('branchId', m.branchId || '');
                         setMemberSearch(`${m.firstName} ${m.lastName}`);
                         setShowResults(false);
                       }}
                       className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 group"
                     >
                       <div>
                         <p className="text-xs font-black text-slate-800 group-hover:text-brand-green transition-colors">{m.firstName} {m.lastName}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{m.membershipNo} — {m.phone || 'No Phone'}</p>
                       </div>
                       <div className="bg-brand-green/5 p-1.5 rounded-lg group-hover:bg-brand-green/10 transition-colors">
                          <Check className="w-3.5 h-3.5 text-brand-green/40 group-hover:text-brand-green" />
                       </div>
                     </button>
                   ))}
                 </div>
               )}

               {showResults && isLoadingMembers && (
                  <div className="absolute top-full left-0 w-full mt-2 p-4 bg-white rounded-xl border border-slate-100 shadow-2xl z-[100] text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase animate-pulse">Scanning Members...</p>
                  </div>
               )}
            </div>
            {errors.memberId && <p className="text-[10px] text-red-500 font-black uppercase">Please select a member</p>}
            <input type="hidden" {...register('memberId', { required: true })} />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Wallet className="w-3 h-3" /> Amount (EGP)
            </label>
            <input 
              type="number"
              {...register('amount', { required: true, min: 1 })}
              placeholder="0.00"
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
          </div>

          {/* Branch — 3 modes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Branch
            </label>
            {isBranchLocked ? (
              <div className="h-12 bg-blue-50 border border-blue-100 rounded-xl px-4 flex items-center gap-2">
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
                className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
              >
                <option value="">Select Branch</option>
                {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>

          {/* Method */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Method</label>
            <select
              {...register('method')}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value="CASH">CASH</option>
              <option value="CARD">CARD</option>
              <option value="BANK_TRANSFER">BANK TRANSFER</option>
              <option value="ONLINE">ONLINE</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initial Status</label>
            <select
              {...register('status')}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value="PAID">PAID (Confirmed)</option>
              <option value="PENDING">PENDING (Awaiting)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-3 h-3" /> Internal Notes
          </label>
          <textarea 
            {...register('notes')}
            placeholder="Reference numbers, specific details..."
            className="w-full h-24 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 resize-none"
          />
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-[2] h-12 bg-brand-green text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-green/20 hover:bg-brand-green-dark transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Processing...' : 'Confirm Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
