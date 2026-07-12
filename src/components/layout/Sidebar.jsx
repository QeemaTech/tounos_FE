import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, CalendarDays, ClipboardList, Wallet, 
  Dumbbell, GraduationCap, Heart, Package, 
  ShoppingCart, Tag, ListOrdered, Snowflake, 
  MessageSquare, BarChart3, Settings, GitBranch, X,
  LayoutList, Layers, Calendar, ShieldCheck, ScrollText
} from 'lucide-react';
import PermissionGuard from '../ui/PermissionGuard';

const NAV_GROUPS = [
  {
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'Management',
    items: [
      { path: '/members', icon: Users, label: 'Members', permission: 'members.read' },
      { path: '/bookings', icon: CalendarDays, label: 'Bookings', permission: 'bookings.read' },
      { path: '/subscriptions', icon: ClipboardList, label: 'Subscriptions', permission: 'subscriptions.read' },
      { path: '/payments', icon: Wallet, label: 'Payments', permission: 'payments.read' },
      { path: '/attendance', icon: UserCheck, label: 'Attendance', permission: 'attendance.read' },
    ]
  },
  {
    title: 'Services',
    items: [
      { path: '/categories', icon: LayoutList, label: 'Categories', permission: 'services.read' },
      { path: '/services', icon: ListOrdered, label: 'Services Catalog', permission: 'services.read' },
      { path: '/classes', icon: Calendar, label: 'Classes', permission: 'classes.read' },
      { path: '/trainers', icon: GraduationCap, label: 'Trainers', permission: 'trainers.read' },
      { path: '/therapists', icon: Heart, label: 'Therapists', permission: 'therapists.read' },
      { path: '/massage', icon: Heart, label: 'Massage', permission: 'services.read' },
      { path: '/private-training', icon: Dumbbell, label: 'Private Training', permission: 'services.read' },
      { path: '/packages', icon: Package, label: 'Packages', permission: 'packages.read' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/products', icon: ShoppingCart, label: 'Inventory', permission: 'products.read' },
      { path: '/promo-codes', icon: Tag, label: 'Offers', permission: 'promos.read' },
      { path: '/orders', icon: ListOrdered, label: 'Orders', permission: 'orders.read' },
      { path: '/freezes', icon: Snowflake, label: 'Freezes', permission: 'subscriptions.read' },
    ]
  },
  {
    title: 'Business',
    items: [
      { path: '/support', icon: MessageSquare, label: 'Support', permission: 'support.read' },
      { path: '/reports', icon: BarChart3, label: 'Analytics', permission: 'reports.read' },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { path: '/branches', icon: GitBranch, label: 'Branches', superAdminOnly: true },
      { path: '/admins', icon: ShieldCheck, label: 'Admin Users', superAdminOnly: true },
      { path: '/audit-logs', icon: ScrollText, label: 'Audit Logs', permission: 'audit_logs.read' },
      { path: '/settings', icon: Settings, label: 'Settings', permission: 'settings.read' },
    ]
  }
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0b3916] text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none text-white uppercase">TONUS CLUB</h1>
              <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">Management</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar py-8">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="mb-8">
              {group.title && (
                <span className="block px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
                  {group.title}
                </span>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  item.superAdminOnly ? (
                    <PermissionGuard key={item.path} superAdminOnly>
                      <SidebarLink item={item} isActive={location.pathname === item.path} onClick={onClose} />
                    </PermissionGuard>
                  ) : item.permission ? (
                    <PermissionGuard key={item.path} permission={item.permission}>
                      <SidebarLink item={item} isActive={location.pathname === item.path} onClick={onClose} />
                    </PermissionGuard>
                  ) : (
                    <SidebarLink key={item.path} item={item} isActive={location.pathname === item.path} onClick={onClose} />
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 px-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-center gap-2 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Stable v2.4.0</p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
        />
      )}
    </>
  );
}

function SidebarLink({ item, isActive, onClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={() => {
        if (window.innerWidth < 1024) onClick();
      }}
      className={`
        flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group relative rounded-xl
        ${isActive 
          ? 'bg-brand-green text-white font-bold shadow-lg shadow-brand-green/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }
      `}
    >
      <item.icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
      <span>{item.label}</span>
    </NavLink>
  );
}
