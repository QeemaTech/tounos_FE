import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { reportsApi, branchesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  Users, UserCheck, Snowflake, UserMinus, ShoppingBag, 
  Ticket, Calendar, DollarSign, Zap, TrendingUp, 
  MapPin, HelpCircle, FileText, Download, ChevronDown,
  ArrowUpRight, ArrowDownRight, Activity, Clock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const COLORS = {
  indigo: '#6366f1',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  slate: '#64748b'
};

const KpiCard = ({ title, value, icon: Icon, color, trend, trendValue, tooltip, isLoading }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    violet: 'bg-violet-50 text-violet-600'
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm animate-pulse">
        <div className="w-10 h-10 bg-slate-100 rounded-2xl mb-4" />
        <div className="w-16 h-2 bg-slate-50 rounded mb-2" />
        <div className="w-24 h-6 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="group/tip relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50">
            {tooltip}
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
        <div className="flex items-end gap-2">
          <span className="text-xl font-black text-slate-800">
            {typeof value === 'number' && title.includes('Revenue') ? `EGP ${value.toLocaleString()}` : value}
          </span>
          {trendValue !== undefined && trendValue !== 0 && (
            <div className={`flex items-center gap-0.5 mb-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black ${
              trendValue > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {trendValue > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              {Math.abs(trendValue)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const { isSuperAdmin, defaultBranchId } = useAuth();
  const [dateRange, setDateRange] = useState('last30days');
  const [branchFilter, setBranchFilter] = useState(defaultBranchId || '');

  const { data: branches } = useQuery({
    queryKey: ['branches-list-simple'],
    queryFn: () => branchesApi.list({ pageSize: 100 }).then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['mega-analytics-wired', { branchId: branchFilter, dateRange }],
    queryFn: () => reportsApi.analytics({ 
      branchId: branchFilter || undefined, 
      dateRange 
    }).then(r => r.data.data),
    keepPreviousData: true
  });

  const mega = data?.megaStats || {};
  const healthData = [
    { name: 'Active', value: mega.activeSubscriptions || 0, fill: COLORS.emerald },
    { name: 'Frozen', value: mega.frozenSubscriptions || 0, fill: COLORS.indigo }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-inter pb-20 max-w-[1700px] mx-auto px-4 lg:px-8">
      <PageHeader 
        title="Business Command Center" 
        subtitle="Real-time operational & financial intelligence" 
        breadcrumbs={[{ label: 'Intelligence' }, { label: 'Reports' }]} 
        action={
          <div className="flex items-center gap-3">
             <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                <button onClick={() => toast.success('PDF Export Started')} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-all border-r border-slate-100" title="Export PDF"><FileText className="w-4.5 h-4.5" /></button>
                <button onClick={() => toast.success('Excel Export Started')} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-emerald-500 transition-all" title="Export Excel"><Download className="w-4.5 h-4.5" /></button>
             </div>
             
             <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={branchFilter} disabled={!!defaultBranchId} onChange={e => setBranchFilter(e.target.value)} className="h-12 bg-white border border-slate-200 rounded-2xl pl-10 pr-10 text-[11px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/5 outline-none cursor-pointer disabled:opacity-60">
                {!defaultBranchId && <option value="">Global Network</option>}
                {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="h-12 bg-white border border-slate-200 rounded-2xl pl-10 pr-10 text-[11px] font-black uppercase tracking-widest text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/5 outline-none cursor-pointer">
                <option value="last30days">Trailing 30 Days</option>
                <option value="thisMonth">Fiscal Month</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        }
      />

      {/* THE MEGA-STAT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <KpiCard isLoading={isLoading} title="Total Members" value={mega.totalMembers || 0} trendValue={mega.totalMembersTrend} icon={Users} color="indigo" tooltip="Total registered members across selection" />
        <KpiCard isLoading={isLoading} title="Active Subs" value={mega.activeSubscriptions || 0} trendValue={mega.activeSubsTrend} icon={UserCheck} color="emerald" tooltip="Members with currently active subscriptions" />
        <KpiCard isLoading={isLoading} title="Currently Frozen" value={mega.frozenSubscriptions || 0} icon={Snowflake} color="cyan" tooltip="Subscriptions on hold due to freeze requests" />
        <KpiCard isLoading={isLoading} title="Expired (Total)" value={mega.expiredSubscriptions || 0} icon={UserMinus} color="rose" tooltip="Historical count of expired subscriptions" />
        <KpiCard isLoading={isLoading} title="Product Sales" value={mega.productSalesCount || 0} trendValue={mega.productSalesTrend} icon={ShoppingBag} color="amber" tooltip="Total items sold from inventory" />
        <KpiCard isLoading={isLoading} title="Open Support" value={mega.openTickets || 0} icon={Ticket} color="violet" tooltip="Active tickets requiring attention" />
        <KpiCard isLoading={isLoading} title="Daily Bookings" value={mega.todayBookings || 0} icon={Calendar} color="emerald" tooltip="Classes and PT sessions booked for today" />
        <KpiCard isLoading={isLoading} title="Net Revenue" value={mega.netRevenue || 0} icon={DollarSign} color="indigo" tooltip="Realized revenue in the selected period" />
        <KpiCard isLoading={isLoading} title="Conversion Rate" value={`${mega.conversionRate || 0}%`} icon={Zap} color="amber" tooltip="Leads to active membership conversion" />
        <KpiCard isLoading={isLoading} title="Avg Resolution" value={`${mega.avgResolution || 0}h`} icon={Clock} color="violet" tooltip="Average time to resolve support tickets" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Dynamics Chart */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Financial Dynamics</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Cash Flow & Operating Projections</p>
            </div>
          </div>
          <div className="h-[350px]">
            {isLoading ? <div className="h-full w-full bg-slate-50 rounded-3xl animate-pulse" /> : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <ComposedChart data={data?.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 800}} stroke="#cbd5e1" axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 10, fontWeight: 800}} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }} cursor={{ fill: '#f8fafc' }} />
                  <Area type="monotone" dataKey="revenue" fill="#6366f1" fillOpacity={0.05} stroke="#6366f1" strokeWidth={4} />
                  <Bar dataKey="expenses" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={20} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subscription Health Gauge */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col items-center">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-10 w-full text-center">Subscription Health</h3>
            <div className="relative w-full h-[300px]">
                {isLoading ? <div className="h-48 w-48 mx-auto bg-slate-50 rounded-full animate-pulse" /> : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                            <Pie data={healthData} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={120} paddingAngle={10} dataKey="value" stroke="none" cornerRadius={10}>
                                {healthData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-4xl font-black text-slate-800">{mega.activeSubscriptions || 0}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Active</p>
                </div>
            </div>
            <div className="w-full space-y-4 px-6 mt-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Members</span>
                    <span className="text-sm font-black text-emerald-700">{mega.activeSubscriptions || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Frozen Members</span>
                    <span className="text-sm font-black text-indigo-700">{mega.frozenSubscriptions || 0}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Leaderboard */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Branch Performance</h3>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-8">
            {isLoading ? [1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />) : (
                data?.branchLeaderboard?.map((b, i) => (
                    <div key={b.id} className="group cursor-default">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">0{i+1}</div>
                                <div>
                                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{b.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.members} Active Members</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800">EGP {b.revenue?.toLocaleString()}</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase">Growth: {Math.round(b.progress)}%</p>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min(100, b.progress)}%` }} />
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-10">Peak Hours (Traffic)</h3>
            <div className="h-[300px]">
                {isLoading ? <div className="h-full w-full bg-slate-50 rounded-3xl animate-pulse" /> : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={data?.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="hour" tick={{fontSize: 9, fontWeight: 900}} stroke="#64748b" axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
            <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest mt-6">Occupancy trends based on historical booking data</p>
        </div>
      </div>
    </div>
  );
}
