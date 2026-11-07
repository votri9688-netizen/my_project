'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Pass toggle opener to children / pages */}
        {typeof children === 'function' ? children({ openSidebar: () => setSidebarOpen(true) }) : children}
      </div>
    </div>
  );
}
