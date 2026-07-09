import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  Clock, Users as UsersIcon, Plus, MapPin, 
  MoreHorizontal, Edit2, Trash2, Calendar as CalendarIcon, 
  ChevronRight, Filter, Box, Activity
} from 'lucide-react';
import { classesApi, schedulesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import CreateClassModal from './CreateClassModal';
import AddScheduleModal from './AddScheduleModal';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';
import ServiceSetupStepper from '../../components/ui/ServiceSetupStepper';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };

export default function ClassesPage() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'schedules' ? 'schedules' : 'classes';
  const [tab, setTab] = useState(defaultTab);
  
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === 'schedules' || currentTab === 'classes') {
      setTab(currentTab);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const { branches, isBranchLocked, defaultBranchId } = useBranchScope();
  const [selectedBranch, setSelectedBranch] = useState(defaultBranchId || '');

  // Auto-select first branch for super admins once branches load
  useEffect(() => {
    if (!selectedBranch && branches.length > 0) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);
  
  // Modal States
  const [classModal, setClassModal] = useState({ open: false, data: null });
  const [scheduleModal, setScheduleModal] = useState({ open: false, data: null });

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list({ pageSize: 100 }).then(r => r.data.data || []),
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules', selectedBranch],
    queryFn: () => schedulesApi.list({ branchId: selectedBranch, pageSize: 200 }).then(r => r.data.data || []),
    enabled: !!selectedBranch
  });

  // Mutations
  const deleteClassMut = useMutation({
    mutationFn: (id) => classesApi.remove(id),
    onSuccess: () => {
      toast.success('Class deleted successfully');
      qc.invalidateQueries({ queryKey: ['classes'] });
    }
  });

  const deleteScheduleMut = useMutation({
    mutationFn: (id) => schedulesApi.remove(id),
    onSuccess: () => {
      toast.success('Schedule slot removed');
      qc.invalidateQueries({ queryKey: ['schedules'] });
    }
  });

  return (
    <div>
      <PageHeader 
        title="Classes & Schedules" 
        subtitle="Manage group classes and weekly schedules" 
        breadcrumbs={[{ label: 'Classes & Schedules' }]} 
        actions={
          tab === 'classes' ? (
            <button 
              onClick={() => setClassModal({ open: true, data: null })}
              className="btn-primary flex items-center gap-2 !rounded-xl"
            >
              <Plus className="w-4 h-4" /> New Class
            </button>
          ) : (
            <button 
              onClick={() => setScheduleModal({ open: true, data: null })}
              className="btn-primary flex items-center gap-2 !rounded-xl"
            >
              <CalendarIcon className="w-4 h-4" /> Add Slot
            </button>
          )
        }
      />

      <ServiceSetupStepper activeStep={tab === 'classes' ? 3 : 4} />

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => handleTabChange('classes')} 
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'classes' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Classes Catalog
          </button>
          <button 
            onClick={() => handleTabChange('schedules')} 
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'schedules' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Weekly Schedules
          </button>
        </div>

        {tab === 'schedules' && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            {isBranchLocked ? (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                {branches[0]?.name || 'Your Branch'}
              </span>
            ) : (
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-700 pr-8 appearance-none cursor-pointer"
              >
                {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>
        )}
      </div>

      {tab === 'classes' && (
        loadingClasses ? <div className="py-20 flex justify-center"><LoadingSpinner /></div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(classes || []).map(c => (
              <div key={c.id} className="group bg-white rounded-[32px] p-6 border border-slate-100 hover:border-brand-green/30 transition-all hover:shadow-2xl hover:shadow-brand-green/5 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-inner">
                    <Box className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                     </span>
                     <ClassActions 
                       onEdit={() => setClassModal({ open: true, data: c })}
                       onDelete={() => {
                         if(confirm('Are you sure you want to delete this class? This may affect existing schedules.')) {
                           deleteClassMut.mutate(c.id);
                         }
                       }}
                     />
                  </div>
                </div>

                <h3 className="font-black text-slate-900 text-lg mb-1">{c.name}</h3>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">{c.service?.name || 'Class Listing'}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                   <div className="px-3 py-1.5 bg-slate-50 rounded-xl flex items-center gap-2 border border-slate-100 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{c.duration} MIN</span>
                   </div>
                   <div className="px-3 py-1.5 bg-slate-50 rounded-xl flex items-center gap-2 border border-slate-100 shadow-sm">
                      <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{c.capacity} MAX</span>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[9px] font-black text-brand-green bg-brand-green/5 px-2 py-1 rounded-md uppercase tracking-widest">{c.level || 'ALL LEVELS'}</span>
                   <button 
                     onClick={() => setClassModal({ open: true, data: c })}
                     className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-green transition-colors flex items-center gap-1"
                   >
                     View Details <ChevronRight className="w-3 h-3" />
                   </button>
                </div>
              </div>
            ))}
            {(!classes || classes.length === 0) && (
              <div className="col-span-full text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <Box className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No classes in catalog</p>
              </div>
            )}
          </div>
        )
      )}

      {tab === 'schedules' && (
        loadingSchedules ? <div className="py-20 flex justify-center"><LoadingSpinner /></div> : (
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    {DAYS.map(d => (
                      <th key={d} className="px-6 py-6 text-center border-r border-slate-100 last:border-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{DAY_SHORT[d]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {DAYS.map(day => {
                      const daySchedules = (schedules || []).filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                      return (
                        <td key={day} className="px-4 py-6 align-top border-r border-slate-100 last:border-0 min-w-[200px] bg-white/50">
                          <div className="space-y-4">
                            {daySchedules.map(s => (
                              <div 
                                key={s.id} 
                                onClick={() => setScheduleModal({ open: true, data: s })}
                                className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-green/20 transition-all cursor-pointer relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-green opacity-0 group-hover:opacity-100 transition-all" />
                                <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-brand-green/5 flex items-center justify-center">
                                         <Activity className="w-3 h-3 text-brand-green" />
                                      </div>
                                      <p className="font-black text-slate-900 text-xs leading-tight">{s.groupClass?.name || '—'}</p>
                                   </div>
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       if(confirm('Remove this slot from schedule?')) deleteScheduleMut.mutate(s.id);
                                     }}
                                     className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                                   >
                                      <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase mb-3">
                                   <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {s.startTime}
                                   </div>
                                   <ChevronRight className="w-2 h-2" />
                                   <div>{s.endTime}</div>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                                   <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                      {s.trainer?.firstName?.charAt(0) || '?'}
                                   </div>
                                   <span className="text-[10px] font-black text-slate-500 uppercase truncate">{s.trainer ? `${s.trainer.firstName} ${s.trainer.lastName}` : 'TBA'}</span>
                                </div>
                              </div>
                            ))}
                            {daySchedules.length === 0 && (
                              <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-20 grayscale">
                                 <Clock className="w-6 h-6 text-slate-300" />
                                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Empty Slate</p>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Modals */}
      <CreateClassModal 
        open={classModal.open} 
        onClose={() => setClassModal({ open: false, data: null })} 
        classToEdit={classModal.data}
      />
      <AddScheduleModal 
        open={scheduleModal.open} 
        onClose={() => setScheduleModal({ open: false, data: null })} 
        scheduleToEdit={scheduleModal.data}
        initialBranchId={selectedBranch}
      />
    </div>
  );
}

function ClassActions({ onEdit, onDelete }) {
  return (
    <Dropdown 
      trigger={
        <button className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
      }
    >
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </Dropdown>
  );
}
