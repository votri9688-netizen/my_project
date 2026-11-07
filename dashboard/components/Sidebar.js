'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: '📊' },
    { href: '/fanpages', label: 'Fanpages', icon: '📱' },
    { href: '/reels', label: 'Reels History', icon: '🎬' },
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

      {/* Sidebar Container: Fixed on Desktop, Slide-over Drawer on Mobile */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="font-bold text-base text-white">Reels AutoBot</h1>
              <p className="text-[11px] text-slate-400">Mobile & Web Hub</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors touch-manipulation min-h-[46px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between mb-1">
            <span>FastAPI:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              ● Online
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Telegram Bot: Active</p>
        </div>
      </aside>
    </>
  );
}
