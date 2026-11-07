'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { fanpageApi } from '../../lib/api';

export default function FanpagesPage() {
  const [fanpages, setFanpages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    page_id: '',
    quota: 5,
    access_token: '',
    active: true,
  });

  useEffect(() => {
    loadFanpages();
  }, []);

  const loadFanpages = async () => {
    try {
      setLoading(true);
      const res = await fanpageApi.list();
      setFanpages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fanpageApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', page_id: '', quota: 5, access_token: '', active: true });
      loadFanpages();
    } catch (err) {
      alert(`Lỗi tạo kênh: ${err.response?.data?.detail || err.message}`);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await fanpageApi.update(id, { active: !currentStatus });
      loadFanpages();
    } catch (err) {
      alert(`Lỗi cập nhật: ${err.message}`);
    }
  };

  const triggerRun = async (id, name) => {
    try {
      setProcessingId(id);
      await fanpageApi.process(id, 'Trending Reels');
      alert(`Đã kích hoạt render & xuất bản Reel cho kênh ${name}!`);
      loadFanpages();
    } catch (err) {
      alert(`Lỗi kích hoạt: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <Header
        title="Quản Lý Fanpage"
        subtitle="Hệ thống 9 Fanpage Facebook Reels, Quota & Token bảo mật"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng số kênh cấu hình:</span>
            <div className="text-xl font-bold text-slate-800">{fanpages.length} Fanpages</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center space-x-2 transition min-h-[44px] touch-manipulation"
          >
            <span>+ Thêm Fanpage Mới</span>
          </button>
        </div>

        {/* --- MOBILE VIEW: RESPONSIVE CARDS (hiển thị trên mobile < md) --- */}
        <div className="grid grid-cols-1 gap-3.5 md:hidden">
          {fanpages.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-400 rounded-xl border border-slate-200">
              Chưa có kênh nào được cấu hình.
            </div>
          ) : (
            fanpages.map((fan) => (
              <div
                key={fan.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-snug">{fan.name}</h4>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">ID: {fan.page_id}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${fan.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {fan.active ? '● Hoạt động' : 'Tắt'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                  <span className="text-slate-500">Hạn mức xuất bản:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {fan.quota} bài / ngày
                  </span>
                </div>

                {/* Touch-Friendly Action Buttons on Mobile */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => toggleActive(fan.id, fan.active)}
                    className={`min-h-[44px] text-xs font-semibold rounded-xl transition flex items-center justify-center active:scale-95 ${
                      fan.active
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {fan.active ? 'Tắt kênh' : 'Bật kênh'}
                  </button>

                  <button
                    disabled={!fan.active || processingId === fan.id}
                    onClick={() => triggerRun(fan.id, fan.name)}
                    className="min-h-[44px] bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center"
                  >
                    {processingId === fan.id ? 'Đang chạy...' : '⚡ Đăng Reel Ngay'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP VIEW: TABLE (hiển thị trên desktop >= md) --- */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">Tên Kênh</th>
                <th className="py-3.5 px-6 font-semibold">Meta Page ID</th>
                <th className="py-3.5 px-6 font-semibold">Quota / Ngày</th>
                <th className="py-3.5 px-6 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-6 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fanpages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Chưa có kênh nào.
                  </td>
                </tr>
              ) : (
                fanpages.map((fan) => (
                  <tr key={fan.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">{fan.name}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">{fan.page_id}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">{fan.quota}</span>
                      <span className="text-xs text-slate-400 ml-1">Reels</span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleActive(fan.id, fan.active)}
                        className={`px-3 py-1.5 text-xs rounded-full font-semibold transition ${
                          fan.active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {fan.active ? '● Hoạt động' : 'Tắt'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        disabled={!fan.active || processingId === fan.id}
                        onClick={() => triggerRun(fan.id, fan.name)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                      >
                        {processingId === fan.id ? 'Đang chạy...' : '⚡ Đăng Ngay'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Thêm Mới Fanpage */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Thêm Fanpage Mới</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tên Kênh</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                    placeholder="ví dụ: Kể Chuyện Đêm Khuya"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Facebook Page ID</label>
                  <input
                    type="text"
                    required
                    value={formData.page_id}
                    onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                    placeholder="ví dụ: 61596200161040"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hạn Mức Đăng / Ngày (Quota)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Page Access Token</label>
                  <input
                    type="password"
                    value={formData.access_token}
                    onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                    placeholder="Tự động mã hóa AES-256"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 min-h-[44px]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm min-h-[44px]"
                  >
                    Lưu Kênh
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
