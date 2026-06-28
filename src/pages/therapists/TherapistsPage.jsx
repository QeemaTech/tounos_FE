import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { therapistsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import TherapistFormModal from './TherapistFormModal';
import { useBranchScope } from '../../hooks/useBranchScope';
import { 
  Plus, MoreHorizontal, Eye, Edit2, 
  Trash2, User, Mail, Heart, 
  Search, ShieldAlert, Power, MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TherapistsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { branches, isBranchLocked, defaultBranchId } = useBranchScope();
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState(defaultBranchId || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  useEffect(() => {
    if (defaultBranchId && !branchFilter) {
      setBranchFilter(defaultBranchId);
    }
  }, [defaultBranchId, branchFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ['therapists', { search, branchId: branchFilter }],
    queryFn: () => therapistsApi.list({ search, branchId: branchFilter }).then(r => r.data),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => therapistsApi.update(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      toast.success('Professional status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => therapistsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      toast.success('Therapist removed from catalog');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  const therapists = data?.data || [];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Therapist Directory" 
        subtitle="Manage recovery specialists, massage therapists, and branch allocations" 
        breadcrumbs={[{ label: 'Therapists' }]}
        actions={
          <button 
            onClick={() => { setSelectedTherapist(null); setIsModalOpen(true); }}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 !bg-blue-600 hover:!bg-blue-700"
          >
            <Plus className="w-5 h-5" /> Add Specialist
          </button>
        }
      />

      {/* Search Bar & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name, email or speciality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        {isBranchLocked ? (
          <div className="h-14 bg-blue-50 border border-blue-100 rounded-2xl px-5 flex items-center gap-3 whitespace-nowrap">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-black text-blue-700 uppercase tracking-tight">
              {branches?.[0]?.name || 'Your Branch'}
            </span>
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-widest">Auto</span>
          </div>
        ) : (
          <div className="relative min-w-[200px]">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full h-14 pl-10 pr-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer appearance-none"
            >
              <option value="">All Branches</option>
              {branches?.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Specialists...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-10">Specialist Identity</th>
                  <th className="table-header text-center">Recovery Focus</th>
                  <th className="table-header text-center">Allocated Branches</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right !px-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {therapists.map((t) => (
                  <tr key={t.id} className="table-row group">
                    <td className="table-cell !px-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all shadow-inner border border-slate-100">
                          {t.avatar ? (
                            <img src={t.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{t.firstName} {t.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{t.email || t.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100/50">
                        <Heart className="w-3.5 h-3.5 text-blue-400" />
                        {t.speciality || 'General Recovery'}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {t.branches?.map(b => (
                          <span key={b.branchId} className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {b.branch.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-3">
                        <StatusBadge status={t.isActive !== false ? 'ACTIVE' : 'SUSPENDED'} />
                        <button 
                          onClick={() => toggleStatusMutation.mutate({ id: t.id, isActive: t.isActive })}
                          className={`p-1.5 rounded-lg border border-slate-100 hover:shadow-sm transition-all ${t.isActive ? 'text-orange-500 bg-orange-50' : 'text-emerald-500 bg-emerald-50'}`}
                          title={t.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell text-right !px-10">
                      <TherapistActions 
                        onView={() => navigate(`/therapists/${t.id}`)}
                        onEdit={() => { setSelectedTherapist(t); setIsModalOpen(true); }}
                        onDelete={() => {
                          if (window.confirm('Remove specialist from system?')) {
                            deleteMutation.mutate(t.id);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {therapists.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-32 text-center text-slate-400 opacity-20">
                      <ShieldAlert className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">No therapist records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TherapistFormModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        therapist={selectedTherapist}
      />
    </div>
  );
}

function TherapistActions({ onView, onEdit, onDelete }) {
  return (
    <Dropdown 
      trigger={
        <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      }
    >
      <button onClick={onView} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
        <Eye className="w-4 h-4" /> View Profile
      </button>
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
        <Edit2 className="w-4 h-4" /> Edit Details
      </button>
      <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-4 h-4" /> Remove Therapist
      </button>
    </Dropdown>
  );
}
