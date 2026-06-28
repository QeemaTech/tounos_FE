import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, MessageSquare, MapPin, Filter, MoreVertical, AlertTriangle } from 'lucide-react';
import { supportApi, branchesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export default function SupportTicketsPage() {
  const navigate = useNavigate();
  const { isSuperAdmin, defaultBranchId } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(defaultBranchId || '');

  // 2. Fetch Branches (For dropdown list)
  const { data: branches, isLoading: loadingBranches } = useQuery({
    queryKey: ['branches-list-simple'],
    queryFn: () => branchesApi.list({ pageSize: 100 }).then(r => r.data.data),
    // If not super admin, we might only want to show their branches, 
    // but the API might already be restricted. Let's fetch all for super admin.
  });

  // 3. Fetch Tickets
  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets', { page, status: statusFilter, priority: priorityFilter, branchId: branchFilter }],
    queryFn: () => supportApi.list({ 
      page, 
      pageSize: 15, 
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      branchId: branchFilter || undefined
    }).then(r => r.data),
    // Security: even if the user tries to change branchFilter in state, 
    // the backend service we updated earlier will block unauthorized branchId.
  });

  const tickets = data?.data || [];
  const meta = data?.meta;

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Support & Inquiries" 
        subtitle="Manage member tickets across all branches" 
        breadcrumbs={[{ label: 'Operations' }, { label: 'Support' }]} 
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
            {/* Branch Filter */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={branchFilter} 
                disabled={!!defaultBranchId}
                onChange={e => { setBranchFilter(e.target.value); setPage(1); }} 
                className="h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-brand-green/10 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {!defaultBranchId && <option value="">All Branches</option>}
                {loadingBranches ? (
                  <option disabled>Loading branches...</option>
                ) : (
                  branches?.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={statusFilter} 
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
                className="h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-brand-green/10 outline-none cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <AlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={priorityFilter} 
                onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} 
                className="h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-2 focus:ring-brand-green/10 outline-none cursor-pointer"
              >
                <option value="">Priority: All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject / Issue</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map(t => (
                  <tr 
                    key={t.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/support/${t.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-tighter">#{t.id?.slice(0, 6)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                          {t.member?.firstName?.[0]}{t.member?.lastName?.[0]}
                        </div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{t.member ? `${t.member.firstName} ${t.member.lastName}` : '—'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{t.subject}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <MessageSquare className="w-2.5 h-2.5" /> {t._count?.messages || 0} messages
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(t.priority)}
                        <StatusBadge status={t.priority} />
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-bold text-slate-500">{new Date(t.updatedAt).toLocaleDateString('en-GB')}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tickets.length === 0 && (
              <div className="py-24 text-center">
                <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No support tickets found</p>
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
