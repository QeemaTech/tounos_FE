import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import PackageModal from './PackageModal';
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Check, Package as PackageIcon, Snowflake, 
  Clock, ShieldAlert, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PackagesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packagesApi.list().then(r => r.data),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => packagesApi.update(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package status synchronized');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => packagesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package removed from catalog');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  });

  const packages = data?.data || [];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Membership Catalog" 
        subtitle="Configure pricing tiers, session quotas, and freeze allowances" 
        breadcrumbs={[{ label: 'Packages' }]}
        actions={
          <button 
            onClick={() => { setSelectedPackage(null); setIsModalOpen(true); }}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-5 h-5" /> New Package
          </button>
        }
      />

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <LoadingSpinner />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group overflow-hidden ${!pkg.isActive ? 'opacity-60 grayscale' : ''}`}
            >
              {/* Status Indicator */}
              <div className="absolute top-0 right-0 p-10">
                <Dropdown 
                  trigger={
                    <button className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  }
                >
                  <button onClick={() => { setSelectedPackage(pkg); setIsModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit Plan
                  </button>
                  <button onClick={() => toggleStatusMutation.mutate({ id: pkg.id, isActive: pkg.isActive })} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${pkg.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                    <Zap className="w-4 h-4" /> {pkg.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => { if(window.confirm('Erase this package from history?')) deleteMutation.mutate(pkg.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Erase Package
                  </button>
                </Dropdown>
              </div>

              <div className="space-y-8">
                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6">
                    <PackageIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-brand-green transition-colors">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{pkg.durationDays} Days Tenure</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">EGP {Number(pkg.price).toLocaleString()}</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">/ Total</span>
                </div>

                <div className="space-y-4 pt-8 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entitlements Included</p>
                  <div className="space-y-3">
                    {pkg.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{f.feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8">
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-xs font-black text-slate-900">{pkg.groupClassQuota}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Classes</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-xs font-black text-slate-900">{pkg.privateTrainingQuota}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">PT Session</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-xs font-black text-slate-900">{pkg.massageQuota}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Massage</p>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/5 rounded-xl text-brand-green">
                    <Snowflake className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {pkg.freezeDaysAllowed > 0 ? `${pkg.freezeDaysAllowed} Days Freeze` : 'No Freezing'}
                    </span>
                  </div>
                  <StatusBadge status={pkg.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                </div>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full py-32 text-center text-slate-400 opacity-20">
              <ShieldAlert className="w-20 h-20 mx-auto mb-4" />
              <p className="font-black uppercase tracking-[0.3em] text-sm">Membership catalog is empty</p>
            </div>
          )}
        </div>
      )}

      <PackageModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        pkg={selectedPackage}
      />
    </div>
  );
}
