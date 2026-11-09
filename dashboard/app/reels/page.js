'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { reelApi } from '../../lib/api';

const formatVietnamTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const isoStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      const res = await reelApi.list();
      setReels(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2.5 py-1 text-[11px] rounded-full bg-emerald-100 text-emerald-800 font-bold">● Đã Xuất Bản</span>;
      case 'failed':
        return <span className="px-2.5 py-1 text-[11px] rounded-full bg-rose-100 text-rose-800 font-bold">✕ Thất Bại</span>;
      case 'rendering':
      case 'uploading':
      case 'generating_content':
        return <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-100 text-amber-800 font-bold animate-pulse">⏳ {status}...</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 text-slate-700 font-bold">Chờ xử lý</span>;
    }
  };

  return (
    <div>
      <Header
        title="Lịch Sử Đăng Reels"
        subtitle="Theo dõi video AI tạo, caption viral và kết quả xuất bản lên Facebook (Giờ Hồ Chí Minh GMT+7)"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs md:text-sm text-slate-600">
            Tổng số bài: <strong className="text-slate-900">{reels.length}</strong> bài đăng (Giờ Việt Nam UTC+7)
          </p>
          <button
            onClick={loadReels}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 transition min-h-[40px]"
          >
            ↻ Làm mới
          </button>
        </div>

        {/* --- MOBILE CARDS (hiển thị trên mobile < md) --- */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {reels.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-400 rounded-xl border border-slate-200 text-sm">
              Chưa có video nào được đăng.
            </div>
          ) : (
            reels.map((reel) => (
              <div key={reel.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-slate-400">#{reel.id}</span>
                  {getStatusBadge(reel.status)}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{reel.title || 'Reel không có tiêu đề'}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{reel.caption || 'Chưa có caption'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">{formatVietnamTime(reel.created_at)}</span>
                  <button
                    onClick={() => setSelectedVideo(reel)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 min-h-[36px] flex items-center"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP TABLE (hiển thị trên desktop >= md) --- */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">ID</th>
                <th className="py-3.5 px-6 font-semibold">Tiêu Đề & Nội Dung</th>
                <th className="py-3.5 px-6 font-semibold">Meta Video ID</th>
                <th className="py-3.5 px-6 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-6 font-semibold">Thời Gian (GMT+7)</th>
                <th className="py-3.5 px-6 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reels.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Chưa có bài đăng nào.
                  </td>
                </tr>
              ) : (
                reels.map((reel) => (
                  <tr key={reel.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">#{reel.id}</td>
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-slate-800 truncate">{reel.title || 'Reel Video'}</div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{reel.caption || 'Chưa có caption'}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {reel.fb_video_id || '-'}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(reel.status)}</td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {formatVietnamTime(reel.created_at)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedVideo(reel)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 text-xs transition"
                      >
                        Chi tiết
                      </button>
                      {reel.fb_video_id && (
                        <a
                          href={`https://facebook.com/reel/${reel.fb_video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 text-xs transition"
                        >
                          Xem Facebook ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Xem Chi Tiết Video */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Chi Tiết Reel #{selectedVideo.id}</h3>
                <button onClick={() => setSelectedVideo(null)} className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs md:text-sm">
                <div>
                  <h4 className="font-bold text-slate-700">Tiêu đề:</h4>
                  <p className="text-slate-900 mt-0.5">{selectedVideo.title || 'Chưa có'}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Thời gian tạo (Giờ Việt Nam):</h4>
                  <p className="text-blue-600 font-semibold mt-0.5">{formatVietnamTime(selectedVideo.created_at)}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Nội dung Caption & Hashtags:</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto mt-1">
                    {selectedVideo.caption || 'Chưa có'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Đường dẫn file video:</h4>
                  <p className="font-mono text-xs text-slate-500">{selectedVideo.video_path || 'Chưa tạo'}</p>
                </div>

                {selectedVideo.error_message && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-xs">
                    <strong className="block mb-1 font-bold">❌ Nguyên nhân chi tiết từ Meta Facebook:</strong>
                    <div className="font-mono whitespace-pre-wrap">{selectedVideo.error_message}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
