import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, Eye, Printer, MapPin, Filter, MoreVertical 
} from 'lucide-react';
import { ordersApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Dropdown from '../../components/ui/Dropdown';
import OrderDetailsModal from './OrderDetailsModal';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';

export default function OrdersPage() {
  const { isBranchLocked, branchFilter, setBranchFilter, branches } = useBranchScope();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 2. Fetch Orders
  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, search, status: statusFilter, branchId: branchFilter }],
    queryFn: () => ordersApi.list({ 
      page, 
      pageSize: 15, 
      search: search || undefined, 
      status: statusFilter || undefined,
      branchId: branchFilter || undefined
    }).then(r => r.data),
  });

  const confirmMut = useMutation({
    mutationFn: (id) => ordersApi.confirm(id),
    onSuccess: () => {
      toast.success('Order confirmed successfully');
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to confirm order')
  });

  const cancelMut = useMutation({
    mutationFn: (id) => ordersApi.cancel(id),
    onSuccess: () => {
      toast.success('Order cancelled and resources reverted');
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel order')
  });

  const orders = data?.data || [];
  const meta = data?.meta;

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Orders & Invoices" 
        subtitle="Track bundle checkouts and inventory sales" 
        breadcrumbs={[{ label: 'Operations' }, { label: 'Orders' }]} 
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-green transition-colors" />
              <input 
                type="text" 
                placeholder="Search by ID, member or invoice..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isBranchLocked && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-transparent">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-[11px] font-black text-slate-600 appearance-none pr-4"
                >
                  <option value="">All Branches</option>
                  {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={statusFilter} 
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
                className="h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-brand-green/10 outline-none cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member & Branch</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bundle Items</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-tighter">#{o.id?.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{o.member ? `${o.member.firstName} ${o.member.lastName}` : '—'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {o.branch?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900">EGP {Number(o.totalAmount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {o.package && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Plan</span>}
                        {o.items?.length > 0 && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">{o.items.length} Add-ons</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewOrder(o)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-green hover:border-brand-green/30 transition-all shadow-sm"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {o.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => confirmMut.mutate(o.id)}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                              title="Mark Paid"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => cancelMut.mutate(o.id)}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                              title="Cancel Order"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="py-24 text-center">
                <Filter className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No order matches found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p-1))} 
                disabled={page <= 1} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => p+1)} 
                disabled={page >= meta.totalPages} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailsModal 
        open={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        order={selectedOrder} 
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
