import { useQuery } from '@tanstack/react-query';
import {
  Wallet, 
  Users, 
  CalendarDays, 
  UserCheck, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Layers,
  Activity,
  Award
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { reportsApi, membersApi } from '../../api/endpoints';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const CHART_COLORS = ['#1ea43e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

export default function DashboardPage() {
  const { defaultBranchId } = useAuth();
  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard', defaultBranchId],
    queryFn: () => reportsApi.dashboard({ branchId: defaultBranchId || undefined }).then((r) => r.data.data),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-chart', defaultBranchId],
    queryFn: () => reportsApi.revenue({ groupBy: 'day', branchId: defaultBranchId || undefined }).then((r) => r.data.data),
  });

  const { data: recentMembers } = useQuery({
    queryKey: ['recent-members', defaultBranchId],
    queryFn: () => membersApi.list({ page: 1, pageSize: 5, branchId: defaultBranchId || undefined }).then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const stats = {
    todayRevenue: dash?.today?.revenue || 0,
    todayRevenueTrend: dash?.today?.revenueTrend || '0%',
    newMembersToday: dash?.today?.newMembers || 0,
    newMembersTrend: dash?.today?.newMembersTrend || '0%',
    bookingsToday: dash?.today?.bookings || 0,
    bookingsTrend: dash?.today?.bookingsTrend || '0%',
    checkInsToday: dash?.today?.checkIns || 0,
    checkInsTrend: dash?.today?.checkInsTrend || '0%',
    monthRevenue: dash?.thisMonth?.revenue || 0,
    monthNewMembers: dash?.thisMonth?.newMembers || 0,
    activeSubscriptions: dash?.thisMonth?.activeSubscriptions || 0,
  };

  const revenueChartData = revenueData?.byPeriod?.map((d) => ({
    date: d.period,
    revenue: Number(d.revenue) || 0,
  })) || [];

  const bookingsByType = [
    { name: 'Group Class', value: dash?.bookingsByType?.GROUP_CLASS || 0 },
    { name: 'Private Training', value: dash?.bookingsByType?.PRIVATE_TRAINING || 0 },
    { name: 'Massage Therapy', value: dash?.bookingsByType?.MASSAGE || 0 },
  ];

  const alerts = dash?.alerts || [];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Real-time analytical overview of Tonus Club operations.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 self-start">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Operations Active</span>
        </div>
      </div>

      {/* Premium KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Monthly Revenue (Featured) */}
        <div className="bg-gradient-to-br from-[#0c3115] via-[#177b2f] to-[#0b2912] rounded-3xl p-6 shadow-xl shadow-emerald-950/10 min-h-[140px] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-15 transform group-hover:scale-110 transition-transform">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <Award className="w-8 h-8 text-[#177b2f]" />
            </div>
          </div>
          <div>
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider block">Monthly Total Revenue</span>
            <h3 className="text-3xl font-black mt-1.5 tracking-tight">EGP {Number(stats.monthRevenue).toLocaleString()}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
              This Month
            </span>
          </div>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100/40 border border-slate-100/50 min-h-[140px] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 transform group-hover:scale-110 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Today's Revenue</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1.5 tracking-tight">EGP {Number(stats.todayRevenue).toLocaleString()}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter ${stats.todayRevenueTrend.startsWith('-') ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
              {stats.todayRevenueTrend.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {stats.todayRevenueTrend} vs yesterday
            </span>
          </div>
        </div>

        {/* Card 3: Active Subscriptions */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100/40 border border-slate-100/50 min-h-[140px] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 transform group-hover:scale-110 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Memberships</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1.5 tracking-tight">{stats.activeSubscriptions}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
              + {stats.monthNewMembers} joined this month
            </span>
          </div>
        </div>

        {/* Card 4: Active Check-ins */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100/40 border border-slate-100/50 min-h-[140px] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 transform group-hover:scale-110 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Today's Check-ins</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1.5 tracking-tight">{stats.checkInsToday}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter ${stats.checkInsTrend.startsWith('-') ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
              {stats.checkInsTrend.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {stats.checkInsTrend} vs yesterday
            </span>
          </div>
        </div>

      </div>

      {/* Row 1: Revenue Performance & Service Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/35">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
              <p className="text-sm text-slate-400">Financial growth over the last 30 days</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none hover:bg-slate-100 transition-colors cursor-pointer">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1ea43e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1ea43e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1ea43e" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Donut Chart */}
        <div className="bg-white rounded-3xl p-6 flex flex-col border border-slate-100 shadow-xl shadow-slate-100/35">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Service Mix</h3>
            <p className="text-sm text-slate-400">Distribution by booking category</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    stroke="none"
                  >
                    {bookingsByType.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Products & Packages Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/35">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
              <p className="text-sm text-slate-400">Product upsells based on real items sold</p>
            </div>
            <div className="p-2 bg-emerald-50 text-brand-green rounded-xl border border-emerald-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dash?.topProducts || []}
                layout="vertical"
                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="quantity" fill="#1ea43e" radius={[0, 8, 8, 0]} barSize={16}>
                  {(dash?.topProducts || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Packages Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/35">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Membership Packages</h3>
              <p className="text-sm text-slate-400">Sales revenue distribution by package type</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dash?.packageSales || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value) => [`EGP ${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={32}>
                  {(dash?.packageSales || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 1) % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Payment Methods, System Alerts, and Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Payment Methods Mix */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/35">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Payment Methods</h3>
              <p className="text-xs text-slate-400">Preferred transaction channels</p>
            </div>
          </div>

          <div className="space-y-5 mt-4">
            {(dash?.paymentMethods || []).map((pm, idx) => {
              const totalSum = (dash?.paymentMethods || []).reduce((acc, curr) => acc + curr.revenue, 0);
              const percentage = totalSum > 0 ? (pm.revenue / totalSum) * 100 : 0;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{pm.method}</span>
                    <span>EGP {Number(pm.revenue).toLocaleString()} ({pm.count})</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="bg-brand-green h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-brand-yellow-light/20 rounded-3xl p-6 border border-brand-yellow/15 shadow-xl shadow-slate-100/35">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-brand-yellow text-brand-green-darker flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-800" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">System Alerts</h3>
              <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full tracking-wider">Attention Required</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className="flex gap-3 items-start group p-2.5 rounded-2xl hover:bg-amber-500/5 transition-colors">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">{alert.message || alert}</p>
              </div>
            )) : (
              ['No expiring subscriptions', 'All support tickets replied', 'Product stock normal'].map((txt, i) => (
                <div key={i} className="flex gap-3 items-start group p-2.5 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{txt}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/35 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recently Joined</h3>
                <p className="text-xs text-slate-400">Welcome the newest members</p>
              </div>
              <Link to="/members" className="flex items-center gap-1 text-xs font-bold text-brand-green hover:underline">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {(recentMembers || []).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green text-xs font-bold border-2 border-white shadow-sm shrink-0">
                      {m.firstName?.[0]}{m.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 leading-tight">{m.firstName} {m.lastName}</p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight">{m.branch?.name || '—'}</p>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
