'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: '📊' },
    { href: '/fanpages', label: 'Fanpages', icon: '📱' },
    { href: '/reels', label: 'Reels History', icon: '🎬' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <span className="text-2xl">⚡</span>
        <div>
          <h1 className="font-bold text-lg text-white">Reels AutoBot</h1>
          <p className="text-xs text-slate-400">Meta & AI Pipeline v1.0</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
          <span>API Backend:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            ● Online
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Docker + Celery + Redis</p>
      </div>
    </aside>
  );
}
