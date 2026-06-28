import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-6">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5 text-slate-500" />
        </button>
        
        {/* Search Bar - Modern Command Palette style */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 w-[380px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-green/10 transition-all border border-transparent focus-within:border-brand-green/20 relative">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-brand-green transition-colors" />
          <input
            type="text"
            placeholder="Search bookings, members, invoices..."
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full font-medium"
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm pointer-events-none select-none">
            <span className="text-[8px] opacity-70">Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-yellow text-brand-green-darker text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
            3
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        {/* User Profile Area - SaaS Polish */}
        <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
          <div className="hidden sm:block text-right pr-2">
            <p className="text-sm font-extrabold text-slate-800 leading-tight group-hover:text-brand-green transition-colors">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role?.displayName || user?.role?.name || 'Super Admin'}</p>
          </div>
          
          <div className="w-9 h-9 rounded-xl bg-brand-green text-white flex items-center justify-center font-black text-xs shadow-lg shadow-brand-green/20 group-hover:scale-105 transition-transform">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); logout(); }}
            className="p-2 ml-1 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
