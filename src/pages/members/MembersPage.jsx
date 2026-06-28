import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye, Pencil, Search, ChevronLeft, ChevronRight, Filter, Users } from 'lucide-react';
import { membersApi } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useBranchScope } from '../../hooks/useBranchScope';

export default function MembersPage() {
  const { isBranchLocked, branchFilter, setBranchFilter, branches, defaultBranchId } = useBranchScope();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['members', { page, search, status: statusFilter, branchId: branchFilter }],
    queryFn: () => membersApi.list({ page, pageSize: 15, search, status: statusFilter || undefined, branchId: branchFilter || undefined }).then(r => r.data),
  });

  const members = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Members"
        subtitle="Manage and oversee your club membership database"
        breadcrumbs={[{ label: 'Members' }]}
        actions={
          <button className="btn-primary" onClick={() => navigate('/members/new')}>
            <Plus className="w-4 h-4" /> Add Member
          </button>
        }
      />

      <div className="card p-0 flex flex-col">
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input pl-10 !bg-gray-50 border-transparent focus:!bg-white focus:border-brand-green"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-transparent">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent border-none outline-none text-xs font-bold text-gray-600 appearance-none pr-4"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {!isBranchLocked && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-transparent">
                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-xs font-bold text-gray-600 appearance-none pr-4"
                >
                  <option value="">All Branches</option>
                  {(branches || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Members Table */}
        {isLoading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Member</th>
                  <th className="table-header">ID #</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="table-row group cursor-pointer" onClick={() => navigate(`/members/${m.id}`)}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green font-bold text-sm border-2 border-white shadow-sm">
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-brand-green transition-colors">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-gray-400 font-bold tracking-tight">
                      {m.membershipNo || '—'}
                    </td>
                    <td className="table-cell font-medium text-gray-600">
                      {m.phone || '—'}
                    </td>
                    <td className="table-cell font-bold text-gray-500">
                      {m.branch?.name || '—'}
                    </td>
                    <td className="table-cell text-center">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="table-cell text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/members/${m.id}`)} className="p-2 rounded-lg hover:bg-brand-green-light text-gray-400 hover:text-brand-green">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-500">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <Users className="w-12 h-12" />
                        <p className="font-bold">No members found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Showing {members.length} of {meta.total} members
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page <= 1} 
                className="btn-secondary !p-2 !rounded-xl shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-black px-3 text-gray-900">{page}</span>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page >= meta.totalPages} 
                className="btn-secondary !p-2 !rounded-xl shadow-sm"
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
