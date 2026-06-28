import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, ChevronLeft, ChevronRight, Calendar, Dumbbell, Heart, 
  Filter, User, Plus, MoreHorizontal, Eye, Check, Snowflake, 
  XCircle, Clock, MapPin, AlertCircle, Trash2, ArrowUpRight, Activity
} from 'lucide-react';
import { subscriptionsApi, membersApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import AssignPackageModal from '../members/AssignPackageModal';
import FreezeSubscriptionModal from './FreezeSubscriptionModal';
import { freezesApi } from '../../api/endpoints';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';

export default function SubscriptionsPage() {
  const { isBranchLocked, branchFilter, setBranchFilter, branches } = useBranchScope();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expiringSoon, setExpiringSoon] = useState(false);

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

  // Fetch Subscriptions
  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', { page, search, status: statusFilter, branch: branchFilter, expiringSoon }],
    queryFn: () => subscriptionsApi.list({ 
      page, 
      pageSize: 15, 
      search: search || undefined, 
      status: statusFilter || undefined,
      branchId: branchFilter || undefined,
      expiringSoon: expiringSoon || undefined
    }).then(r => r.data),
  });

  // Mutations
  const activateMut = useMutation({
    mutationFn: (id) => subscriptionsApi.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const cancelMut = useMutation({
    mutationFn: (id) => subscriptionsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const unfreezeMut = useMutation({
    mutationFn: (freezeId) => freezesApi.cancel(freezeId),
    onSuccess: () => {
      toast.success('Subscription successfully unfrozen and is now ACTIVE.');
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to unfreeze subscription.');
    }
  });

  const subs = data?.data || [];
  const meta = data?.meta;

  const daysLeft = (endDate) => {
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const filteredSubs = useMemo(() => {
    if (!expiringSoon) return subs;
    // Show only those expiring in the future (1-7 days)
    return subs.filter(s => {
      const left = daysLeft(s.endDate);
      return left > 0 && left <= 7 && s.status !== 'EXPIRED';
    });
  }, [subs, expiringSoon]);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Subscriptions" 
        subtitle="Manage member plans and session quotas" 
        breadcrumbs={[{ label: 'Subscriptions' }]}
        actions={
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-5 h-5" /> Assign Subscription
          </button>
        }
      />

      <div className="card !p-0 overflow-hidden border-slate-200">
        {/* Advanced Filters Bar */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-white">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
              <input
                type="text"
                placeholder="Search by member name, ID or phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-12 bg-slate-50 border-none rounded-[18px] pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/10 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Expiring Soon Toggle */}
            <button 
              onClick={() => { setExpiringSoon(!expiringSoon); setPage(1); }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all
                ${expiringSoon ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}
              `}
            >
              <Clock className={`w-3.5 h-3.5 ${expiringSoon ? 'animate-pulse' : ''}`} />
              Expiring Soon
            </button>

            {/* Branch Filter — hidden for branch-locked admins */}
            {!isBranchLocked && (
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-[18px] border border-slate-100 shadow-inner">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 appearance-none pr-6 uppercase tracking-widest"
                >
                  <option value="">All Branches</option>
                  {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-[18px] border border-slate-100 shadow-inner">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 appearance-none pr-6 uppercase tracking-widest"
              >
                <option value="">Status: All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <LoadingSpinner />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Active Plan Registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-8">Member</th>
                  <th className="table-header">Subscription Plan</th>
                  <th className="table-header">Validity</th>
                  <th className="table-header text-center">Sessions Remaining</th>
                  <th className="table-header text-center">Freeze Balance</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right">Term</th>
                  <th className="table-header text-right !px-8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((s) => (
                  <tr key={s.id} className="table-row group">
                    <td className="table-cell !px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all border border-slate-100 shadow-inner">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="font-black text-slate-900 leading-tight">{s.member ? `${s.member.firstName} ${s.member.lastName}` : 'Guest'}</p>
                             {s.status === 'SUSPENDED' && <Snowflake className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{s.member?.membershipNo || 'TEMP'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <span className="font-black text-slate-800 block text-sm">{s.package?.name || 'Package Archived'}</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-brand-green uppercase tracking-widest">
                           <MapPin className="w-3 h-3" /> {s.branch?.name || 'Default Branch'}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-[11px] space-y-1.5 font-bold">
                        <div className="flex items-center gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          <span>{new Date(s.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>{new Date(s.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-2.5">
                        <QuotaChip label="Class" value={s.groupClassRemaining} icon={Dumbbell} />
                        <QuotaChip label="PT" value={s.privateTrainingRemaining} icon={Activity} />
                        <QuotaChip label="Mass" value={s.massageRemaining} icon={Heart} />
                      </div>
                    </td>
                    <td className="table-cell text-center">
                        <div className="flex flex-col items-center gap-1">
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover:bg-white transition-all">
                              <Snowflake className={`w-3 h-3 ${((s.package?.freezeDaysAllowed || 0) - (s.freezeDaysUsed || 0)) > 0 ? 'text-blue-400' : 'text-slate-300'}`} />
                              <span className={`text-[11px] font-black tracking-tight ${((s.package?.freezeDaysAllowed || 0) - (s.freezeDaysUsed || 0)) > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                 {Math.max(0, (s.package?.freezeDaysAllowed || 0) - (s.freezeDaysUsed || 0))} Days
                              </span>
                           </div>
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Quota Left</p>
                        </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex flex-col items-center gap-1">
                         <StatusBadge status={s.status} />
                         {s.freezes?.some(f => f.status === 'ACTIVE') && (
                           <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded text-[8px] font-black text-blue-600 uppercase">
                              <Snowflake className="w-2.5 h-2.5" /> Frozen
                           </div>
                         )}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-base font-black ${daysLeft(s.endDate) <= 7 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>
                          {daysLeft(s.endDate)}
                        </span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Days Left</span>
                      </div>
                    </td>
                    <td className="table-cell text-right !px-8">
                      <SubscriptionActions 
                        subscription={s} 
                        isUnfreezing={unfreezeMut.isPending}
                        onViewDetails={() => { setSelectedSub(s); setIsDetailsModalOpen(true); }}
                        onFreeze={() => { setSelectedSub(s); setIsFreezeModalOpen(true); }}
                        onUnfreeze={() => {
                           const activeFreeze = s.freezes?.find(f => f.status === 'ACTIVE');
                           if (activeFreeze) unfreezeMut.mutate(activeFreeze.id);
                        }}
                        onActivate={() => activateMut.mutate(s.id)}
                        onCancel={() => cancelMut.mutate(s.id)}
                      />
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && <EmptySubscriptionsState />}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} page={page} setPage={setPage} count={subs.length} />
      </div>

      {/* ── Modals ── */}
      {isAssignModalOpen && (
        <AssignPackageModal 
          open={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['subscriptions'] });
            setIsAssignModalOpen(false);
          }}
        />
      )}

      {/* Subscription Details Modal */}
      <Modal open={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(null)} title="Subscription Insight" size="lg">
         {selectedSub && (
           <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-green">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="font-black text-slate-900">{selectedSub.member?.firstName} {selectedSub.member?.lastName}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedSub.member?.membershipNo}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <DetailItem label="Plan Name" value={selectedSub.package?.name} />
                 <DetailItem label="Status" value={selectedSub.status} />
                 <DetailItem label="Start Date" value={new Date(selectedSub.startDate).toLocaleDateString()} />
                 <DetailItem label="End Date" value={new Date(selectedSub.endDate).toLocaleDateString()} />
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                 <button onClick={() => setIsDetailsModalOpen(false)} className="btn-secondary px-8">Close</button>
              </div>
           </div>
         )}
      </Modal>

      {/* Freeze Modal */}
      <FreezeSubscriptionModal 
         open={isFreezeModalOpen}
         onClose={() => setIsFreezeModalOpen(false)}
         memberId={selectedSub?.memberId}
         initialSubscription={selectedSub}
      />
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-sm font-black text-slate-800">{value || 'N/A'}</p>
    </div>
  );
}

// ── Sub-Components ──

function QuotaChip({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col items-center p-2 bg-slate-50/80 rounded-[14px] min-w-[54px] border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
      <Icon className="w-3 h-3 text-slate-300 mb-1" />
      <span className="text-xs font-black text-slate-800">{value}</span>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

function SubscriptionActions({ subscription, onViewDetails, onFreeze, onUnfreeze, onActivate, onCancel, isUnfreezing }) {
  const [isOpen, setIsOpen] = useState(false);
  const isFrozen = subscription.status === 'SUSPENDED';

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 overflow-hidden py-2 animate-in fade-in zoom-in duration-150">
            <ActionItem icon={Eye} label="View Insight" onClick={() => { onViewDetails(); setIsOpen(false); }} />
            
            {subscription.status === 'PENDING' && (
              <ActionItem icon={Check} label="Activate Plan" onClick={() => { onActivate(); setIsOpen(false); }} />
            )}

            {!isFrozen && subscription.status === 'ACTIVE' && (
              <ActionItem icon={Snowflake} label="Freeze Plan" onClick={() => { onFreeze(); setIsOpen(false); }} />
            )}

            {isFrozen && (
              <ActionItem 
                icon={ArrowUpRight} 
                label={isUnfreezing ? 'Resuming...' : 'Unfreeze / Resume'} 
                disabled={isUnfreezing}
                onClick={() => { onUnfreeze(); setIsOpen(false); }} 
              />
            )}

            <div className="h-px bg-slate-50 my-1 mx-2" />
            <ActionItem icon={XCircle} label="Terminate Plan" variant="danger" onClick={() => { onCancel(); setIsOpen(false); }} />
          </div>
        </>
      )}
    </div>
  );
}

function ActionItem({ icon: Icon, label, onClick, variant = 'default', disabled = false }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50'}
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function EmptySubscriptionsState() {
  return (
    <tr>
      <td colSpan={7} className="py-32 text-center text-slate-300">
        <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
          <Calendar className="w-10 h-10" />
        </div>
        <p className="font-black uppercase tracking-[0.3em] text-xs">No active plan records discovered</p>
        <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase">Adjust your filters or search criteria</p>
      </td>
    </tr>
  );
}

function Pagination({ meta, page, setPage, count }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="px-10 py-5 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Plan Registry: {count} of {meta.total} records
      </p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page <= 1} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-green disabled:opacity-30 shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black text-slate-900 shadow-sm">
          {page} <span className="text-slate-300 mx-1">/</span> {meta.totalPages}
        </div>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page >= meta.totalPages} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-green disabled:opacity-30 shadow-sm transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
