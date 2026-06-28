import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { therapistsApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Heart, FileText, MapPin, Activity } from 'lucide-react';
import { useBranchScope } from '../../hooks/useBranchScope';

export default function TherapistFormModal({ open, onClose, therapist }) {
  const { branches, isBranchLocked, defaultBranchId } = useBranchScope({ enabled: open });
  const queryClient = useQueryClient();
  const isEdit = !!therapist;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    values: therapist ? {
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      email: therapist.email,
      phone: therapist.phone,
      speciality: therapist.speciality,
      bio: therapist.bio,
      isActive: therapist.isActive,
      branchIds: therapist.branches?.map(b => b.branchId) || []
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      speciality: '',
      bio: '',
      isActive: true,
      branchIds: defaultBranchId ? [defaultBranchId] : []
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? therapistsApi.update(therapist.id, data) : therapistsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      if (therapist) queryClient.invalidateQueries({ queryKey: ['therapist', therapist.id] });
      toast.success(isEdit ? 'Therapist profile updated' : 'Therapist successfully registered');
      onClose();
      if (!isEdit) reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modify Therapist Profile' : 'Register New Therapist'} size="xl">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-6 font-inter">
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> First Name
            </label>
            <input 
              {...register('firstName', { required: 'Required' })}
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.firstName ? 'ring-2 ring-red-100' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Last Name
            </label>
            <input 
              {...register('lastName', { required: 'Required' })}
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.lastName ? 'ring-2 ring-red-100' : ''}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Contact Email
            </label>
            <input 
              {...register('email')}
              type="email"
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input 
              {...register('phone')}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" /> Recovery Speciality
            </label>
            <input 
              {...register('speciality')}
              placeholder="e.g., Deep Tissue, Sports Recovery"
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-blue-500">
              <Activity className="w-3.5 h-3.5" /> Professional Status
            </label>
            <select 
              {...register('isActive')}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none appearance-none"
            >
              <option value={true}>Active - Accepting Sessions</option>
              <option value={false}>On Leave / Offline</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Branch Assignments
            {isBranchLocked && (
              <span className="ml-auto px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Your Branch Only</span>
            )}
          </label>
          <div className={`grid gap-3 ${branches.length > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {branches?.map(b => (
              <label key={b.id} className={`flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors border border-transparent has-[:checked]:border-blue-500/30 has-[:checked]:bg-blue-50/10 ${isBranchLocked ? 'opacity-70 pointer-events-none' : ''}`}>
                <input 
                  type="checkbox" 
                  value={b.id} 
                  {...register('branchIds')} 
                  disabled={isBranchLocked}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{b.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Therapist Background
          </label>
          <textarea 
            {...register('bio')}
            placeholder="Qualifications, certifications, and experience..."
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
            className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            {mutation.isPending ? 'Syncing...' : isEdit ? 'Update Profile' : 'Confirm Registration'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
