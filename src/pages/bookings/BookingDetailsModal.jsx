import { useQuery } from '@tanstack/react-query';
import { 
  User, Calendar, Clock, MapPin, Activity, CreditCard, 
  History, CheckCircle2, XCircle, AlertCircle, Phone, 
  Dumbbell, Heart, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';
import { bookingsApi } from '../../api/endpoints';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';

export default function BookingDetailsModal({ id, onClose }) {
  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking-detail', id],
    queryFn: () => bookingsApi.getById(id).then(r => r.data.data),
    enabled: !!id,
  });

  if (!id) return null;

  return (
    <Modal open={!!id} onClose={onClose} title="Booking Insight" size="xl">
      <div className="font-inter">
        {isLoading ? (
          <BookingSkeleton />
        ) : isError ? (
          <div className="p-20 text-center space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">Error retrieving booking</h3>
            <p className="text-slate-500">The requested reservation data could not be synchronized.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row min-h-[600px] divide-x divide-slate-100">
            {/* ── Left Side: Core Details ── */}
            <div className="flex-[1.5] p-8 space-y-10">
              
              {/* Member Card */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <User className="w-3 h-3" /> Member Information
                </h4>
                <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 flex items-center gap-5 group hover:bg-slate-100/50 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-green border border-slate-100">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-slate-900 leading-tight">
                      {booking.member?.firstName} {booking.member?.lastName}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> {booking.member?.membershipNo || 'WALK-IN'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {booking.member?.phone || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Service & Schedule */}
              <section className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <DetailItem 
                    icon={Activity} 
                    label="Service Reserved" 
                    value={booking.service?.name || booking.groupClass?.name || 'Standard Session'} 
                    subValue={booking.bookingType.replace('_', ' ')}
                    variant="primary"
                  />
                  <DetailItem 
                    icon={MapPin} 
                    label="Venue / Branch" 
                    value={booking.branch?.name || 'Main Branch'} 
                  />
                </div>
                <div className="space-y-6">
                  <DetailItem 
                    icon={Calendar} 
                    label="Scheduled Date" 
                    value={new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 
                  />
                  <DetailItem 
                    icon={Clock} 
                    label="Time Window" 
                    value={`${booking.startTime} — ${booking.endTime || 'End'}`} 
                  />
                </div>
              </section>

              {/* Staff & Logistics */}
              <section className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-20 h-20" />
                 </div>
                 <div className="relative z-10 space-y-6">
                   <div className="space-y-1">
                     <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Assigned Personnel</p>
                     <p className="text-2xl font-black tracking-tight">{booking.trainer?.name || booking.therapist?.name || 'System Assigned'}</p>
                   </div>
                   <div className="flex items-center gap-8">
                     <div className="space-y-1">
                       <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Deducted from Credit</p>
                       <p className="font-black text-lg text-brand-green">{booking.sessionDeducted ? 'YES' : 'NO / COMPLIMENTARY'}</p>
                     </div>
                     <div className="w-px h-8 bg-white/10" />
                     <div className="space-y-1">
                       <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Duration</p>
                       <p className="font-black text-lg">60 Minutes</p>
                     </div>
                   </div>
                 </div>
              </section>
            </div>

            {/* ── Right Side: Timeline & Actions ── */}
            <div className="flex-1 bg-slate-50/50 p-8 space-y-8">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Resolution</h4>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                   <StatusBadge status={booking.status} />
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Modified {new Date(booking.updatedAt).toLocaleDateString()}</span>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <History className="w-3 h-3" /> Operational Timeline
                </h4>
                
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                   {booking.statusHistory?.map((h, i) => (
                     <div key={h.id} className="relative">
                        <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${i === 0 ? 'bg-brand-green' : 'bg-slate-300'}`} />
                        <div className="space-y-1">
                           <div className="flex items-center justify-between">
                              <p className={`text-[11px] font-black uppercase tracking-widest ${i === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{h.status}</p>
                              <p className="text-[10px] font-bold text-slate-400">{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <p className="text-xs text-slate-500 font-medium">{h.notes || 'Status automatically updated by system'}</p>
                        </div>
                     </div>
                   ))}

                   {/* Initial Creation */}
                   <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-slate-200" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">REQUESTED</p>
                        <p className="text-xs text-slate-400 font-medium">Initial reservation recorded in database</p>
                      </div>
                   </div>
                </div>
              </section>

              {booking.cancelReason && (
                <section className="bg-red-50 rounded-2xl p-6 border border-red-100 space-y-2">
                   <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Cancellation Reason</p>
                   <p className="text-xs font-bold text-red-800 leading-relaxed italic">"{booking.cancelReason}"</p>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailItem({ icon: Icon, label, value, subValue, variant = 'default' }) {
  return (
    <div className="space-y-2.5 group">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${variant === 'primary' ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 text-slate-400'} group-hover:scale-110 transition-transform`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className="pl-9 space-y-0.5">
        <p className="text-base font-black text-slate-900 tracking-tight">{value}</p>
        {subValue && <p className="text-[9px] font-black text-brand-green uppercase tracking-[0.2em]">{subValue}</p>}
      </div>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] divide-x divide-slate-100 animate-pulse">
      <div className="flex-[1.5] p-8 space-y-10">
        <div className="h-24 bg-slate-100 rounded-[24px]" />
        <div className="grid grid-cols-2 gap-10">
           <div className="space-y-6"><div className="h-16 bg-slate-50 rounded-xl" /><div className="h-16 bg-slate-50 rounded-xl" /></div>
           <div className="space-y-6"><div className="h-16 bg-slate-50 rounded-xl" /><div className="h-16 bg-slate-50 rounded-xl" /></div>
        </div>
        <div className="h-40 bg-slate-900/10 rounded-[32px]" />
      </div>
      <div className="flex-1 bg-slate-50/50 p-8 space-y-8">
        <div className="h-20 bg-white rounded-2xl" />
        <div className="space-y-4">
           <div className="h-10 bg-slate-200 rounded-lg w-1/2" />
           <div className="h-40 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
