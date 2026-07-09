import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceCategoriesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Folder, FileText, Hash, Activity } from 'lucide-react';

export default function EditCategoryModal({ open, onClose, category }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
        nameAr: category.nameAr || '',
        description: category.description || '',
        sortOrder: category.sortOrder || 0,
        icon: category.icon || 'dumbbell'
      });
    }
  }, [category, open, reset]);

  const watchIcon = watch('icon');

  const { data: iconsData } = useQuery({
    queryKey: ['category-icons'],
    queryFn: () => serviceCategoriesApi.getIcons().then(r => r.data.data),
    enabled: open
  });

  const icons = iconsData || [];

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        sortOrder: parseInt(data.sortOrder) || 0
      };
      return serviceCategoriesApi.update(category.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast.success('Category updated successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  });

  if (!category) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Category Details" size="lg">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-6 font-inter">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Folder className="w-3.5 h-3.5" /> Category Name (English)
            </label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.name ? 'ring-2 ring-red-100' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Folder className="w-3.5 h-3.5" /> Category Name (Arabic)
            </label>
            <input 
              {...register('nameAr')}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Select Sports Icon
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-44 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100">
            {icons.map(({ name, url }) => {
              const isSelected = watchIcon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue('icon', name)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                    isSelected 
                      ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                      : 'border-transparent bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                  }`}
                  title={name}
                >
                  <img src={url} className="w-6 h-6 object-contain" alt={name} />
                  <span className="text-[8px] font-bold uppercase truncate w-full text-center">{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Display Order
          </label>
          <input 
            type="number"
            {...register('sortOrder')}
            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Description
          </label>
          <textarea 
            {...register('description')}
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
            {mutation.isPending ? 'Saving...' : 'Update Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
