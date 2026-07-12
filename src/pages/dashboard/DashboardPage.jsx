import { useQuery } from '@tanstack/react-query';
import {
  Wallet, Users, CalendarDays, UserCheck, AlertTriangle, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { reportsApi, membersApi } from '../../api/endpoints';
import StatCard from '../../components/charts/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const CHART_COLORS = ['#1ea43e', '#fced3c', '#6b7280', '#3b82f6'];

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
    newMembersToday: dash?.today?.newMembers || 0,
    bookingsToday: dash?.today?.bookings || 0,
    checkInsToday: dash?.today?.checkIns || 0,
    monthRevenue: dash?.thisMonth?.revenue || 0,
    monthNewMembers: dash?.thisMonth?.newMembers || 0,
  };

  const revenueChartData = revenueData?.byPeriod?.map((d) => ({
    date: d.period,
    revenue: Number(d.revenue) || 0,
  })) || [];

  const bookingsByType = [
    { name: 'Group Class', value: dash?.bookingsByType?.GROUP_CLASS || 0 },
    { name: 'Private', value: dash?.bookingsByType?.PRIVATE_TRAINING || 0 },
    { name: 'Massage', value: dash?.bookingsByType?.MASSAGE || 0 },
  ];

  const alerts = dash?.alerts || [];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, here&apos;s your club status today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live System Status</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`EGP ${Number(stats.todayRevenue).toLocaleString()}`}
          icon={Wallet}
          featured
        />
        <StatCard
          title="New Members"
          value={stats.newMembersToday}
          icon={Users}
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookingsToday}
          icon={CalendarDays}
        />
        <StatCard
          title="Active Check-ins"
          value={stats.checkInsToday}
          icon={UserCheck}
          change="+8.0%"
          trend="up"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 card p-6 border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
              <p className="text-sm text-slate-400">Financial growth over the last 30 days</p>
            </div>
            <select className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer">
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
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
        <div className="card p-6 flex flex-col border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Service Mix</h3>
          <p className="text-sm text-slate-400 mb-8">Distribution by category</p>
          <div className="flex-1 flex flex-col items-center justify-center">
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
                    outerRadius={100}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {bookingsByType.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts & Critical Info */}
        <div className="card p-6 bg-brand-yellow-light/30 border-brand-yellow/20 border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-brand-green-darker" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">System Alerts</h3>
              <span className="text-[10px] font-bold text-brand-green-darker uppercase bg-brand-yellow/20 px-2 py-0.5 rounded-full tracking-wider">Attention Required</span>
            </div>
          </div>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 group-hover:scale-150 transition-transform" />
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{alert.message || alert}</p>
              </div>
            )) : (
              ['5 subscriptions expiring in 7 days', '2 support tickets waiting for reply', 'Low stock: Protein Shake (3 left)'].map((txt, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green mt-2 group-hover:scale-150 transition-transform" />
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{txt}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Members Table */}
        <div className="lg:col-span-2 card p-0 overflow-hidden border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recently Joined</h3>
              <p className="text-sm text-slate-400">Welcome the newest members of Tonus</p>
            </div>
            <Link to="/members" className="flex items-center gap-1 text-xs font-bold text-brand-green hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Member</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {(recentMembers || []).map((m) => (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green text-xs font-bold border-2 border-white shadow-sm">
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-medium text-slate-500">{m.branch?.name || '—'}</td>
                    <td className="table-cell text-center">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="table-cell text-right font-bold text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
