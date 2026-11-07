'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { reelApi } from '../../lib/api';

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
        return <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-100 text-amber-800 font-bold animate-pulse">⏳ {status}...</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 text-slate-700 font-bold">Chờ xử lý</span>;
    }
  };

  return (
    <div>
      <Header
        title="Lịch Sử Đăng Reels"
        subtitle="Theo dõi video AI tạo, caption viral và kết quả xuất bản lên Facebook"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs md:text-sm text-slate-600">
            Tổng số bài: <strong className="text-slate-900">{reels.length}</strong> bài đăng
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
                  <span>{reel.created_at ? new Date(reel.created_at).toLocaleDateString() : '-'}</span>
                  {reel.fb_video_id ? (
                    <a
                      href={`https://facebook.com/reel/${reel.fb_video_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 min-h-[36px] flex items-center"
                    >
                      Xem Facebook ↗
                    </a>
                  ) : (
                    <button
                      onClick={() => setSelectedVideo(reel)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 min-h-[36px] flex items-center"
                    >
                      Chi tiết
                    </button>
                  )}
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
                <th className="py-3.5 px-6 font-semibold">Thời Gian</th>
                <th className="py-3.5 px-6 font-semibold text-right">Xem Bài</th>
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
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {reel.created_at ? new Date(reel.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {reel.fb_video_id ? (
                        <a
                          href={`https://facebook.com/reel/${reel.fb_video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Xem Reel ↗
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedVideo(reel)}
                          className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded"
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Chi tiết Reel */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900">Chi Tiết Reel #{selectedVideo.id}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-slate-700">Tiêu đề:</strong>
                  <p className="text-slate-800 mt-0.5 font-medium">{selectedVideo.title}</p>
                </div>
                <div>
                  <strong className="text-slate-700">Nội dung Caption & Hashtags:</strong>
                  <pre className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 whitespace-pre-wrap mt-1 border border-slate-100">
                    {selectedVideo.caption}
                  </pre>
                </div>
                <div>
                  <strong className="text-slate-700">Đường dẫn file video:</strong>
                  <p className="font-mono text-xs text-slate-600 mt-0.5">{selectedVideo.video_path}</p>
                </div>
                {selectedVideo.error_message && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-100">
                    <strong>Lỗi:</strong> {selectedVideo.error_message}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 min-h-[44px]"
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
