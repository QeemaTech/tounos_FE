import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import CreateServiceModal from './CreateServiceModal';
import EditServiceModal from './EditServiceModal';
import { 
  Plus, MoreHorizontal, Edit2, Trash2, 
  LayoutList, Type, DollarSign, Activity 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ServiceSetupStepper from '../../components/ui/ServiceSetupStepper';

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list().then(r => r.data),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => servicesApi.update(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update service status');
    }
  });

  const services = data?.data || [];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Services Catalog" 
        subtitle="Manage base service types, pricing, and configurations" 
        breadcrumbs={[{ label: 'Services Catalog' }]}
        actions={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-5 h-5" /> New Service
          </button>
        }
      />

      <ServiceSetupStepper activeStep={2} />

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Catalog...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-10">Service Identity</th>
                  <th className="table-header text-center">Type Segment</th>
                  <th className="table-header text-center">Base Price</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right !px-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="table-row group">
                    <td className="table-cell !px-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-inner border border-slate-100">
                          <LayoutList className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px] mt-0.5">{s.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className={`
                        inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                        ${s.serviceType === 'GROUP_CLASS' ? 'bg-blue-50 text-blue-600' : 
                          s.serviceType === 'PRIVATE_TRAINING' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}
                      `}>
                        {s.serviceType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-900">EGP {Number(s.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Standard Rate</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <StatusBadge status={s.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                    </td>
                    <td className="table-cell text-right !px-10">
                      <ServiceActions 
                        isActive={s.isActive}
                        onEdit={() => {
                          setSelectedService(s);
                          setIsEditModalOpen(true);
                        }} 
                        onToggleStatus={() => {
                          const action = s.isActive ? 'Deactivate' : 'Activate';
                          if (window.confirm(`Are you sure you want to ${action} this service?`)) {
                            toggleStatusMutation.mutate({ id: s.id, isActive: s.isActive });
                          }
                        }} 
                      />
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Activity className="w-16 h-16" />
                        <p className="font-black uppercase tracking-[0.2em] text-xs">Catalog is empty</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateServiceModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <EditServiceModal 
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        service={selectedService}
      />
    </div>
  );
}

function ServiceActions({ onEdit, onToggleStatus, isActive }) {
  return (
    <Dropdown 
      trigger={
        <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      }
    >
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
        <Edit2 className="w-4 h-4" /> Edit Details
      </button>
      <button onClick={onToggleStatus} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
        {isActive ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isActive ? 'Deactivate' : 'Reactivate'}
      </button>
    </Dropdown>
  );
}
