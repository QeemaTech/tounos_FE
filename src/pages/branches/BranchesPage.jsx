import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, MapPin, Phone, Clock, 
  Users, UserCheck, Dumbbell, MoreVertical, 
  Edit2, Trash2, Globe, ExternalLink, ChevronRight,
  ShieldCheck, AlertCircle, Building2, Mail, CheckCircle2,
  X
} from 'lucide-react';
import { branchesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { toast } from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

const BranchCard = ({ branch, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
            </div>
            <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{branch.name}</h3>
                <p className="text-sm font-bold text-slate-400 font-noto-sans-arabic">{branch.nameAr || '—'}</p>
            </div>
        </div>
        <StatusBadge status={branch.isActive ? 'ACTIVE' : 'SUSPENDED'} />
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold truncate">{branch.address || 'Location not set'}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                <Phone className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{branch.phone || 'No phone'}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">
                {branch.openingTime ? `${branch.openingTime} - ${branch.closingTime}` : 'Hours not set'}
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-50 rounded-2xl p-3 text-center border border-transparent hover:border-slate-200 transition-colors">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Members</p>
            <p className="text-sm font-black text-slate-800">{branch._count?.members || 0}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-transparent hover:border-emerald-200 transition-colors">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-tighter mb-1">Active Subs</p>
            <p className="text-sm font-black text-emerald-700">{branch._count?.subscriptions || 0}</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-3 text-center border border-transparent hover:border-indigo-200 transition-colors">
            <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-tighter mb-1">Trainers</p>
            <p className="text-sm font-black text-indigo-700">{branch._count?.trainers || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex gap-2">
            <button onClick={() => onEdit(branch)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Edit Facility">
                <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(branch.id)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all" title="Remove Facility">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:gap-3 transition-all">
            View Analytics <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default function BranchesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  // Robust query handling for the wrapped response structure
  const { data: response, isLoading } = useQuery({
    queryKey: ['branches-rich', search],
    queryFn: () => branchesApi.list({ search, pageSize: 100 }).then(r => r.data),
  });

  const branches = useMemo(() => {
      // The response structure is { success, data: { data: items, pagination } }
      // So r.data.data is the array
      return response?.data?.data || response?.data || [];
  }, [response]);

  const activeCount = useMemo(() => branches.filter(b => b.isActive).length, [branches]);

  const deleteMut = useMutation({
    mutationFn: (id) => branchesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches-rich'] });
      toast.success('Facility node decommissioned successfully');
    },
    onError: (err) => {
        console.error('Delete Error:', err);
        toast.error(err.response?.data?.message || 'Failed to remove branch');
    }
  });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) => id 
        ? branchesApi.update(id, payload)
        : branchesApi.create(payload),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['branches-rich'] });
        setIsModalOpen(false);
        setEditingBranch(null);
        toast.success(editingBranch ? 'Branch architecture updated' : 'New facility established', {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        });
    },
    onError: (err) => {
        console.error('Save Error:', err);
        const serverError = err.response?.data?.error?.message || err.response?.data?.message || 'Operation failed';
        toast.error(serverError);
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
        name: formData.get('name'),
        nameAr: formData.get('nameAr'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        openingTime: formData.get('openingTime'),
        closingTime: formData.get('closingTime'),
        isActive: formData.get('isActive') === 'on'
    };

    saveMut.mutate({ 
        id: editingBranch?.id, 
        payload 
    });
  };

  if (isLoading) return <div className="py-32 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-inter pb-20 max-w-[1600px] mx-auto px-4 lg:px-8">
      <PageHeader 
        title="Infrastructure Control" 
        subtitle="Operational monitoring and facility lifecycle management" 
        breadcrumbs={[{ label: 'System' }, { label: 'Branches' }]} 
        actions={
          <button 
            onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
            className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3"
          >
            <Plus className="w-4 h-4" /> Establish Facility
          </button>
        }
      />

      <div className="max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city or address..." 
          className="w-full h-14 bg-white border border-slate-100 rounded-[20px] pl-12 pr-6 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
        />
      </div>

      {!branches || branches.length === 0 ? (
          <div className="py-32 bg-slate-50 rounded-[40px] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                  <Building2 className="w-10 h-10" />
              </div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">No Facilities Found</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Adjust search parameters or establish a new node</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map(branch => (
              <BranchCard 
                key={branch.id} 
                branch={branch} 
                onEdit={(b) => { setEditingBranch(b); setIsModalOpen(true); }}
                onDelete={(id) => { if(window.confirm('WARNING: Decommissioning this facility will affect all related operations. Continue?')) deleteMut.mutate(id); }}
              />
            ))}
          </div>
      )}

      {/* Stats Banner */}
      <div className="bg-slate-900 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between text-white gap-8 shadow-2xl shadow-slate-900/20 overflow-hidden relative border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="flex gap-6 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    Network Resilience
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] border border-emerald-500/20 uppercase">Stable</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-branch data synchronization is encrypted and active</p>
              </div>
          </div>
          <div className="flex gap-16 relative z-10 mr-8">
              <div className="text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Nodes</p>
                  <p className="text-3xl font-black text-white">{branches.length}</p>
              </div>
              <div className="text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Active Capacity</p>
                  <p className="text-3xl font-black text-emerald-400">{activeCount}</p>
              </div>
          </div>
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingBranch(null); }} 
        title={editingBranch ? 'Edit Infrastructure Node' : 'Establish New Facility'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Branch Name (EN)</label>
                    <input name="name" defaultValue={editingBranch?.name} required className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Maadi Branch" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Arabic Name</label>
                    <input name="nameAr" defaultValue={editingBranch?.nameAr} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold font-noto-sans-arabic text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="فرع المعادي" />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Physical Address</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="address" defaultValue={editingBranch?.address} className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="123 Street, City, Country" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="phone" defaultValue={editingBranch?.phone} className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="+20 123..." />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="email" type="email" defaultValue={editingBranch?.email} className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="branch@tonus.com" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Opening Time</label>
                    <input name="openingTime" type="time" defaultValue={editingBranch?.openingTime} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Closing Time</label>
                    <input name="closingTime" type="time" defaultValue={editingBranch?.closingTime} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Node Status</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Enable/Disable branch operations</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        name="isActive"
                        defaultChecked={editingBranch ? editingBranch.isActive : true} 
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                </label>
            </div>

            <button 
                type="submit"
                disabled={saveMut.isPending}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 mt-4 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
                {saveMut.isPending ? <LoadingSpinner size="sm" /> : editingBranch ? 'Update Infrastructure Node' : 'Establish Facility Node'}
            </button>
        </form>
      </Modal>
    </div>
  );
}
