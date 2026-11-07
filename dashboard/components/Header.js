'use client';
import { useSidebar } from './SidebarContext';

export default function Header({ title, subtitle }) {
  const { openSidebar } = useSidebar();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 md:px-8 md:py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu button on Mobile */}
        <button
          onClick={openSidebar}
          aria-label="Open menu"
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 shadow-xs"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h2 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
          {subtitle && <p className="hidden md:block text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-semibold text-emerald-700">Online</span>
        </div>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs md:text-sm shadow">
          A
        </div>
      </div>
    </header>
  );
}
