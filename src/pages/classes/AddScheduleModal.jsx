import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classesApi, trainersApi, schedulesApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, MapPin, Box } from 'lucide-react';
import { useBranchScope } from '../../hooks/useBranchScope';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function AddScheduleModal({ open, onClose, scheduleToEdit = null, initialBranchId = '' }) {
  const { branches, isBranchLocked, defaultBranchId } = useBranchScope({ enabled: open });
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      classId: '',
      trainerId: '',
      branchId: '',
      dayOfWeek: 'MONDAY',
      startTime: '10:00',
      endTime: '11:00',
      capacity: 20
    }
  });

  // Data Fetching for Selects
  const { data: classes } = useQuery({
    queryKey: ['classes-list'],
    queryFn: () => classesApi.list({ pageSize: 100 }).then(r => r.data.data),
    enabled: open
  });

  const { data: trainers } = useQuery({
    queryKey: ['trainers-list'],
    queryFn: () => trainersApi.list({ pageSize: 100 }).then(r => r.data.data),
    enabled: open
  });

  useEffect(() => {
    if (open) {
      if (scheduleToEdit) {
        reset({
          classId: scheduleToEdit.classId,
          trainerId: scheduleToEdit.trainerId || '',
          branchId: scheduleToEdit.branchId,
          dayOfWeek: scheduleToEdit.dayOfWeek,
          startTime: scheduleToEdit.startTime,
          endTime: scheduleToEdit.endTime,
          capacity: scheduleToEdit.capacity
        });
      } else {
        reset({
          classId: '',
          trainerId: '',
          branchId: initialBranchId || defaultBranchId || '',
          dayOfWeek: 'MONDAY',
          startTime: '10:00',
          endTime: '11:00',
          capacity: 20
        });
      }
    }
  }, [open, scheduleToEdit, reset, initialBranchId]);

  const mutation = useMutation({
    mutationFn: (data) => scheduleToEdit 
      ? schedulesApi.update(scheduleToEdit.id, data)
      : schedulesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success(`Schedule slot ${scheduleToEdit ? 'updated' : 'added'} successfully`);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed')
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      capacity: Number(data.capacity)
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={scheduleToEdit ? "Edit Schedule Slot" : "Add Weekly Schedule Slot"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 font-inter">
        
        <div className="grid grid-cols-2 gap-6">
          {/* Class Selection */}
          <div className="space-y-2 col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Box className="w-3 h-3" /> Select Group Class
            </label>
            <select
              {...register('classId', { required: 'Class is required' })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value="">Choose Class...</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Branch Selection — 3 modes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Branch
            </label>
            {isBranchLocked ? (
              <div className="h-12 bg-blue-50 border border-blue-100 rounded-xl px-4 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-black text-blue-700 uppercase tracking-tight">
                  {branches?.[0]?.name || 'Your Branch'}
                </span>
                <span className="ml-auto text-[9px] font-black text-blue-400 uppercase tracking-widest">Auto</span>
                <input type="hidden" {...register('branchId')} />
              </div>
            ) : (
              <select
                {...register('branchId', { required: 'Branch is required' })}
                className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
              >
                <option value="">Choose Branch...</option>
                {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>

          {/* Trainer Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <User className="w-3 h-3" /> Assigned Trainer
            </label>
            <select
              {...register('trainerId')}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              <option value="">Unassigned / No Trainer</option>
              {trainers?.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>

          {/* Day of Week */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Recurring Day
            </label>
            <select
              {...register('dayOfWeek')}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 appearance-none"
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Slot Capacity */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <MapPin className="w-3 h-3" /> Slot Max Capacity
            </label>
            <input 
              type="number"
              {...register('capacity', { required: true })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" /> Start Time
            </label>
            <input 
              type="time"
              {...register('startTime', { required: true })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" /> End Time
            </label>
            <input 
              type="time"
              {...register('endTime', { required: true })}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-[2] h-12 bg-brand-green text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-green/20 hover:bg-brand-green-dark transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Processing...' : (scheduleToEdit ? 'Update Slot' : 'Add Slot')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
