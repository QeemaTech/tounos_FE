import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, ChevronLeft, ChevronRight, Wallet, Clock, XCircle, 
  Filter, CreditCard, Calendar, MoreHorizontal, Eye, Check, 
  RefreshCcw, Plus, MapPin, Download, FileText, User
} from 'lucide-react';
import { paymentsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/charts/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import RecordPaymentModal from './RecordPaymentModal';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';
import { PortalDropdown } from '../../components/ui/PortalDropdown';

export default function PaymentsPage() {
  const { isBranchLocked, branchFilter, setBranchFilter, branches } = useBranchScope();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Fetch Payments with advanced filters
  const { data, isLoading } = useQuery({
    queryKey: ['payments', { page, search, status: statusFilter, branch: branchFilter, method: methodFilter, ...dateRange }],
    queryFn: () => paymentsApi.list({ 
      page, 
      pageSize: 15, 
      search: search || undefined, 
      status: statusFilter || undefined,
      branchId: branchFilter || undefined,
      method: methodFilter || undefined,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined
    }).then(r => r.data),
  });

  const payments = data?.data || [];
  const meta = data?.meta;

  // Mutations
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => paymentsApi.update(id, data),
    onSuccess: () => {
      toast.success('Transaction updated successfully');
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const markPaidMut = useMutation({
    mutationFn: (id) => paymentsApi.markPaid(id),
    onSuccess: () => {
      toast.success('Transaction marked as PAID');
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const refundMut = useMutation({
    mutationFn: (id) => paymentsApi.refund(id),
    onSuccess: () => {
      toast.success('Transaction successfully refunded');
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Refund failed')
  });

  // Summary logic
  const summary = useMemo(() => {
    return {
      totalPaid: payments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount || 0), 0),
      pending: payments.filter(p => p.status === 'PENDING').length,
      failed: payments.filter(p => ['FAILED', 'REFUNDED'].includes(p.status)).length,
    };
  }, [payments]);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Payments & Ledger" 
        subtitle="Financial records and transaction history" 
        breadcrumbs={[{ label: 'Payments' }]} 
        actions={
          <button 
            onClick={() => setIsRecordModalOpen(true)}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-5 h-5" /> Record Payment
          </button>
        }
      />

      {/* ── Summary Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          title="Period Revenue" 
          value={`EGP ${summary.totalPaid.toLocaleString()}`} 
          icon={Wallet} 
          featured 
          change="Real-time filtered total"
          trend="up"
        />
        <StatCard 
          title="Pending Collection" 
          value={summary.pending} 
          icon={Clock} 
          change="Awaiting confirmation" 
          trend="down"
        />
        <StatCard 
          title="Reversed/Failed" 
          value={summary.failed} 
          icon={XCircle} 
          change="Audit required" 
          trend="down"
        />
      </div>

      <div className="card !p-0 overflow-hidden border-slate-200">
        {/* ── Advanced Filters Bar ── */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                <input
                  type="text"
                  placeholder="Search member, ID or transaction ref..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full h-12 bg-slate-50 border-none rounded-[18px] pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/10 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range */}
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-[18px] border border-slate-100 shadow-inner">
                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
                 <input 
                   type="date" 
                   value={dateRange.start} 
                   onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setPage(1); }}
                   className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 uppercase"
                 />
                 <span className="text-slate-300 mx-1">/</span>
                 <input 
                   type="date" 
                   value={dateRange.end} 
                   onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setPage(1); }}
                   className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 uppercase"
                 />
              </div>

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

              {/* Method Filter */}
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-[18px] border border-slate-100 shadow-inner">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={methodFilter}
                  onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 appearance-none pr-6 uppercase tracking-widest"
                >
                  <option value="">All Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-[18px] border border-slate-100 shadow-inner">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 appearance-none pr-6 uppercase tracking-widest"
                >
                  <option value="">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <LoadingSpinner />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Ledger History...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-8">Member</th>
                  <th className="table-header text-right">Amount</th>
                  <th className="table-header text-center">Method</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header">Reference</th>
                  <th className="table-header text-right">Date</th>
                  <th className="table-header text-right !px-8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="table-row group">
                    <td className="table-cell !px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all border border-slate-100 shadow-inner">
                           <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">
                            {p.member ? `${p.member.firstName} ${p.member.lastName}` : 'System / Manual'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{p.member?.membershipNo || 'TRN-REC'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-900 text-base">EGP {Number(p.amount).toLocaleString()}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Settlement Value</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover:bg-white transition-all">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{p.method || 'CASH'}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-500 font-mono truncate max-w-[150px]">{p.transactionRef || 'NO-REF'}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                           <MapPin className="w-2.5 h-2.5 text-slate-300" />
                           <span className="text-[9px] font-black text-slate-300 uppercase">{p.branch?.name || 'Main Office'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-slate-700">{new Date(p.createdAt).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="table-cell text-right !px-8">
                       <PaymentActions 
                         payment={p}
                         isProcessing={updateMut.isPending || markPaidMut.isPending || refundMut.isPending}
                         onView={() => { setSelectedPayment(p); setIsReceiptModalOpen(true); }}
                         onMarkPaid={() => markPaidMut.mutate(p.id)}
                         onRefund={() => {
                           if(confirm('Are you sure you want to issue a refund for this transaction? This action is permanent.')) {
                             refundMut.mutate(p.id);
                           }
                         }}
                         onStatusChange={(status) => updateMut.mutate({ id: p.id, data: { status } })}
                       />
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && <EmptyPaymentsState />}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} page={page} setPage={setPage} count={payments.length} />
      </div>

      {/* ── Modals ── */}
      <RecordPaymentModal 
        open={isRecordModalOpen} 
        onClose={() => setIsRecordModalOpen(false)} 
      />

      {/* Receipt / Details Modal */}
      <Modal open={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Financial Receipt Details" size="md">
         {selectedPayment && (
           <div className="p-8 space-y-6 font-inter">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                    <p className="text-sm font-black text-slate-800">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                 </div>
                 <StatusBadge status={selectedPayment.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <ReceiptItem label="Amount Settled" value={`EGP ${Number(selectedPayment.amount).toLocaleString()}`} icon={Wallet} />
                 <ReceiptItem label="Payment Method" value={selectedPayment.method} icon={CreditCard} />
                 <ReceiptItem label="Member Name" value={selectedPayment.member ? `${selectedPayment.member.firstName} ${selectedPayment.member.lastName}` : 'N/A'} icon={User} />
                 <ReceiptItem label="Branch" value={selectedPayment.branch?.name} icon={MapPin} />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Audit Notes
                 </p>
                 <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                    {selectedPayment.notes || "No internal notes provided for this transaction."}
                 </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                 <button className="flex-1 btn-secondary !rounded-xl text-[10px] font-black flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export PDF
                 </button>
                 <button onClick={() => setIsReceiptModalOpen(false)} className="flex-1 btn-primary !rounded-xl text-[10px] font-black">
                    Close Receipt
                 </button>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
}

// ── Sub-Components ──

function PaymentActions({ payment, onView, onMarkPaid, onRefund, onStatusChange, isProcessing }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const isPending = payment.status === 'PENDING';
  const isPaid = payment.status === 'PAID';

  const statuses = ['PAID', 'PENDING', 'REFUNDED', 'FAILED'];

  const closeAll = () => {
    setShowStatusMenu(false);
    // Ideally we trigger a close on PortalDropdown here, but for now we rely on the overlay.
    // Hack: trigger click on overlay to close PortalDropdown
    document.getElementById('portal-overlay')?.click();
  };

  const trigger = (
    <button 
      onClick={() => setShowStatusMenu(false)}
      className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
    >
      <MoreHorizontal className="w-5 h-5" />
    </button>
  );

  return (
    <div className="relative inline-block text-left">
      <PortalDropdown trigger={trigger}>
        <div className="w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-150">
            <ActionItem icon={Eye} label="View Receipt" onClick={() => { onView(); closeAll(); }} />
            
            <div className="h-px bg-slate-50 my-1 mx-2" />

            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-4 h-4" />
                  Change Status
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
              </button>

              {showStatusMenu && (
                <div className="absolute right-full top-0 mr-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                  {statuses.map(s => (
                    <button
                      key={s}
                      disabled={payment.status === s || isProcessing}
                      onClick={() => { onStatusChange(s); closeAll(); }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors
                        ${payment.status === s ? 'text-brand-green bg-brand-green/5' : 'text-slate-500 hover:bg-slate-50'}
                        ${isProcessing ? 'opacity-50' : ''}
                      `}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${payment.status === s ? 'bg-brand-green' : 'bg-slate-200'}`} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-50 my-1 mx-2" />

            {isPending && (
              <ActionItem 
                icon={Check} 
                label={isProcessing ? 'Processing...' : 'Mark as Paid'} 
                disabled={isProcessing}
                onClick={() => { onMarkPaid(); closeAll(); }} 
              />
            )}

            {isPaid && (
              <ActionItem 
                icon={XCircle} 
                label={isProcessing ? 'Refunding...' : 'Issue Refund'} 
                variant="danger" 
                disabled={isProcessing}
                onClick={() => { onRefund(); closeAll(); }} 
              />
            )}
        </div>
      </PortalDropdown>
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

function ReceiptItem({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icon className="w-3 h-3" /> {label}
       </p>
       <p className="text-sm font-black text-slate-800">{value || '—'}</p>
    </div>
  );
}

function EmptyPaymentsState() {
  return (
    <tr>
      <td colSpan={7} className="py-32 text-center text-slate-300">
        <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
          <Wallet className="w-10 h-10" />
        </div>
        <p className="font-black uppercase tracking-[0.3em] text-xs">No financial records discovered</p>
        <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase">Try adjusting your filters or date range</p>
      </td>
    </tr>
  );
}

function Pagination({ meta, page, setPage, count }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="px-10 py-5 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Audit Log: {count} of {meta.total} records
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