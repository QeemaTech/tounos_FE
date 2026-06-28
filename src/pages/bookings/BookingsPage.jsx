import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, ChevronLeft, ChevronRight, XCircle, Calendar, Clock, 
  User, Plus, Filter, MoreHorizontal, Eye, CheckCircle, UserMinus, 
  MapPin, Activity, X
} from 'lucide-react';
import { bookingsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import BookingDetailsModal from './BookingDetailsModal';
import CreateBookingModal from './CreateBookingModal';
import { useBranchScope } from '../../hooks/useBranchScope';

const TABS = [
  { id: 'CONFIRMED', label: 'Upcoming' },
  { id: 'COMPLETED', label: 'Past' },
  { id: 'PENDING',   label: 'Pending' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'NO_SHOW',   label: 'No-Show' },
];

const BOOKING_TYPES = [
  { id: 'GROUP_CLASS', label: 'Group Class' },
  { id: 'PRIVATE_TRAINING', label: 'Private Training' },
  { id: 'MASSAGE', label: 'Massage' },
];

export default function BookingsPage() {
  const { isBranchLocked, branchFilter: defaultBranchFilter, setBranchFilter: setDefaultBranchFilter, branches } = useBranchScope();
  const qc = useQueryClient();
  const [tab, setTab] = useState('CONFIRMED');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Advanced Filters
  const [date, setDate] = useState('');
  const [branchId, setBranchId] = useState(defaultBranchFilter || '');
  const [bookingType, setBookingType] = useState('');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch Bookings
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', { tab, page, search, date, branchId, bookingType }],
    queryFn: () => bookingsApi.list({ 
      page, 
      pageSize: 15, 
      status: tab, 
      search: search || undefined,
      date: date || undefined,
      branchId: branchId || undefined,
      bookingType: bookingType || undefined
    }).then(r => r.data),
  });

  // Mutations
  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const cancelMut = useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
    },
  });

  const bookings = data?.data || [];
  const meta = data?.meta;

  const handleStatusUpdate = (id, status) => {
    updateStatusMut.mutate({ id, status });
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Bookings" 
        subtitle="Manage class and service reservations" 
        breadcrumbs={[{ label: 'Bookings' }]}
        actions={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary !rounded-2xl !py-3 !px-6 shadow-lg shadow-brand-green/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Booking
          </button>
        }
      />

      <div className="card !p-0 overflow-hidden border-slate-200">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-8 pt-6 border-b border-slate-100 bg-white">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setPage(1); }}
              className={`px-5 py-4 text-sm font-black transition-all border-b-2 relative uppercase tracking-widest ${
                tab === t.id 
                  ? 'border-brand-green text-brand-green bg-brand-green/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
              {tab === t.id && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Search & Advanced Filters */}
        <div className="p-6 px-8 bg-white/50 space-y-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-3 bg-white rounded-[20px] px-5 py-3 flex-1 border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-brand-green/10 transition-all">
              <Search className="w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by member, phone or service..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-800 placeholder-slate-400" 
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => { setDate(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-100 rounded-[18px] pl-11 pr-4 py-3 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 shadow-sm"
                />
              </div>

              {/* Branch Filter — hidden for branch-locked admins */}
              {!isBranchLocked && (
                <select 
                  value={branchId}
                  onChange={e => { setBranchId(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-100 rounded-[18px] px-5 py-3 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 shadow-sm appearance-none min-w-[140px]"
                >
                  <option value="">All Branches</option>
                  {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}

              {/* Type Filter */}
              <select 
                value={bookingType}
                onChange={e => { setBookingType(e.target.value); setPage(1); }}
                className="bg-white border border-slate-100 rounded-[18px] px-5 py-3 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-brand-green/10 shadow-sm appearance-none min-w-[160px]"
              >
                <option value="">All Service Types</option>
                {BOOKING_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>

              {(date || branchId || bookingType || search) && (
                <button 
                  onClick={() => { setDate(''); setBranchId(''); setBookingType(''); setSearch(''); }}
                  className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                  title="Clear Filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Updating Ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-8">Member</th>
                  <th className="table-header">Service & Type</th>
                  <th className="table-header">Schedule</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right !px-8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="table-row group">
                    <td className="table-cell !px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-inner border border-slate-100">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{b.member ? `${b.member.firstName} ${b.member.lastName}` : 'Guest Member'}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{b.member?.membershipNo || 'WALK-IN'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-slate-800 block leading-none">{b.service?.name || b.groupClass?.name || 'Standard Session'}</span>
                        <div className={`
                          inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                          ${b.bookingType === 'GROUP_CLASS' ? 'bg-emerald-50 text-emerald-600' : 
                            b.bookingType === 'PRIVATE_TRAINING' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}
                        `}>
                          {b.bookingType.replace('_', ' ')}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          {new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          {b.startTime || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-black text-slate-500 text-xs uppercase tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        {b.branch?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="table-cell text-center"><StatusBadge status={b.status} /></td>
                    <td className="table-cell text-right !px-8">
                      <BookingActions 
                        booking={b} 
                        onViewDetails={() => setSelectedBookingId(b.id)}
                        onUpdateStatus={handleStatusUpdate} 
                        onCancel={openCancelModal} 
                      />
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <EmptyBookingsState />}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} page={page} setPage={setPage} count={bookings.length} />
      </div>

      {/* ── Modals ── */}
      <BookingDetailsModal 
        id={selectedBookingId} 
        onClose={() => setSelectedBookingId(null)} 
      />

      <CreateBookingModal 
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CancelBookingModal 
        open={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        onConfirm={(reason) => cancelMut.mutate({ id: selectedBooking?.id, reason })}
        isSubmitting={cancelMut.isPending}
      />
    </div>
  );
}

// ── Sub-Components ──

function BookingActions({ booking, onViewDetails, onUpdateStatus, onCancel }) {
  return (
    <Dropdown 
      trigger={
        <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      }
    >
      <ActionItem icon={Eye} label="View Details" onClick={onViewDetails} />
      
      {booking.status === 'CONFIRMED' && (
        <>
          <div className="h-px bg-slate-50 my-1 mx-2" />
          <ActionItem icon={CheckCircle} label="Mark Completed" onClick={() => onUpdateStatus(booking.id, 'COMPLETED')} />
          <ActionItem icon={UserMinus} label="Mark No-Show" onClick={() => onUpdateStatus(booking.id, 'NO_SHOW')} />
          <div className="h-px bg-slate-50 my-1 mx-2" />
          <ActionItem icon={XCircle} label="Cancel Booking" variant="danger" onClick={() => onCancel(booking)} />
        </>
      )}
    </Dropdown>
  );
}

function ActionItem({ icon: Icon, label, onClick, variant = 'default' }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors
        ${variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50'}
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function CancelBookingModal({ open, onClose, onConfirm, isSubmitting }) {
  const [reason, setReason] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Cancel Reservation" size="md">
      <div className="space-y-6 p-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black text-red-900 uppercase tracking-tight">Revoke Booking</p>
            <p className="text-xs text-red-600 font-medium leading-relaxed">This action will release the spot and notify the trainers. A cancellation reason is mandatory for audit logs.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancellation Reason</label>
          <textarea 
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g., Member called to reschedule, Medical emergency..."
            className="input w-full h-32 pt-4 !bg-slate-50 border-none rounded-2xl focus:!bg-white focus:ring-2 focus:ring-red-100 transition-all resize-none font-medium"
          />
        </div>

        <div className="flex gap-3 pt-6 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Abort</button>
          <button 
            disabled={!reason || isSubmitting}
            onClick={() => onConfirm(reason)} 
            className="flex-[2] h-12 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-600 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AlertCircle(props) {
  return <XCircle {...props} />;
}

function EmptyBookingsState() {
  return (
    <tr>
      <td colSpan={6} className="py-32 text-center text-slate-300">
        <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
          <Calendar className="w-10 h-10" />
        </div>
        <p className="font-black uppercase tracking-[0.3em] text-xs">No reservations discovered in this segment</p>
        <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase">Adjust your filters or try a different search</p>
      </td>
    </tr>
  );
}

function Pagination({ meta, page, setPage, count }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="px-10 py-5 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Inventory: {count} of {meta.total} records
      </p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page <= 1} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-green disabled:opacity-30 shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black text-slate-900 shadow-sm">
          {page} <span className="text-slate-300 mx-1">/</span> {meta.totalPages}
        </div>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page >= meta.totalPages} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-green disabled:opacity-30 shadow-sm transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
