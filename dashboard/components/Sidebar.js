'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Tổng Quan', icon: '📊' },
    { href: '/fanpages', label: 'Quản Lý Fanpage', icon: '📱' },
    { href: '/sources', label: 'Nguồn & Quota 55/60', icon: '🌐' },
    { href: '/scheduler', label: 'Lập Lịch Giãn Cách', icon: '⏰' },
    { href: '/reports', label: 'Báo Cáo & Insight', icon: '📈' },
    { href: '/reels', label: 'Lịch Sử Xuất Bản', icon: '🎬' },
    { href: '/errors', label: 'Nhật Ký & Auto-Repair', icon: '🛡️' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">Cao Facebook</h1>
              <p className="text-[11px] text-blue-400 font-medium">B2B SaaS Auto Reels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs md:text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span>FastAPI:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              ● Online (Port 8000)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Zero-Disk Buffer:</span>
            <span className="text-[10px] text-blue-400 font-mono">0 MB / Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
