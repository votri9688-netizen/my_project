'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { fanpageApi } from '../../lib/api';

export default function SourcesPage() {
  const [fanpages, setFanpages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadFanpages();
  }, []);

  const loadFanpages = async () => {
    try {
      setLoading(true);
      const res = await fanpageApi.list();
      setFanpages(res.data || []);
    } catch (err) {
      console.error('Error loading fanpages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id, field, value) => {
    setFanpages((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleSaveSource = async (fan) => {
    try {
      setSavedStatus((prev) => ({ ...prev, [fan.id]: 'saving' }));
      await fanpageApi.update(fan.id, {
        source_url: fan.source_url,
        backup_url: fan.backup_url,
      });
      setSavedStatus((prev) => ({ ...prev, [fan.id]: 'saved' }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [fan.id]: null }));
      }, 3000);
    } catch (err) {
      alert(`Lỗi lưu nguồn cào: ${err.message}`);
      setSavedStatus((prev) => ({ ...prev, [fan.id]: 'error' }));
    }
  };

  const handleScrapeNow = async (fan) => {
    if (!fan.source_url) {
      alert(`Vui lòng nhập Link Nguồn Cào cho kênh "${fan.name}" trước khi chạy!`);
      return;
    }
    try {
      setProcessingId(fan.id);
      await fanpageApi.process(fan.id, `Reel từ ${fan.name}`);
      alert(`🚀 Đã kích hoạt pipeline cào video từ: ${fan.source_url} và đẩy lên Reel của ${fan.name}!`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <Header
        title="Quản Lý Nguồn Cào Video & Hạn Mức Quota"
        subtitle="Cấu hình Link Nguồn Cào Video (TikTok / Douyin / YouTube) và cơ chế tự động đảo link Backup cho 9 Fanpage"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Banner hướng dẫn */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start space-x-3 text-blue-900 shadow-xs">
          <span className="text-2xl">💡</span>
          <div className="text-xs md:text-sm">
            <h4 className="font-bold text-blue-950">Thiết lập Link Nguồn Cào cho từng Fanpage</h4>
            <p className="mt-1 text-blue-800">
              Mỗi Fanpage cần một <b>Link Nguồn Cào Chính</b> (kênh TikTok, trang Douyin, kênh YouTube Shorts hoặc đối thủ bạn muốn nhân bản nội dung). Hạn mức hệ thống đã được cài đặt cố định <b>24 bài/ngày</b> (trung bình 1 bài/giờ).
            </p>
          </div>
        </div>

        {/* Danh sách 9 Fanpage kèm cấu hình nguồn cào */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-sm">
              Đang tải danh sách 9 Fanpage...
            </div>
          ) : (
            fanpages.map((fan) => {
              const usedQuota = fan.quota_logs?.[0]?.used_quota || 0;
              const maxQuota = fan.quota || 24;
              const quotaPercent = Math.min(100, Math.round((usedQuota / maxQuota) * 100));

              return (
                <div
                  key={fan.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition hover:border-slate-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-slate-900">{fan.name}</span>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          ID: {fan.page_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Trạng thái: {fan.active ? <span className="text-emerald-600 font-semibold">● Đang hoạt động</span> : <span className="text-slate-400">Tạm dừng</span>}
                      </p>
                    </div>

                    {/* Quota Progress */}
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-slate-500">Hạn mức hôm nay:</span>
                      <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            quotaPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">
                        {usedQuota} / {maxQuota} Reels
                      </span>
                    </div>
                  </div>

                  {/* Input Source & Backup Link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        🌐 Link Nguồn Cào Chính (TikTok / Douyin / Shorts / FB):
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.tiktok.com/@kenh_mau_can_cao"
                        value={fan.source_url || ''}
                        onChange={(e) => handleInputChange(fan.id, 'source_url', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        🛡️ Link Nguồn Phụ Dự Phòng (Tự đảo khi nguồn chính lỗi):
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.douyin.com/user/kenh_du_phong"
                        value={fan.backup_url || ''}
                        onChange={(e) => handleInputChange(fan.id, 'backup_url', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleSaveSource(fan)}
                      disabled={savedStatus[fan.id] === 'saving'}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                        savedStatus[fan.id] === 'saved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {savedStatus[fan.id] === 'saving'
                        ? 'Đang lưu...'
                        : savedStatus[fan.id] === 'saved'
                        ? '✓ Đã lưu nguồn cào!'
                        : '💾 Lưu Cấu Hình Nguồn Cào'}
                    </button>

                    <button
                      onClick={() => handleScrapeNow(fan)}
                      disabled={processingId === fan.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs disabled:opacity-50"
                    >
                      {processingId === fan.id ? 'Đang kích hoạt...' : '🚀 Cào & Đăng Ngay'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
