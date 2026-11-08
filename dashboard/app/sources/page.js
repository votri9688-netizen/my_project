'use client';
import { useState } from 'react';
import Header from '../../components/Header';

export default function SourcesPage() {
  const [sources, setSources] = useState([
    {
      id: 1,
      name: 'Nguồn Video Hài Hước TikTok',
      url: 'https://tiktok.com/@comedy_hub_daily',
      usedQuota: 55,
      maxQuota: 60,
      status: 'active',
      backupUrl: 'https://douyin.com/user/comedy_backup_01',
      lastScraped: '10 phút trước',
    },
    {
      id: 2,
      name: 'Nguồn Tin Nóng & Drama',
      url: 'https://tiktok.com/@tinnong24h',
      usedQuota: 42,
      maxQuota: 60,
      status: 'active',
      backupUrl: 'https://tiktok.com/@tinnong_backup',
      lastScraped: '25 phút trước',
    },
    {
      id: 3,
      name: 'Nguồn Kiến Thức & Khám Phá',
      url: 'https://tiktok.com/@vutru_quanh_ta',
      usedQuota: 60,
      maxQuota: 60,
      status: 'backup_active',
      backupUrl: 'https://youtube.com/@discovery_shorts',
      lastScraped: 'Vừa xong',
    },
    {
      id: 4,
      name: 'Nguồn Review Phim Hot',
      url: 'https://tiktok.com/@review_phim_hay',
      usedQuota: 18,
      maxQuota: 60,
      status: 'active',
      backupUrl: 'https://tiktok.com/@review_phim_du_tru',
      lastScraped: '1 giờ trước',
    },
  ]);

  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newBackupUrl, setNewBackupUrl] = useState('');

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!newUrl || !newName) return;
    const item = {
      id: Date.now(),
      name: newName,
      url: newUrl,
      usedQuota: 0,
      maxQuota: 60,
      status: 'active',
      backupUrl: newBackupUrl || 'Tự động kích hoạt khi đầy',
      lastScraped: 'Chưa chạy',
    };
    setSources([...sources, item]);
    setNewUrl('');
    setNewName('');
    setNewBackupUrl('');
    alert('Đã thêm nguồn cào mới thành công!');
  };

  return (
    <div>
      <Header
        title="Quản Lý Nguồn & Quota (55/60)"
        subtitle="Kiểm soát link đối thủ cung cấp, hạn mức cào tự động và kích hoạt nguồn dự trù"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Banner Quota Rules */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🛡️</span>
            <h3 className="font-bold text-base">Cơ Chế Bảo Vệ Quota (Zero-Spam & Auto-Failover)</h3>
          </div>
          <p className="text-xs text-blue-200 leading-relaxed max-w-3xl">
            Hệ thống chỉ cào đúng URL đối thủ do bạn cấu hình bên dưới. Khi hạn mức chạm ngưỡng <strong>55/60</strong>, hệ thống phát cảnh báo. Khi chạm <strong>60/60</strong>, bộ điều phối lập tức kích hoạt <strong>Nguồn dự trù</strong> để không làm gián đoạn luồng đăng bài!
          </p>
        </div>

        {/* Form Thêm Nguồn Mới */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-800">Thêm Nguồn Video Chỉ Định</h4>
          <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Tên Nguồn</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="vd: Kênh Hài Douyin #1"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">URL Đối Thủ Chính</label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://tiktok.com/@..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">URL Nguồn Dự Trù (Backup)</label>
              <input
                type="text"
                value={newBackupUrl}
                onChange={(e) => setNewBackupUrl(e.target.value)}
                placeholder="Tự kích hoạt khi chạm 60/60"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[42px]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition min-h-[42px]"
              >
                + Lưu Nguồn Mới
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách Nguồn & Tiến trình Quota */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => {
            const percentage = Math.round((src.usedQuota / src.maxQuota) * 100);
            const isNearLimit = src.usedQuota >= 55;
            const isMax = src.usedQuota >= 60;

            return (
              <div key={src.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{src.name}</h4>
                    <a href={src.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-xs block mt-0.5">
                      {src.url} ↗
                    </a>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    isMax
                      ? 'bg-purple-100 text-purple-800'
                      : isNearLimit
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isMax ? '⚡ Nguồn Dự Trù Bật' : isNearLimit ? '⚠️ Cảnh báo 55/60' : '● Ổn định'}
                  </span>
                </div>

                {/* Progress Bar 55/60 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Tiến độ Quota ngày:</span>
                    <span className={isNearLimit ? 'text-amber-600' : 'text-slate-800'}>
                      {src.usedQuota} / {src.maxQuota} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isMax ? 'bg-purple-600' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span className="truncate max-w-[200px]">Dự trù: {src.backupUrl}</span>
                  <span className="shrink-0 text-slate-400">Cào: {src.lastScraped}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
