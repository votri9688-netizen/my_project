'use client';

export default function Header({ title, subtitle }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-600">FastAPI Ready</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow">
          A
        </div>
      </div>
    </header>
  );
}
