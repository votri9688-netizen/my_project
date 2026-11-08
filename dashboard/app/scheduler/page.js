'use client';
import { useState } from 'react';
import Header from '../../components/Header';

export default function SchedulerPage() {
  const [schedules, setSchedules] = useState([
    { code: 'K01', name: 'Review Chập Chen', minute: '01', status: 'active', nextRun: '15:01' },
    { code: 'K02', name: 'Heo kể chuyển', minute: '02', status: 'active', nextRun: '15:02' },
    { code: 'K03', name: 'Ly Ly Vibe', minute: '03', status: 'active', nextRun: '15:03' },
    { code: 'K04', name: 'Hồ Sơ Vụ Án', minute: '04', status: 'active', nextRun: '15:04' },
    { code: 'K05', name: 'TiTi Store', minute: '05', status: 'active', nextRun: '15:05' },
    { code: 'K06', name: 'Hội Thích Ngắm Gái', minute: '06', status: 'active', nextRun: '15:06' },
    { code: 'K07', name: 'YuRi', minute: '07', status: 'active', nextRun: '15:07' },
    { code: 'K08', name: 'Xu Hướng Mỗi Ngày', minute: '08', status: 'active', nextRun: '15:08' },
    { code: 'K09', name: 'Vũ trụ Quanh Ta', minute: '09', status: 'active', nextRun: '15:09' },
  ]);

  const toggleSchedule = (code) => {
    setSchedules((prev) =>
      prev.map((s) => (s.code === code ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s))
    );
  };

  return (
    <div>
      <Header
        title="Lập Lịch Giãn Cách Theo Phút"
        subtitle="Bộ điều phối Celery Beat chống spam: K01:01, K02:02... cách nhau 1 phút, 1 bài/giờ"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Banner Anti-Spam */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⏱</span>
              <h3 className="font-bold text-base">Thuật Toán Giãn Cách Chống Bóp Tương Tác Meta</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Các kênh K01 đến K09 được xếp lịch so le cách nhau đúng 1 phút ở đầu mỗi khung giờ. Cơ chế này giúp server không bị quá tải CPU/RAM khi render video và bảo vệ IP không bị Facebook quét hạn chế.
            </p>
          </div>
          <div className="bg-blue-600/30 border border-blue-500/50 p-3 rounded-xl text-center shrink-0">
            <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider block">Chu kỳ lặp</span>
            <span className="text-lg font-extrabold text-blue-400">Mỗi 60 phút</span>
          </div>
        </div>

        {/* Timeline Visualizer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-slate-800">Khung Giờ Xuất Bản Trực Quan (00' - 10')</h4>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-xs">
            {schedules.map((s) => (
              <div
                key={s.code}
                className={`p-3 rounded-xl border transition ${
                  s.status === 'active'
                    ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="font-mono font-bold text-sm text-blue-600">:{s.minute}</div>
                <div className="font-bold mt-1 text-[11px] truncate">{s.code}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.status === 'active' ? '● Chạy' : 'Tạm dừng'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">Mã Kênh</th>
                <th className="py-3.5 px-6 font-semibold">Tên Fanpage</th>
                <th className="py-3.5 px-6 font-semibold">Mốc Phút Chạy</th>
                <th className="py-3.5 px-6 font-semibold">Lần Chạy Kế Tiếp</th>
                <th className="py-3.5 px-6 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-6 font-semibold text-right">Điều Khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <tr key={s.code} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6 font-mono font-bold text-blue-600">{s.code}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-4 px-6 font-mono font-semibold text-slate-700">XX:{s.minute}</td>
                  <td className="py-4 px-6 text-xs text-slate-600 font-mono">{s.nextRun}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                      s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status === 'active' ? '● Đang kích hoạt' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toggleSchedule(s.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        s.status === 'active'
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {s.status === 'active' ? 'Tạm dừng slot' : 'Kích hoạt slot'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
