'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { fanpageApi, reelApi } from '../lib/api';

export default function DashboardPage() {
  const [fanpages, setFanpages] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resFan, resReels] = await Promise.all([
        fanpageApi.list().catch(() => ({ data: [] })),
        reelApi.list().catch(() => ({ data: [] })),
      ]);
      setFanpages(resFan.data || []);
      setReels(resReels.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickProcess = async (id, name) => {
    try {
      setProcessingId(id);
      setMessage(null);
      const res = await fanpageApi.process(id, 'Xu Hướng Hot');
      setMessage(`Đã kích hoạt Reel cho kênh "${name}"! ID: #${res.data.reel_id}`);
      loadData();
    } catch (err) {
      setMessage(`Lỗi kích hoạt: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const totalQuota = fanpages.reduce((acc, p) => acc + (p.quota || 0), 0);
  const activeCount = fanpages.filter((p) => p.active).length;
  const publishedReels = reels.filter((r) => r.status === 'published').length;

  return (
    <div>
      <Header
        title="Tổng Quan Hệ Thống"
        subtitle="Tự động hóa Reels Facebook, AI Captioning & Celery Workers"
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {message && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs md:text-sm flex items-center justify-between shadow-xs">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="font-bold ml-3 p-1">✕</button>
          </div>
        )}

        {/* Stats Grid: 2 columns on Mobile, 4 columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Tổng Kênh Fanpage</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{fanpages.length}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              {activeCount} kênh bật
            </span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Reels Xuất Bản</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{publishedReels}</div>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
              {reels.length} tổng số bài
            </span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Hạn Mức Trong Ngày</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{totalQuota}</div>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">Reels / ngày</span>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs font-medium">Celery + Groq AI</span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">Sẵn Sàng</div>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">LLaMA 3.3 Active</span>
          </div>
        </div>

        {/* Quick Dispatch Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-800">Kích Hoạt Nhanh Kênh Reel</h3>
              <p className="text-[11px] text-slate-500">Render FFmpeg + Groq AI Caption + Đăng Meta Graph API</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {fanpages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Đang tải dữ liệu kênh...
              </div>
            ) : (
              fanpages.map((fan) => (
                <div
                  key={fan.id}
                  className="p-3.5 px-4 md:p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <span>{fan.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${fan.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {fan.active ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">{fan.page_id}</code> | Quota: {fan.quota} Reels
                    </div>
                  </div>

                  <button
                    disabled={!fan.active || processingId === fan.id}
                    onClick={() => handleQuickProcess(fan.id, fan.name)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-xs transition min-h-[44px] flex items-center justify-center space-x-1.5 touch-manipulation"
                  >
                    <span>⚡</span>
                    <span>{processingId === fan.id ? 'Đang Xử Lý...' : 'Đăng Reel Ngay'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
