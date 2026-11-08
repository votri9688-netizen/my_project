'use client';
import { useState } from 'react';
import Header from '../../components/Header';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const topReels = [
    { id: 'reel_01', page: 'Review Chập Chen', title: 'Top 3 Mẹo Hay Nhất Quả Đất', views: '1,420,500', reach: '2,100,000', likes: '89,400', date: '05/11/2026' },
    { id: 'reel_02', page: 'Hồ Sơ Vụ Án', title: 'Vụ Án Kỳ Lạ Nhất Thế Kỷ 20', views: '980,200', reach: '1,500,000', likes: '54,200', date: '04/11/2026' },
    { id: 'reel_03', page: 'Heo kể chuyển', title: 'Chuyện Lạ Có Thật Ở Làng Quê', views: '750,000', reach: '1,120,000', likes: '41,000', date: '06/11/2026' },
    { id: 'reel_04', page: 'Xu Hướng Mỗi Ngày', title: 'Bí Mật Xu Hướng Giới Trẻ 2026', views: '620,100', reach: '890,000', likes: '32,500', date: '06/11/2026' },
    { id: 'reel_05', page: 'Vũ trụ Quanh Ta', title: 'Điều Gì Xảy Ra Nếu Mặt Trời Tắt?', views: '540,800', reach: '780,000', likes: '28,900', date: '03/11/2026' },
  ];

  return (
    <div>
      <Header
        title="Báo Cáo & Meta Insights"
        subtitle="Theo dõi Lượt xem (Views), Tiếp cận (Reach), Tương tác & Top 5 Reels Viral nhất"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Hiệu Suất Tổng Hợp 9 Fanpage</h3>
            <p className="text-xs text-slate-500">Dữ liệu kéo trực tiếp từ Meta Graph Insights API</p>
          </div>
          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['24h', '7d', '30d', 'all'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeRange === t ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === '24h' ? 'Hôm nay' : t === '7d' ? '7 ngày' : t === '30d' ? '30 ngày' : 'Tất cả'}
              </button>
            ))}
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tổng Lượt Xem (Views)</span>
            <div className="text-2xl md:text-3xl font-extrabold text-blue-600 mt-1">4.31M</div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">↑ +18.4% tuần này</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tổng Tiếp Cận (Reach)</span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">6.39M</div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">↑ +24.1% tuần này</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Lượt Thả Tim & Share</span>
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 mt-1">246.0K</div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">↑ +12.8% tương tác</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tỷ Lệ Giữ Chân TB</span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">74.2%</div>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">Chuẩn video 9:16</span>
          </div>
        </div>

        {/* Top 5 Reels Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Bảng Xếp Hạng Top 5 Reels Triệu View</h4>
              <p className="text-[11px] text-slate-500">Các video đạt hiệu suất phân phối tự nhiên cao nhất</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              🏆 Viral Highlights
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {topReels.map((reel, idx) => (
              <div key={reel.id} className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="flex items-center space-x-3.5">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    idx === 1 ? 'bg-slate-200 text-slate-800' :
                    idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">{reel.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Kênh: <strong>{reel.page}</strong> • Ngày đăng: {reel.date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs sm:text-right">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lượt Xem</span>
                    <strong className="text-blue-600 font-extrabold text-sm">{reel.views}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tiếp Cận</span>
                    <strong className="text-slate-800 font-bold">{reel.reach}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Thả Tim</span>
                    <strong className="text-rose-600 font-bold">{reel.likes}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
