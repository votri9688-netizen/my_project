'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { reportApi } from '../../lib/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportApi.insights();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || { total_views: 0, total_reach: 0, total_engagement: 0, active_pages: 0, total_pages: 9 };
  const pageInsights = data?.page_insights || [];
  const topReels = data?.top_reels || [];

  const hasExpiredTokens = pageInsights.some((p) => p.status === 'error' && p.error_detail?.includes('expired'));

  return (
    <div>
      <Header
        title="Báo Cáo & Meta Insights (Dữ Liệu Thật)"
        subtitle="Kết nối trực tiếp Meta Graph API v19.0 - Đo lường chỉ số thực tế 9 Fanpage"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Real-time Alert Banner if Tokens are expired */}
        {hasExpiredTokens && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start space-x-3 text-amber-900 shadow-xs">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 text-xs md:text-sm">
              <h4 className="font-bold text-amber-950">Phát hiện Access Token Facebook hết hạn!</h4>
              <p className="mt-1 text-amber-800">
                Meta Graph API báo lỗi: <i>Session has expired on 05-Nov-2026</i>. Dưới đây là các chỉ số thực tế được kéo trực tiếp từ Meta. Để kích hoạt đo lường lượt xem thời gian thực, vui lòng dán Token mới tại tab{' '}
                <a href="/fanpages" className="font-bold underline text-blue-700 hover:text-blue-900">
                  Quản Lý Fanpage
                </a>.
              </p>
            </div>
            <button
              onClick={fetchInsights}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              🔄 Thử lại
            </button>
          </div>
        )}

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Chỉ Số Hiệu Suất Thực Tế (Meta API v19.0)</h3>
            <p className="text-xs text-slate-500">
              Không dùng số ảo — Dữ liệu lấy trực tiếp từ ID và Token của 9 Fanpage
            </p>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <span>{loading ? 'Đang đồng bộ...' : 'Đồng bộ từ Meta ngay'}</span>
            <span>🔄</span>
          </button>
        </div>

        {/* Real KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tổng Tiếp Cận (Reach)</span>
            <div className="text-2xl md:text-3xl font-extrabold text-blue-600 mt-1">
              {summary.total_reach.toLocaleString('vi-VN')}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Chỉ số thực tế Meta</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tổng Tương Tác (Engaged)</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">
              {summary.total_engagement.toLocaleString('vi-VN')}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Lượt tương tác thực</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Kênh Hoạt Động</span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">
              {summary.active_pages} / {summary.total_pages}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Kênh có token hợp lệ</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Reels Đồng Bộ</span>
            <div className="text-2xl md:text-3xl font-extrabold text-purple-600 mt-1">
              {topReels.length}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Video trên hệ thống</span>
          </div>
        </div>

        {/* Real Fanpages Health & Metrics Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Chi Tiết Tình Trạng & Chỉ Số Từng Fanpage</h3>
            <span className="text-xs text-slate-400">{pageInsights.length} Trang</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-3.5">Fanpage</th>
                  <th className="p-3.5">Page ID</th>
                  <th className="p-3.5">Followers</th>
                  <th className="p-3.5">Tiếp Cận (Reach)</th>
                  <th className="p-3.5">Tình Trạng Token Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageInsights.map((p) => (
                  <tr key={p.page_id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3.5 font-mono text-slate-500 text-xs">{p.page_id}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{p.followers.toLocaleString('vi-VN')}</td>
                    <td className="p-3.5 font-semibold text-blue-600">{p.reach.toLocaleString('vi-VN')}</td>
                    <td className="p-3.5">
                      {p.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          ● Token Hợp Lệ
                        </span>
                      ) : p.status === 'error' ? (
                        <span
                          title={p.error_detail}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 cursor-help"
                        >
                          ⚠️ {p.error_detail?.slice(0, 42)}...
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Chưa kiểm tra
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Reels Performance Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-800">Danh Sách Reels Đã Xuất Bản Thực Tế</h3>
          </div>
          {topReels.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs md:text-sm">
              Chưa có video Reels nào hoàn tất xuất bản lên Facebook. Hãy gắn link cào video và bấm "Đăng ngay" tại trang Quản Lý Fanpage!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-3.5">Kênh</th>
                    <th className="p-3.5">Tiêu đề / Caption</th>
                    <th className="p-3.5">Video ID</th>
                    <th className="p-3.5">Ngày đăng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topReels.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-bold text-slate-800">{r.page}</td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{r.title}</td>
                      <td className="p-3.5 font-mono text-xs text-blue-600">
                        {r.id ? (
                          <a href={`https://facebook.com/reel/${r.id}`} target="_blank" rel="noreferrer" className="underline">
                            {r.id}
                          </a>
                        ) : (
                          'Chưa có'
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
