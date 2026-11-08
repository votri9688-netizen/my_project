'use client';
import { useState } from 'react';
import Header from '../../components/Header';

export default function ErrorsPage() {
  const [logs, setLogs] = useState([
    {
      id: 'ERR-1092',
      type: 'META_API_RATE_LIMIT',
      badge: 'warning',
      badgeLabel: 'Cảnh Báo (Vàng)',
      page: 'Hội Thích Ngắm Gái',
      message: 'Tần suất gọi API Meta quá nhanh. Tự động lùi thời gian gọi 60s.',
      retryCount: 1,
      maxRetry: 3,
      status: 'auto_healed',
      time: '14:20:15 - Hôm nay',
    },
    {
      id: 'ERR-1091',
      type: 'FFMPEG_TEMP_BUFFER_HIGH',
      badge: 'processing',
      badgeLabel: 'Đang Xử Lý (Xanh Dương)',
      page: 'Hệ Thống Lõi',
      message: 'Bộ nhớ đệm đạt 150MB. Đã tự động kích hoạt Auto-Purge dọn sạch về 0 byte.',
      retryCount: 0,
      maxRetry: 3,
      status: 'resolved',
      time: '13:45:00 - Hôm nay',
    },
    {
      id: 'ERR-1090',
      type: 'AI_PROVIDER_FAILOVER',
      badge: 'healed',
      badgeLabel: 'Tự Sửa Lỗi (Xanh Lá)',
      page: 'Ly Ly Vibe',
      message: 'Khóa Groq #1 chạm rate limit -> Tự động chuyển mượt sang Groq Backup Key #2.',
      retryCount: 1,
      maxRetry: 3,
      status: 'auto_healed',
      time: '12:10:44 - Hôm nay',
    },
    {
      id: 'ERR-1089',
      type: 'NETWORK_TIMEOUT',
      badge: 'critical',
      badgeLabel: 'Lỗi Nghiêm Trọng (Đỏ)',
      page: 'TiTi Store',
      message: 'Mất kết nối mạng tạm thời khi gửi request upload chunk #2.',
      retryCount: 3,
      maxRetry: 3,
      status: 'alert_sent_telegram',
      time: '10:02:11 - Hôm nay',
    },
  ]);

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'healed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleTriggerRepair = (id) => {
    alert(`Đã kích hoạt quy trình Auto-Repair vòng mới cho log ${id}!`);
  };

  return (
    <div>
      <Header
        title="Nhật Ký Lỗi & AI Auto-Repair"
        subtitle="Hệ thống tự phục hồi tối đa 3 vòng, quản lý 5 mã màu trạng thái và bắn cảnh báo Telegram"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* 5 Mã Màu Trạng Thái Giải Thích */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-slate-800">5 Mã Màu Trạng Thái Hệ Thống (Status Badges)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs text-center font-bold">
            <div className="p-2.5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200">
              🟢 Xanh Lá
              <span className="block font-normal text-[10px] text-emerald-600 mt-0.5">Auto-Healed / Thành công</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-800 border-blue-200">
              🔵 Xanh Dương
              <span className="block font-normal text-[10px] text-blue-600 mt-0.5">Đang xử lý / Purging</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-amber-50 text-amber-800 border-amber-200">
              🟡 Vàng
              <span className="block font-normal text-[10px] text-amber-600 mt-0.5">Cảnh báo Quota / Rate limit</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-orange-50 text-orange-800 border-orange-200">
              🟠 Cam
              <span className="block font-normal text-[10px] text-orange-600 mt-0.5">Auto-Repair vòng 1, 2</span>
            </div>
            <div className="p-2.5 rounded-xl border bg-rose-50 text-rose-800 border-rose-200">
              🔴 Đỏ
              <span className="block font-normal text-[10px] text-rose-600 mt-0.5">Lỗi sau 3 lần & Báo Telegram</span>
            </div>
          </div>
        </div>

        {/* Danh sách log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Nhật Ký Vận Hành Thời Gian Thực</h4>
              <p className="text-[11px] text-slate-500">Ghi nhận mọi biến động, tự sửa lỗi hoặc gửi cảnh báo khẩn</p>
            </div>
            <button
              onClick={() => alert('Đã dọn sạch các log đã tự sửa lỗi thành công!')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              🧹 Dọn Log Đã Xong
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-slate-700">{log.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(log.badge)}`}>
                      {log.badgeLabel}
                    </span>
                    <span className="text-slate-500">Kênh: <strong>{log.page}</strong></span>
                  </div>
                  <p className="text-slate-800 font-medium mt-1">{log.message}</p>
                  <p className="text-[11px] text-slate-400">Thời gian: {log.time} • Số lần thử lại: {log.retryCount}/{log.maxRetry}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleTriggerRepair(log.id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-xs transition"
                  >
                    🛠️ Auto-Repair
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
