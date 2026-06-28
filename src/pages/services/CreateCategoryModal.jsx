import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceCategoriesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Folder, FileText, Hash } from 'lucide-react';

export default function CreateCategoryModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        sortOrder: parseInt(data.sortOrder) || 0
      };
      return serviceCategoriesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast.success('Logical Category created successfully');
      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="New Logical Category" size="lg">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-6 font-inter">
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Folder className="w-3.5 h-3.5" /> Category Name
          </label>
          <input 
            {...register('name', { required: 'Name is required' })}
            placeholder="e.g., Wellness & Recovery, Combat Sports"
            className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.name ? 'ring-2 ring-red-100' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Display Order
          </label>
          <input 
            type="number"
            {...register('sortOrder')}
            placeholder="0"
            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Brief Description
          </label>
          <textarea 
            {...register('description')}
            placeholder="What services fall under this category?"
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
            {mutation.isPending ? 'Processing...' : 'Establish Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
