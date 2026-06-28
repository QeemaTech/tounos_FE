import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { therapistsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Heart, Calendar, Clock, MapPin, 
  User, Phone, Mail, ChevronLeft, 
  ListTodo, UserCheck, TrendingUp, Users, 
  CheckCircle2, Sparkles
} from 'lucide-react';

export default function TherapistProfilePage() {
  const { therapistId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['therapist', therapistId],
    queryFn: () => therapistsApi.getById(therapistId).then(r => r.data.data),
  });

  if (isLoading) return <div className="p-32 flex justify-center"><LoadingSpinner /></div>;
  if (!data) return <div className="p-32 text-center text-slate-400">Therapist not found</div>;

  const therapist = data;

  // KPI Calculations
  const kpis = [
    { label: 'Total Sessions', value: therapist.bookings?.length || 0, icon: TrendingUp, color: 'blue' },
    { label: 'Upcoming', value: therapist.bookings?.filter(b => b.status === 'PENDING').length || 0, icon: Calendar, color: 'emerald' },
    { label: 'Unique Clients', value: new Set(therapist.bookings?.map(b => b.memberId)).size, icon: Users, color: 'indigo' },
    { label: 'Satisfaction', value: '98%', icon: Sparkles, color: 'orange' }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title={`${therapist.firstName} ${therapist.lastName}`} 
        subtitle={therapist.speciality || 'Recovery Specialist'}
        breadcrumbs={[
          { label: 'Therapists', path: '/therapists' },
          { label: 'Profile' }
        ]}
        actions={
          <button 
            onClick={() => navigate('/therapists')}
            className="btn-secondary !rounded-2xl flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back to List
          </button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-blue-500/30 transition-all">
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
              <div className="w-32 h-32 rounded-[40px] bg-blue-50/50 flex items-center justify-center text-blue-200 border-4 border-white shadow-xl mb-6 overflow-hidden">
                {therapist.avatar ? (
                  <img src={therapist.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {therapist.firstName} {therapist.lastName}
              </h2>
              <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-widest">
                {therapist.speciality || 'Massage Therapist'}
              </p>
              <div className="mt-4">
                <StatusBadge status={therapist.isActive !== false ? 'ACTIVE' : 'SUSPENDED'} />
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all border border-slate-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-slate-700">{therapist.email || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all border border-slate-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="font-bold text-slate-700">{therapist.phone || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-all border border-slate-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Branches</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {therapist.branches?.map(b => (
                      <span key={b.branchId} className="px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-tighter">
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
                {therapist.bio || 'This specialist has not provided a bio yet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Sessions */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="text-lg font-black text-slate-900">Session Ledger</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical and upcoming recovery sessions</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <ListTodo className="w-5 h-5" />
               </div>
            </div>
            
            <SessionsTab bookings={therapist.bookings || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionsTab({ bookings }) {
  if (bookings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
        <Sparkles className="w-16 h-16 mb-4 text-blue-400" />
        <p className="font-black uppercase tracking-widest text-xs text-slate-500">No session history available</p>
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
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs uppercase">
                    {b.member.firstName[0]}{b.member.lastName[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{b.member.firstName} {b.member.lastName}</span>
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
