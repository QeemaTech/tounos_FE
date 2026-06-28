import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trainersApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  GraduationCap, Calendar, Clock, MapPin, 
  User, Phone, Mail, ChevronLeft, LayoutGrid, 
  ListTodo, UserCheck, TrendingUp, Users, 
  Star, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function TrainerProfilePage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');

  const { data, isLoading } = useQuery({
    queryKey: ['trainer', trainerId],
    queryFn: () => trainersApi.getById(trainerId).then(r => r.data.data),
  });

  if (isLoading) return <div className="p-32 flex justify-center"><LoadingSpinner /></div>;
  if (!data) return <div className="p-32 text-center text-slate-400">Trainer not found</div>;

  const trainer = data;

  // KPI Calculations (Mocked or derived from data)
  const kpis = [
    { label: 'Classes / Month', value: trainer.classSchedules?.length || 0, icon: TrendingUp, color: 'emerald' },
    { label: 'PT Sessions', value: trainer.bookings?.length || 0, icon: UserCheck, color: 'blue' },
    { label: 'Active Clients', value: new Set(trainer.bookings?.map(b => b.memberId)).size, icon: Users, color: 'indigo' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'orange' }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title={`${trainer.firstName} ${trainer.lastName}`} 
        subtitle={trainer.speciality || 'Fitness Professional'}
        breadcrumbs={[
          { label: 'Trainers', path: '/trainers' },
          { label: 'Profile' }
        ]}
        actions={
          <button 
            onClick={() => navigate('/trainers')}
            className="btn-secondary !rounded-2xl flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back to List
          </button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-brand-green/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 flex items-center justify-center text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-xl font-black text-slate-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Col: Info Card */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[40px] bg-slate-50 flex items-center justify-center text-slate-300 border-4 border-white shadow-xl mb-6 overflow-hidden">
                {trainer.avatar ? (
                  <img src={trainer.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {trainer.firstName} {trainer.lastName}
              </h2>
              <p className="text-brand-green font-bold text-sm mt-1 uppercase tracking-widest">
                {trainer.speciality || 'General Trainer'}
              </p>
              <div className="mt-4">
                <StatusBadge status={trainer.isActive !== false ? 'ACTIVE' : 'SUSPENDED'} />
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all border border-slate-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-slate-700">{trainer.email || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all border border-slate-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="font-bold text-slate-700">{trainer.phone || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all border border-slate-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Branches</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {trainer.branches?.map(b => (
                      <span key={b.branchId} className="px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        {b.branch.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Bio</h4>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {trainer.bio || 'This trainer has not provided a bio yet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Tabs & Activity */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-[24px] border border-slate-200 w-fit">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Calendar className="w-4 h-4" /> Weekly Schedule
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <UserCheck className="w-4 h-4" /> PT Ledger
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            {activeTab === 'schedule' ? (
              <ScheduleTimeline schedules={trainer.classSchedules || []} />
            ) : (
              <BookingsLedger bookings={trainer.bookings || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleTimeline({ schedules }) {
  if (schedules.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
        <LayoutGrid className="w-16 h-16 mb-4" />
        <p className="font-black uppercase tracking-widest text-xs">No recurring classes assigned</p>
      </div>
    );
  }

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div className="p-10 space-y-10">
      {days.map(day => {
        const daySchedules = schedules.filter(s => s.dayOfWeek === day);
        if (daySchedules.length === 0) return null;

        return (
          <div key={day} className="relative pl-10">
            {/* Timeline Line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-brand-green bg-white shadow-sm" />
            </div>
            
            <h4 className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mb-6">{day}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daySchedules.map(s => (
                <div key={s.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border-l-4 border-l-brand-green">
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> {s.startTime} — {s.endTime}
                    </span>
                    <span className="px-2 py-0.5 bg-white rounded-lg text-[8px] font-black text-slate-400 uppercase border border-slate-100">
                      {s.branch.name}
                    </span>
                  </div>
                  <h5 className="font-black text-slate-900 group-hover:text-brand-green transition-colors">{s.groupClass.name}</h5>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500">{s.capacity} Capacity</span>
                    </div>
                    <StatusBadge status="ACTIVE" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingsLedger({ bookings }) {
  if (bookings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
        <ListTodo className="w-16 h-16 mb-4" />
        <p className="font-black uppercase tracking-widest text-xs">No private sessions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="table-header !px-10">Member Information</th>
            <th className="table-header text-center">Session Date</th>
            <th className="table-header text-center">Time Slot</th>
            <th className="table-header text-center">Location</th>
            <th className="table-header text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="table-row group">
              <td className="table-cell !px-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs">
                    {b.member.firstName[0]}{b.member.lastName[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 group-hover:text-brand-green transition-colors">{b.member.firstName} {b.member.lastName}</span>
                    <span className="text-[10px] text-slate-400 font-bold tracking-tighter">{b.member.phone}</span>
                  </div>
                </div>
              </td>
              <td className="table-cell text-center">
                <span className="font-black text-slate-700">{new Date(b.bookingDate).toLocaleDateString()}</span>
              </td>
              <td className="table-cell text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600">
                  <Clock className="w-3 h-3 text-slate-300" /> {b.startTime}
                </div>
              </td>
              <td className="table-cell text-center">
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{b.branch.name}</span>
              </td>
              <td className="table-cell text-center">
                <div className={`
                  inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest
                  ${b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                    b.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 
                    b.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}
                `}>
                  {b.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
