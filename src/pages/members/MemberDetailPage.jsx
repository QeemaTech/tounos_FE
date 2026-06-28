import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, Calendar, Dumbbell, Heart, User, Mail, Phone, 
  MapPin, Clock, CreditCard, ShoppingBag, Activity, History, Snowflake, 
  StickyNote, Edit3, Plus, Search, ChevronRight, CheckCircle2, AlertCircle, FileText, ImageOff
} from 'lucide-react';
import { membersApi, branchesApi, freezesApi, inbodyApi } from '../../api/endpoints';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import AssignPackageModal from './AssignPackageModal';
import FreezeSubscriptionModal from '../subscriptions/FreezeSubscriptionModal';
import { useAuth } from '../../hooks/useAuth';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { toast } from 'react-hot-toast';

// ── Tab Configuration ──
const TABS = [
  { id: 'overview', label: 'Overview', icon: History },
  { id: 'subscriptions', label: 'Subscriptions', icon: Snowflake },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'inbody', label: 'InBody', icon: Activity },
];

export default function MemberDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // 1. Fetch Main Member Info
  const { data: member, isLoading, isError } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getById(id).then(r => r.data.data),
    enabled: !!id && id !== 'new'
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse font-inter">Synchronizing Profile...</p>
    </div>
  );

  if (isError || !member) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 font-inter">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-sm">
        <User className="w-10 h-10" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900">Member Not Found</h2>
        <p className="text-slate-500 font-medium">The member record may have been archived or removed.</p>
      </div>
      <Link to="/members" className="btn-secondary px-8">Return to Directory</Link>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between">
        <Link to="/members" className="group inline-flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-brand-green transition-all">
          <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200 group-hover:border-brand-green/30 group-hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Directory
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary !rounded-2xl !py-2.5 !px-5 flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
          <button onClick={() => setIsFreezeModalOpen(true)} className="btn-primary !rounded-2xl !py-2.5 !px-5 flex items-center gap-2 shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30">
            <Snowflake className="w-4 h-4" /> Freeze Membership
          </button>
        </div>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/5 rounded-full -mr-40 -mt-40 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="w-36 h-36 rounded-[36px] bg-brand-green/10 flex items-center justify-center text-brand-green text-5xl font-black border-4 border-white shadow-2xl shadow-brand-green/10">
              {member.firstName?.[0]}{member.lastName?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 transform scale-125">
              <StatusBadge status={member.status} />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{member.firstName} {member.lastName}</h1>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border border-slate-200">
                  ID: {member.membershipNo || 'TEMP'}
                </span>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Premium Club Member</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-3">
              <HeaderInfo icon={MapPin} label={member.branch?.name || 'Main Branch'} />
              <HeaderInfo icon={Mail} label={member.email} />
              <HeaderInfo icon={Phone} label={member.phone || '—'} />
              <HeaderInfo icon={Clock} label={`Member since ${new Date(member.createdAt).toLocaleDateString()}`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-6 py-2.5 text-sm font-bold transition-all rounded-xl relative
              ${activeTab === tab.id 
                ? 'bg-white text-brand-green-dark shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }
            `}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-green' : 'text-slate-400 opacity-60'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content Area ── */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <OverviewTab 
            member={member} 
            onAssignPackage={() => setIsAssignModalOpen(true)} 
          />
        )}
        {activeTab === 'subscriptions' && <SubscriptionsTab memberId={id} />}
        {activeTab === 'bookings' && <BookingsTab memberId={id} />}
        {activeTab === 'payments' && <PaymentsTab memberId={id} />}
        {activeTab === 'inbody' && <InBodyTab memberId={id} />}
      </div>

      {/* ── Modals ── */}
      <AssignPackageModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        memberId={id}
        branchId={member.branchId}
        onSuccess={() => {
          queryClient.invalidateQueries(['member', id]);
          queryClient.invalidateQueries(['member-subscriptions', id]);
          setIsAssignModalOpen(false);
        }}
      />
      <EditMemberModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        member={member} 
        onSuccess={() => {
          queryClient.invalidateQueries(['member', id]);
          setIsEditModalOpen(false);
        }}
      />
      
      <FreezeSubscriptionModal 
        open={isFreezeModalOpen} 
        onClose={() => setIsFreezeModalOpen(false)} 
        memberId={id}
        onSuccess={() => {
          queryClient.invalidateQueries(['member', id]);
          queryClient.invalidateQueries(['member-subscriptions', id]);
          setIsFreezeModalOpen(false);
        }}
      />
    </div>
  );
}

// ── Sub-Components ──

function HeaderInfo({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold group">
      <Icon className="w-4 h-4 text-slate-300 group-hover:text-brand-green transition-colors" />
      <span className="group-hover:text-slate-900 transition-colors">{label}</span>
    </div>
  );
}

// 1. Overview Tab
function OverviewTab({ member, onAssignPackage }) {
  const activeSub = member.subscriptions?.find(s => s.status === 'ACTIVE') || member.subscriptions?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Premium Membership Card (Redesigned for Perfect UI) */}
        {activeSub ? (
          <div className="bg-gradient-to-br from-[#0b3916] via-[#051c0b] to-[#031107] rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
            {/* Background Pattern / Decoration */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-brand-green text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-sm">Current Active Plan</p>
                  <h3 className="text-5xl font-black tracking-tighter text-white drop-shadow-md">{activeSub.package?.name || 'Premium'}</h3>
                </div>
                
                <div className="flex items-center gap-12">
                  <div className="space-y-1.5">
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">Renewal Date</p>
                    <p className="font-black text-xl text-white">{new Date(activeSub.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="space-y-1.5">
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">Membership Status</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_12px_rgba(30,164,62,0.6)] animate-pulse" />
                      <p className="font-black text-xl uppercase tracking-tight text-white">{activeSub.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <GlassPill icon={Calendar} count={activeSub.groupClassRemaining} label="Classes" />
                <GlassPill icon={Dumbbell} count={activeSub.privateTrainingRemaining} label="Gym Session" />
                <GlassPill icon={Heart} count={activeSub.massageRemaining} label="Massage" />
              </div>
            </div>
          </div>
        ) : (
          <EmptyTabState 
            icon={Snowflake} 
            title="No Active Membership" 
            subtitle="This member currently has no active subscription packages." 
            actionLabel="Assign Package" 
            onAction={onAssignPackage}
          />
        )}

        {/* Account Activity Summary */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Recent Profile Activity</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">Last 5 entries</span>
          </div>
          <div className="p-4">
             <div className="py-12 text-center text-slate-300 font-bold uppercase tracking-[0.2em] text-[10px]">
                Activity feed loading...
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Account Stats */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-10 space-y-8">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-5">Profile Statistics</h3>
          <div className="space-y-6">
            <QuickStat label="Membership ID" value={member.membershipNo || '—'} icon={User} />
            <QuickStat label="Total Lifetime Value" value={`EGP ${Number(member.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0).toLocaleString()}`} icon={CreditCard} />
            <QuickStat label="Total Orders" value={member.orders?.length || 0} icon={ShoppingBag} />
            <QuickStat label="Status" value={member.status} icon={Activity} />
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-[#fffdec] rounded-[32px] border border-brand-yellow/30 p-10 space-y-5 relative group shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 text-brand-green-darker">
            <StickyNote className="w-5 h-5 text-brand-yellow group-hover:rotate-12 transition-transform" />
            <h4 className="font-black text-xs uppercase tracking-[0.2em]">Administrative Notes</h4>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed italic border-l-4 border-brand-yellow/20 pl-4">
            {member.notes || "Add personal preferences, medical conditions, or training goals for this member."}
          </p>
          <button className="text-[10px] font-black uppercase text-brand-green hover:tracking-widest transition-all">Update Entry</button>
        </div>
      </div>
    </div>
  );
}

// 2. Subscriptions Tab
function SubscriptionsTab({ memberId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['member-subscriptions', memberId],
    queryFn: () => membersApi.getSubscriptions(memberId).then(r => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  const items = data?.data || [];

  if (items.length === 0) return <EmptyTabState icon={Snowflake} title="No Subscriptions" subtitle="No membership history found for this member." />;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr>
            <th className="table-header !px-10">Package</th>
            <th className="table-header">Period</th>
            <th className="table-header text-center">Status</th>
            <th className="table-header text-right !px-10">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(s => (
            <tr key={s.id} className="table-row">
              <td className="table-cell !px-10 font-bold text-slate-900">{s.package?.name}</td>
              <td className="table-cell text-xs font-semibold text-slate-500">
                {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
              </td>
              <td className="table-cell text-center"><StatusBadge status={s.status} /></td>
              <td className="table-cell text-right !px-10"><button className="text-brand-green font-bold text-xs">View Details</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 3. Bookings Tab
function BookingsTab({ memberId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['member-bookings', memberId],
    queryFn: () => membersApi.getBookings(memberId).then(r => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  const items = data?.data || [];

  if (items.length === 0) return <EmptyTabState icon={Calendar} title="No Bookings" subtitle="This member hasn't made any class or session bookings yet." />;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr>
            <th className="table-header !px-10">Service</th>
            <th className="table-header">Date & Time</th>
            <th className="table-header text-center">Status</th>
            <th className="table-header text-right !px-10">Trainer</th>
          </tr>
        </thead>
        <tbody>
          {items.map(b => (
            <tr key={b.id} className="table-row">
              <td className="table-cell !px-10 font-bold text-slate-900">{b.service?.name || b.bookingType}</td>
              <td className="table-cell">
                <p className="text-sm font-bold text-slate-800">{new Date(b.bookingDate).toLocaleDateString()}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">{b.startTime}</p>
              </td>
              <td className="table-cell text-center"><StatusBadge status={b.status} /></td>
              <td className="table-cell text-right !px-10 font-semibold text-slate-500">{b.trainer?.name || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 4. Payments Tab
function PaymentsTab({ memberId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['member-payments', memberId],
    queryFn: () => membersApi.getPayments(memberId).then(r => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  const items = data?.data || [];

  if (items.length === 0) return <EmptyTabState icon={CreditCard} title="No Payments" subtitle="No financial transactions recorded for this member." />;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr>
            <th className="table-header !px-10">Amount</th>
            <th className="table-header">Method</th>
            <th className="table-header text-center">Status</th>
            <th className="table-header text-right !px-10">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} className="table-row">
              <td className="table-cell !px-10 font-black text-slate-900">EGP {Number(p.amount).toLocaleString()}</td>
              <td className="table-cell text-xs font-bold text-slate-500 uppercase">{p.method}</td>
              <td className="table-cell text-center"><StatusBadge status={p.status} /></td>
              <td className="table-cell text-right !px-10 font-semibold text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 5. InBody Tab
function InBodyTab({ memberId }) {
  const queryClient = useQueryClient();
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['member-inbody', memberId],
    queryFn: () => inbodyApi.getMemberInBody(memberId).then(r => r.data),
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['member-inbody-progress', memberId],
    queryFn: () => inbodyApi.getMemberProgress(memberId).then(r => r.data.data),
  });

  const isLoading = reportsLoading || progressLoading;
  const reports = reportsData?.data || [];
  const latest = reports[0];

  if (isLoading) return <LoadingSpinner />;

  if (reports.length === 0) {
    return (
      <>
        <EmptyTabState 
          icon={Activity} 
          title="No Reports" 
          subtitle="Health tracking and InBody measurements are currently unavailable." 
          actionLabel="New Measurement" 
          onAction={() => setIsAddModalOpen(true)}
        />
        <AddInBodyModal 
          open={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          memberId={memberId}
          onSuccess={() => {
            queryClient.invalidateQueries(['member-inbody', memberId]);
            queryClient.invalidateQueries(['member-inbody-progress', memberId]);
            setIsAddModalOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Section 1: Overall Progress Card ── */}
      <div className="bg-gradient-to-br from-brand-green-darker to-[#031107] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <p className="text-brand-green text-[10px] font-black uppercase tracking-[0.4em]">Overall Transformation</p>
            <h3 className="text-3xl font-black tracking-tight">Fitness Journey Progress</h3>
            <p className="text-white/40 text-xs font-medium">
              Tracking {progressData?.reportCount} reports since {new Date(reports[reports.length-1].reportDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-4">
            <ProgressMetric 
              label="Weight" 
              value={progressData?.totalWeightChange} 
              unit="kg" 
              inverse // Loss is good
            />
            <ProgressMetric 
              label="Body Fat" 
              value={progressData?.totalBodyFatChange} 
              unit="%" 
              inverse // Loss is good
            />
            <ProgressMetric 
              label="Muscle" 
              value={reports[0].muscleMass - reports[reports.length-1].muscleMass} 
              unit="kg" 
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Latest Summary & Section 3: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Latest Metrics</h4>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="p-2 rounded-xl bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <LatestMetricCard label="Weight" value={latest.weight} unit="kg" change={latest.weightChange} inverse />
              <LatestMetricCard label="Body Fat %" value={latest.bodyFatPercentage} unit="%" change={latest.bodyFatChange} inverse />
              <LatestMetricCard label="Muscle Mass" value={latest.muscleMass} unit="kg" change={latest.muscleMassChange} />
              <LatestMetricCard label="Score" value={latest.score} unit="pts" />
            </div>

            <button 
              onClick={() => setSelectedReportId(latest.id)}
              className="w-full btn-secondary !rounded-2xl py-3 text-xs font-black uppercase tracking-widest"
            >
              View Full Report
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-200 p-8">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Performance History</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...reports].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="reportDate" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  name="Weight"
                  stroke="#1ea43e" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#1ea43e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bodyFatPercentage" 
                  name="Body Fat %"
                  stroke="#fced3c" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#fced3c', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Section 4: History Table ── */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Report History</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header !px-10">Date</th>
              <th className="table-header">Weight</th>
              <th className="table-header">Body Fat %</th>
              <th className="table-header">Muscle Mass</th>
              <th className="table-header text-center">Score</th>
              <th className="table-header text-center">Attach</th>
              <th className="table-header text-right !px-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="table-row">
                <td className="table-cell !px-10 font-bold text-slate-900">
                  {new Date(r.reportDate).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{r.weight} kg</span>
                    {r.weightChange !== 0 && (
                      <span className={`text-[10px] font-black ${r.weightChange < 0 ? 'text-brand-green' : 'text-red-500'}`}>
                        {r.weightChange > 0 ? '+' : ''}{r.weightChange}
                      </span>
                    )}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{r.bodyFatPercentage}%</span>
                    {r.bodyFatChange !== 0 && (
                      <span className={`text-[10px] font-black ${r.bodyFatChange < 0 ? 'text-brand-green' : 'text-red-500'}`}>
                        {r.bodyFatChange > 0 ? '+' : ''}{r.bodyFatChange}
                      </span>
                    )}
                  </div>
                </td>
                <td className="table-cell font-bold text-slate-700">{r.muscleMass} kg</td>
                <td className="table-cell text-center">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                    {r.score}
                  </span>
                </td>
                <td className="table-cell text-center">
                  {r.attachment && (
                    <div className="flex justify-center">
                      <div className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </td>
                <td className="table-cell text-right !px-10">
                  <button 
                    onClick={() => setSelectedReportId(r.id)}
                    className="text-brand-green font-bold text-xs hover:tracking-widest transition-all"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modals ── */}
      <InBodyDetailModal 
        open={!!selectedReportId} 
        onClose={() => setSelectedReportId(null)} 
        memberId={memberId}
        reportId={selectedReportId}
        onDelete={() => {
          queryClient.invalidateQueries(['member-inbody', memberId]);
          queryClient.invalidateQueries(['member-inbody-progress', memberId]);
          setSelectedReportId(null);
        }}
      />

      <AddInBodyModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        memberId={memberId}
        onSuccess={() => {
          queryClient.invalidateQueries(['member-inbody', memberId]);
          queryClient.invalidateQueries(['member-inbody-progress', memberId]);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}

// ── InBody Sub-Components ──

function ProgressMetric({ label, value, unit, inverse = false }) {
  const isPositiveChange = value > 0;
  const isImprovement = inverse ? !isPositiveChange : isPositiveChange;
  
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[28px] p-5 text-center min-w-[120px] border border-white/10 shadow-inner">
      <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        <p className="text-2xl font-black text-white">{Math.abs(value || 0)}</p>
        <span className="text-[10px] font-bold text-white/60 mb-1">{unit}</span>
      </div>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase mt-2 ${isImprovement ? 'bg-brand-green/20 text-brand-green' : 'bg-red-500/20 text-red-400'}`}>
        {value === 0 ? '—' : (isImprovement ? '↓ Improved' : '↑ Increased')}
      </div>
    </div>
  );
}

function LatestMetricCard({ label, value, unit, change, inverse = false }) {
  const isNeutral = !change || change === 0;
  const isPositive = change > 0;
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-green/30 transition-all">
      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-900">{value || '—'}</span>
          <span className="text-[10px] font-bold text-slate-400">{unit}</span>
        </div>
      </div>
      {!isNeutral && (
        <div className={`flex flex-col items-end ${isGood ? 'text-brand-green' : 'text-red-500'}`}>
          <div className="flex items-center gap-1 font-black text-xs">
            {isGood ? '↓' : '↑'} {Math.abs(change)}
          </div>
          <span className="text-[8px] font-bold uppercase opacity-60">Since last</span>
        </div>
      )}
    </div>
  );
}

function InBodyDetailModal({ open, onClose, memberId, reportId, onDelete }) {
  const [hasImageError, setHasImageError] = useState(false);

  // Reset error state when switching reports
  useEffect(() => {
    setHasImageError(false);
  }, [reportId]);

  const { data, isLoading } = useQuery({
    queryKey: ['inbody-report', reportId],
    queryFn: () => inbodyApi.getMemberInBodyById(memberId, reportId).then(r => r.data.data),
    enabled: !!reportId
  });

  const deleteMutation = useMutation({
    mutationFn: () => inbodyApi.remove(reportId),
    onSuccess: () => {
      toast.success('Report deleted successfully');
      onDelete();
    }
  });

  if (!reportId) return null;

  const report = data?.report;
  const comparison = data?.comparison;

  return (
    <Modal open={open} onClose={onClose} title="Report Details" size="xl">
      {isLoading ? <div className="p-20 text-center"><LoadingSpinner /></div> : (
        <div className="p-8 space-y-10 font-inter max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Top Info */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">InBody Results</h2>
              <p className="text-slate-500 font-bold text-sm">{new Date(report.reportDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
            </div>
            <div className="text-right space-y-2">
              <div className="inline-flex items-center gap-3 bg-brand-green/10 text-brand-green px-5 py-2 rounded-2xl">
                <span className="text-xs font-black uppercase tracking-widest">Score</span>
                <span className="text-2xl font-black">{report.score}</span>
              </div>
            </div>
          </div>

          {/* Composition Bars */}
          <div className="space-y-8 bg-slate-50 rounded-[32px] p-8 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Body Composition Analysis</h3>
            <CompositionBar label="Muscle Mass" value={report.muscleMass} max={50} color="bg-brand-green" unit="kg" />
            <CompositionBar label="Body Fat Mass" value={(report.weight * report.bodyFatPercentage / 100).toFixed(1)} max={40} color="bg-brand-yellow-dark" unit="kg" />
            <CompositionBar label="Body Water" value={report.bodyWater} max={60} color="bg-blue-500" unit="L" />
          </div>

          {/* Grid of All Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailMetric label="BMR" value={report.bmr} unit="kcal" />
            <DetailMetric label="Protein" value={report.protein} unit="kg" />
            <DetailMetric label="Minerals" value={report.minerals} unit="kg" />
            <DetailMetric label="BMI" value={report.bmi} unit="kg/m²" />
            <DetailMetric label="Visceral Fat" value={report.visceralFat} unit="lvl" />
            <DetailMetric label="Skeletal Muscle" value={report.skeletalMuscleMass} unit="kg" />
            <DetailMetric label="Weight" value={report.weight} unit="kg" />
            <DetailMetric label="Fat %" value={report.bodyFatPercentage} unit="%" />
          </div>

          {/* Attachment */}
          {report.attachment && (() => {
            const getAttachmentUrl = (attachment) => {
              if (!attachment) return null;
              if (attachment.startsWith('http')) return attachment;
              const baseUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
              return `${baseUrl}/uploads/inbody/${attachment}`;
            };

            const isPDF = report.attachment.toLowerCase().endsWith('.pdf');
            const attachmentUrl = getAttachmentUrl(report.attachment);

            return (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Attached Document</h3>
                {isPDF ? (
                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100 group hover:border-brand-green/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800">InBody Analysis PDF</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Analysis</p>
                    </div>
                    <a 
                      href={attachmentUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-primary !px-6 !h-10 text-[10px]"
                    >
                      View PDF Report
                    </a>
                  </div>
                ) : (
                  <div className="relative group rounded-3xl overflow-hidden border-4 border-white shadow-xl max-w-sm aspect-[4/3] bg-slate-50">
                    {hasImageError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                        <ImageOff className="w-12 h-12" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Image not found</span>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={attachmentUrl} 
                          alt="InBody Report" 
                          className="w-full h-full object-cover"
                          onError={() => {
                            setHasImageError(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a 
                            href={attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn-primary !rounded-full p-4"
                          >
                            <Search className="w-6 h-6" />
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Actions */}
          <div className="pt-8 border-t flex justify-between items-center">
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to delete this report?')) {
                  deleteMutation.mutate();
                }
              }}
              className="text-red-500 font-bold text-xs flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              <History className="w-4 h-4 rotate-180" /> Delete Report
            </button>
            <button onClick={onClose} className="btn-secondary px-10">Close Analysis</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AddInBodyModal({ open, onClose, memberId, onSuccess }) {
  const { register, handleSubmit, formState: { isSubmitting }, reset, watch, setValue } = useForm({
    defaultValues: {
      reportDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchedAttachment = watch('attachment');
  const selectedFile = watchedAttachment?.[0] || null;
  const filePreviewUrl = selectedFile && selectedFile.type?.startsWith('image/')
    ? URL.createObjectURL(selectedFile)
    : null;

  const mutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'attachment') {
          // Only append if a real file was selected
          if (data[key] instanceof FileList && data[key].length > 0) {
            formData.append('attachment', data[key][0]);
          }
        } else {
          const val = data[key];
          // Skip undefined/null/empty strings — don't pollute the payload
          if (val !== undefined && val !== null && val !== '') {
            formData.append(key, val);
          }
        }
      });
      return inbodyApi.createForMember(memberId, formData);
    },
    onSuccess: () => {
      toast.success('InBody report uploaded successfully');
      reset();
      onSuccess();
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Upload InBody Analysis" size="lg">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-8 font-inter">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="col-span-full md:col-span-2 space-y-2">
            <label className="label">Report Date</label>
            <input type="date" {...register('reportDate', { required: true })} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">InBody Score (0-100)</label>
            <input type="number" {...register('score')} className="input !bg-slate-50 border-none text-brand-green font-black" placeholder="e.g. 78" />
          </div>

          <div className="border-t col-span-full my-2 pt-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Composition</h4>
          </div>

          <div className="space-y-2">
            <label className="label">Weight (kg)</label>
            <input type="number" step="0.1" {...register('weight')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">Body Fat %</label>
            <input type="number" step="0.1" {...register('bodyFatPercentage')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">Muscle Mass (kg)</label>
            <input type="number" step="0.1" {...register('muscleMass')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">BMI (kg/m²)</label>
            <input type="number" step="0.1" {...register('bmi')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">BMR (kcal)</label>
            <input type="number" step="1" {...register('bmr')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">Skeletal Muscle (kg)</label>
            <input type="number" step="0.1" {...register('skeletalMuscleMass')} className="input !bg-slate-50 border-none" />
          </div>

          <div className="border-t col-span-full my-2 pt-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Health</h4>
          </div>

          <div className="space-y-2">
            <label className="label">Body Water (L)</label>
            <input type="number" step="0.1" {...register('bodyWater')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">Protein (kg)</label>
            <input type="number" step="0.1" {...register('protein')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">Minerals (kg)</label>
            <input type="number" step="0.1" {...register('minerals')} className="input !bg-slate-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="label">Visceral Fat Level</label>
            <input type="number" step="1" {...register('visceralFat')} className="input !bg-slate-50 border-none" />
          </div>

          {/* File Upload with Live Preview */}
          <div className="col-span-full space-y-3 pt-4">
            <label className="label">Attachment (Image or PDF)</label>
            <input type="file" accept="image/*,.pdf" {...register('attachment')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20" />
            
            {/* Live Preview */}
            {selectedFile && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border-2 border-white shadow-md">
                    <FileText className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('attachment', undefined)}
                  className="text-red-400 hover:text-red-600 text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary !px-12">
            {isSubmitting ? 'Uploading...' : 'Complete Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CompositionBar({ label, value, max, color, unit }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-slate-900">{value} {unit}</span>
      </div>
      <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function DetailMetric({ label, value, unit }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-slate-800">{value || '—'}</span>
        <span className="text-[9px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

// ── Modals Implementation ──

function EditMemberModal({ open, onClose, member, onSuccess }) {
  const { isSuperAdmin, defaultBranchId } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      ...member,
      branchId: member.branchId || defaultBranchId || ''
    }
  });

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => branchesApi.list().then(r => r.data.data || []),
  });

  const mutation = useMutation({
    mutationFn: (data) => membersApi.update(member.id, data),
    onSuccess: () => onSuccess()
  });

  return (
    <Modal open={open} onClose={onClose} title="Update Member Profile" size="lg">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6 p-6 font-inter">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
            <input {...register('firstName')} className="input w-full !bg-slate-50 border-none focus:!bg-white focus:ring-2 focus:ring-brand-green/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
            <input {...register('lastName')} className="input w-full !bg-slate-50 border-none focus:!bg-white focus:ring-2 focus:ring-brand-green/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <input {...register('email')} className="input w-full !bg-slate-50 border-none focus:!bg-white focus:ring-2 focus:ring-brand-green/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <input {...register('phone')} className="input w-full !bg-slate-50 border-none focus:!bg-white focus:ring-2 focus:ring-brand-green/20" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Assignment</label>
            <select 
              {...register('branchId')}
              disabled={!!defaultBranchId}
              className="input w-full !bg-slate-50 border-none focus:!bg-white focus:ring-2 focus:ring-brand-green/20 appearance-none disabled:opacity-60"
            >
              <option value="">Select Branch</option>
              {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
            <select 
              {...register('gender')}
              className="input w-full !bg-slate-50 border-none focus:!bg-white focus:ring-2 focus:ring-brand-green/20 appearance-none"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>
        <div className="pt-6 flex justify-end gap-3 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary px-10">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


// ── Utility Components ──

function GlassPill({ icon: Icon, count, label }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[28px] p-6 text-center min-w-[110px] border border-white/10 shadow-xl group-hover:bg-white/10 transition-all duration-300">
      <div className="w-10 h-10 rounded-2xl bg-brand-green/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
        <Icon className="w-5 h-5 text-brand-green" />
      </div>
      <p className="text-3xl font-black leading-none text-white">{count ?? 0}</p>
      <p className="text-[9px] font-bold text-white/40 uppercase mt-2.5 tracking-[0.15em]">{label}</p>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-sm">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-800">{value}</span>
    </div>
  );
}

function EmptyTabState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center mx-auto text-slate-200 border border-slate-100 shadow-inner">
        <Icon className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">{subtitle}</p>
      </div>
      {actionLabel && <button onClick={onAction} className="btn-secondary !px-10">{actionLabel}</button>}
    </div>
  );
}
