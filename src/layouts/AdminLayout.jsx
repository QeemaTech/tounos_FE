import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import QeemaCopyrightBadge from '../components/common/QeemaCopyrightBadge';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="py-4 px-6 lg:px-8 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Tonus Club. جميع الحقوق محفوظة.</span>
          <QeemaCopyrightBadge variant="light" />
        </footer>
      </div>

    </div>
  );
}

