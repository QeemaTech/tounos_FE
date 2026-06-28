import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classesApi, servicesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Box, Clock, Users, Layers, Activity } from 'lucide-react';

export default function CreateClassModal({ open, onClose, classToEdit = null }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      serviceId: '',
      duration: 60,
      capacity: 20,
      level: 'BEGINNER',
      isActive: true,
      description: ''
    }
  });

  // Fetch Services (Filtered by Group Class type)
  const { data: services } = useQuery({
    queryKey: ['services-group-classes'],
    queryFn: () => servicesApi.list({ serviceType: 'GROUP_CLASS', pageSize: 100 }).then(r => r.data.data),
    enabled: open
  });

  useEffect(() => {
    if (open) {
      if (classToEdit) {
        reset({
          name: classToEdit.name,
          serviceId: classToEdit.serviceId,
          duration: classToEdit.duration,
          capacity: classToEdit.capacity,
          level: classToEdit.level || 'BEGINNER',
          isActive: classToEdit.isActive,
          description: classToEdit.description || ''
        });
      } else {
        reset({
          name: '',
          serviceId: '',
          duration: 60,
          capacity: 20,
          level: 'BEGINNER',
          isActive: true,
          description: ''
        });
      }
    }
  }, [open, classToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (data) => classToEdit 
      ? classesApi.update(classToEdit.id, data)
      : classesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] });
      toast.success(`Class ${classToEdit ? 'updated' : 'created'} successfully`);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed')
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      duration: Number(data.duration),
      capacity: Number(data.capacity)
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={classToEdit ? "Edit Group Class" : "Create New Group Class"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 font-inter">
        
        <div className="grid grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2 col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Box className="w-3 h-3" /> Class Name
            </label>
            <input 
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Morning Yoga Flow"
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
            {errors.name && <p className="text-[10px] text-red-500 font-black uppercase">{errors.name.message}</p>}
          </div>

          {/* Linked Service */}
          <div className="space-y-2 col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-3 h-3" /> Linked Service (Catalog)
            </label>
            <select
              {...register('serviceId', { required: 'Service mapping is required' })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value="">Select Service Type...</option>
              {services?.map(s => <option key={s.id} value={s.id}>{s.name} (EGP {s.price})</option>)}
            </select>
            {errors.serviceId && <p className="text-[10px] text-red-500 font-black uppercase">{errors.serviceId.message}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" /> Duration (Min)
            </label>
            <input 
              type="number"
              {...register('duration', { required: true, min: 1 })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Users className="w-3 h-3" /> Max Capacity
            </label>
            <input 
              type="number"
              {...register('capacity', { required: true, min: 1 })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
          </div>

          {/* Level */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Layers className="w-3 h-3" /> Difficulty Level
            </label>
            <select
              {...register('level')}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="PRO">PRO ATHLETE</option>
            </select>
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</label>
            <select
              {...register('isActive')}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class Description</label>
          <textarea 
            {...register('description')}
            placeholder="What should members expect? Rules, requirements..."
            className="w-full h-24 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 resize-none"
          />
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-[2] h-12 bg-brand-green text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-green/20 hover:bg-brand-green-dark transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Processing...' : (classToEdit ? 'Save Changes' : 'Create Class')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
