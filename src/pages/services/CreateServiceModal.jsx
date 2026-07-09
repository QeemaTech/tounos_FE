import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi, serviceCategoriesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { LayoutList, DollarSign, Type, FileText, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateServiceModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch Categories (Global Catalog)
  const { data: categories } = useQuery({
    queryKey: ['service-categories-list'],
    queryFn: () => serviceCategoriesApi.list().then(r => r.data.data),
    enabled: open
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      nameAr: '',
      categoryId: '',
      description: '',
      serviceType: 'GROUP_CLASS',
      price: '',
      duration: 60
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        name: data.name,
        nameAr: data.nameAr || "",
        categoryId: data.categoryId,
        serviceType: data.serviceType,
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        duration: parseInt(data.duration) || 60
      };
      return servicesApi.create(payload);
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      
      if (variables.serviceType === 'GROUP_CLASS') {
        toast.success('Global Service created! Redirecting to configure class schedules...', {
          icon: '🚀',
          duration: 4000
        });
        navigate('/classes?tab=classes');
      } else if (variables.serviceType === 'PRIVATE_TRAINING') {
        toast.success('Global Service created! Redirecting to manage trainers...', {
          icon: '💪',
          duration: 4000
        });
        navigate('/trainers');
      } else if (variables.serviceType === 'MASSAGE') {
        toast.success('Global Service created! Redirecting to manage therapists...', {
          icon: '💆‍♀️',
          duration: 4000
        });
        navigate('/therapists');
      } else {
        toast.success('Global Service created and added to catalog!');
      }

      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to register service');
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Define Global Catalog Service" size="lg">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-6 font-inter">
        
        <div className="grid grid-cols-2 gap-6">
          {/* Service Name (English) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutList className="w-3.5 h-3.5" /> Service Name (English)
            </label>
            <input 
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., HIIT Session"
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.name ? 'ring-2 ring-red-100' : ''}`}
            />
          </div>

          {/* Service Name (Arabic) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutList className="w-3.5 h-3.5" /> Service Name (Arabic)
            </label>
            <input 
              {...register('nameAr')}
              placeholder="مثال: حصة تدريب عالي الكثافة"
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Folder className="w-3.5 h-3.5" /> Catalog Category
            </label>
            <select 
              {...register('categoryId', { required: 'Category is required' })}
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none appearance-none ${errors.categoryId ? 'ring-2 ring-red-100' : ''}`}
            >
              <option value="">Select Category...</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> Segment Type
            </label>
            <select 
              {...register('serviceType', { required: true })}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none appearance-none"
            >
              <option value="GROUP_CLASS">Group Class</option>
              <option value="PRIVATE_TRAINING">Private Training</option>
              <option value="MASSAGE">Massage</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Duration */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Standard Duration (Min)
            </label>
            <input 
              type="number"
              {...register('duration', { required: true })}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" /> Global Base Price (EGP)
            </label>
            <input 
              type="number"
              step="0.01"
              {...register('price', { required: 'Price is required' })}
              placeholder="0.00"
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.price ? 'ring-2 ring-red-100' : ''}`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Service Details
          </label>
          <textarea 
            {...register('description')}
            placeholder="Outline the global service scope..."
            className="w-full h-32 bg-slate-50 border-none rounded-[24px] px-5 py-4 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none resize-none"
          />
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
            {mutation.isPending ? 'Propagating...' : 'Register Global Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
