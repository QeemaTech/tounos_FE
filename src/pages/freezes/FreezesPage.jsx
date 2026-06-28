import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, ChevronLeft, ChevronRight, Snowflake, 
  CheckCircle2, XCircle, Plus, Calendar, User, Info, MapPin 
} from 'lucide-react';
import { freezesApi } from '../../api/endpoints';
import { useBranchScope } from '../../hooks/useBranchScope';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CreateFreezeModal from './CreateFreezeModal';
import { toast } from 'react-hot-toast';

export default function FreezesPage() {
  const { isBranchLocked, branchFilter, setBranchFilter, branches } = useBranchScope();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['freezes', { page, status: statusFilter, branchId: branchFilter }],
    queryFn: () => freezesApi.list({ 
      page, 
      pageSize: 15, 
      status: statusFilter || undefined,
      branchId: branchFilter || undefined 
    }).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => freezesApi.approve(id),
    onSuccess: () => {
      toast.success('Freeze approved. Subscription extended.');
      queryClient.invalidateQueries(['freezes']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Approval failed')
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => freezesApi.reject(id),
    onSuccess: () => {
      toast.success('Freeze request rejected');
      queryClient.invalidateQueries(['freezes']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Rejection failed')
  });

  const freezes = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Membership Freezes"
        subtitle="Manage and approve subscription pause requests"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Freezes' }]}
        action={
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
          >
            <Plus className="w-4 h-4" /> New Freeze
          </button>
        }
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
          {!isBranchLocked && (
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={branchFilter} 
                onChange={e => { setBranchFilter(e.target.value); setPage(1); }} 
                className="h-10 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          <div className="relative">
            < Snowflake className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
              className="h-10 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
            >
              <option value="">Status: All</option>
              <option value="PENDING">Pending Approval</option>
              <option value="ACTIVE">Currently Active</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {isLoading ? <div className="py-32 flex justify-center"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member & Plan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Period</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Days</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {freezes.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
                            {f.subscription?.member ? `${f.subscription.member.firstName} ${f.subscription.member.lastName}` : '—'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {f.subscription?.package?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <p className="text-[10px] font-black text-slate-700">{new Date(f.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">to</p>
                        <p className="text-[10px] font-black text-slate-700">{new Date(f.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">
                        {f.freezeDays} D
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-500 max-w-[180px] leading-relaxed italic">
                        {f.reason ? `"${f.reason}"` : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                    <td className="px-6 py-4 text-right">
                      {f.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => approveMutation.mutate(f.id)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                            title="Approve Freeze"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => rejectMutation.mutate(f.id)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                            title="Reject Request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {freezes.length === 0 && (
              <div className="py-24 text-center">
                <Snowflake className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No freeze records found</p>
              </div>
            )}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => p+1)} disabled={page >= meta.totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <CreateFreezeModal 
        open={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => setIsCreateOpen(false)} 
      />
    </div>
  );
}

function ChevronDown(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
