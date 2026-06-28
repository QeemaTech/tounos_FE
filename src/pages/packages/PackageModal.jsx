import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { 
  Package as PackageIcon, DollarSign, Calendar, 
  Dumbbell, UserCheck, Heart, Snowflake, 
  Plus, Trash2, ListChecks, Activity
} from 'lucide-react';

export default function PackageModal({ open, onClose, pkg }) {
  const queryClient = useQueryClient();
  const isEdit = !!pkg;

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      price: '',
      durationDays: '',
      groupClassQuota: 0,
      privateTrainingQuota: 0,
      massageQuota: 0,
      freezeDaysAllowed: 0,
      isActive: true,
      features: [{ feature: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features"
  });

  useEffect(() => {
    if (pkg && open) {
      reset({
        name: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
        groupClassQuota: pkg.groupClassQuota,
        privateTrainingQuota: pkg.privateTrainingQuota,
        massageQuota: pkg.massageQuota,
        freezeDaysAllowed: pkg.freezeDaysAllowed,
        isActive: pkg.isActive,
        features: pkg.features?.length > 0 ? pkg.features.map(f => ({ feature: f.feature })) : [{ feature: '' }]
      });
    } else if (open) {
      reset({
        name: '',
        price: '',
        durationDays: '',
        groupClassQuota: 0,
        privateTrainingQuota: 0,
        massageQuota: 0,
        freezeDaysAllowed: 0,
        isActive: true,
        features: [{ feature: '' }]
      });
    }
  }, [pkg, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        durationDays: parseInt(data.durationDays),
        groupClassQuota: parseInt(data.groupClassQuota),
        privateTrainingQuota: parseInt(data.privateTrainingQuota),
        massageQuota: parseInt(data.massageQuota),
        freezeDaysAllowed: parseInt(data.freezeDaysAllowed),
        features: data.features.filter(f => f.feature.trim() !== '')
      };
      return isEdit ? packagesApi.update(pkg.id, payload) : packagesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(isEdit ? 'Package updated' : 'New package created');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modify Membership Plan' : 'Design New Membership'} size="xl">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-8 font-inter overflow-y-auto max-h-[80vh]">
        
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <PackageIcon className="w-3.5 h-3.5" /> Essential Parameters
          </h4>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Designation</label>
              <input 
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Diamond Annual Membership"
                className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.name ? 'ring-2 ring-red-100' : ''}`}
              />
            </div>
            <div className="col-span-6 lg:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Rate (EGP)
              </label>
              <input 
                type="number" step="0.01"
                {...register('price', { required: true })}
                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
              />
            </div>
            <div className="col-span-6 lg:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Tenure (Days)
              </label>
              <input 
                type="number"
                {...register('durationDays', { required: true })}
                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quotas & Entitlements */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5" /> Session Entitlements
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5" /> Group Classes
              </label>
              <input type="number" {...register('groupClassQuota')} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5" /> PT Sessions
              </label>
              <input type="number" {...register('privateTrainingQuota')} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" /> Massage
              </label>
              <input type="number" {...register('massageQuota')} className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
                <Snowflake className="w-3.5 h-3.5" /> Freeze Days
              </label>
              <input type="number" {...register('freezeDaysAllowed')} className="w-full h-14 bg-brand-green/5 border-none rounded-2xl px-5 text-sm font-black text-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none" />
            </div>
          </div>
        </div>

        {/* Features Dynamic Array */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Marketing Features
            </h4>
            <button 
              type="button" 
              onClick={() => append({ feature: '' })}
              className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-brand-green hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative group">
                <input 
                  {...register(`features.${index}.feature`)}
                  placeholder="Feature point..."
                  className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 pr-12 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-800">Operational Status</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toggle availability for new subscriptions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('isActive')} className="sr-only peer" />
            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-green"></div>
          </label>
        </div>

        <div className="pt-6 flex items-center gap-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-[2] h-14 bg-brand-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark hover:-translate-y-0.5 transition-all"
          >
            {mutation.isPending ? 'Persisting...' : isEdit ? 'Update Membership' : 'Finalize Package'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
