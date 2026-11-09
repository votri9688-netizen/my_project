'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { fanpageApi } from '../../lib/api';

export default function FanpagesPage() {
  const [fanpages, setFanpages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingFanpage, setEditingFanpage] = useState(null); // null = create new, object = editing existing
  const [processingId, setProcessingId] = useState(null);
  
  // Form thêm / sửa
  const [formData, setFormData] = useState({
    name: '',
    page_id: '',
    quota: 24,
    access_token: '',
    active: true,
  });
  const [inspecting, setInspecting] = useState(false);
  const [inspectResult, setInspectResult] = useState(null);

  // Form Đồng bộ 1-Click
  const [syncToken, setSyncToken] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

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

  const openCreateModal = () => {
    setEditingFanpage(null);
    setFormData({ name: '', page_id: '', quota: 24, access_token: '', active: true });
    setInspectResult(null);
    setShowModal(true);
  };

  const openEditModal = (fan) => {
    setEditingFanpage(fan);
    setFormData({
      name: fan.name,
      page_id: fan.page_id,
      quota: fan.quota || 24,
      access_token: '', // Để trống để nhập token mới nếu muốn đổi
      active: fan.active,
    });
    setInspectResult(null);
    setShowModal(true);
  };

  // Tự động nhận diện Tên & Page ID từ Access Token
  const handleInspectToken = async () => {
    if (!formData.access_token.trim()) {
      alert('Vui lòng dán mã Access Token vào ô trước khi kiểm tra!');
      return;
    }
    try {
      setInspecting(true);
      setInspectResult(null);
      const res = await fanpageApi.inspectToken(formData.access_token.trim());
      const data = res.data;
      setInspectResult(data);

      if (!data.is_user) {
        // Đây là Page Access Token chuẩn: Tự động điền ID và Tên!
        setFormData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          page_id: data.id || prev.page_id,
        }));
      }
    } catch (err) {
      alert(`Lỗi kiểm tra: ${err.response?.data?.detail || err.message}`);
    } finally {
      setInspecting(false);
    }
  };

  // Xử lý Đồng bộ 1-Click toàn bộ Fanpage từ Meta
  const handleSyncMeta = async (e) => {
    e.preventDefault();
    if (!syncToken.trim()) {
      alert('Vui lòng dán User Access Token từ Meta Graph API Explorer!');
      return;
    }
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await fanpageApi.syncMeta(syncToken.trim());
      setSyncResult(res.data);
      alert(`🎉 Đã đồng bộ thành công ${res.data.total_synced} Fanpage (${res.data.created} kênh mới, ${res.data.updated} kênh cập nhật)!`);
      loadFanpages();
    } catch (err) {
      alert(`Lỗi đồng bộ: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFanpage) {
        // Cập nhật Fanpage hiện có
        const updatePayload = {
          name: formData.name,
          quota: formData.quota,
          active: formData.active,
        };
        if (formData.access_token.trim()) {
          updatePayload.access_token = formData.access_token.trim();
        }
        await fanpageApi.update(editingFanpage.id, updatePayload);
        alert(`✅ Đã cập nhật thành công kênh "${formData.name}"!`);
      } else {
        // Thêm mới
        if (!formData.name || !formData.page_id || !formData.access_token) {
          alert('Vui lòng điền đủ Tên kênh, Meta Page ID và Access Token!');
          return;
        }
        await fanpageApi.create(formData);
        alert(`✅ Đã thêm kênh mới "${formData.name}"!`);
      }
      setShowModal(false);
      loadFanpages();
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.detail || err.message}`);
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
      alert(`🚀 Đã kích hoạt render & xuất bản Reel cho kênh "${name}"!`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <Header
        title="Quản Lý Fanpage"
        subtitle="Hệ thống Fanpage Facebook Reels, Hạn mức Quota 24 bài/ngày & Quản lý Token bảo mật AES-256"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Thanh công cụ phía trên */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Danh Sách Fanpage Tự Động Hóa ({fanpages.length} kênh)</h3>
            <p className="text-xs text-slate-500">
              Bạn có thể <strong>Đồng bộ 1-Click từ Meta</strong> hoặc bấm <strong>+ Thêm Fanpage</strong> bất cứ lúc nào mà không cần cấu hình phức tạp.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSyncResult(null);
                setSyncToken('');
                setShowSyncModal(true);
              }}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-sm transition active:scale-95 min-h-[44px]"
            >
              <span>🔄 Đồng Bộ 1-Click Meta</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-sm transition active:scale-95 min-h-[44px]"
            >
              <span>+ Thêm Fanpage</span>
            </button>
          </div>
        </div>

        {/* --- MOBILE VIEW: CARDS (hiển thị trên màn hình nhỏ < md) --- */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-sm">
              Đang tải danh sách kênh...
            </div>
          ) : (
            fanpages.map((fan) => (
              <div
                key={fan.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{fan.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {fan.page_id}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      fan.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {fan.active ? '● Hoạt động' : 'Tắt'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                  <span className="text-slate-500">Hạn mức xuất bản:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {fan.quota} bài / ngày
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => openEditModal(fan)}
                    className="min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center"
                  >
                    ✏️ Sửa Token
                  </button>

                  <button
                    onClick={() => toggleActive(fan.id, fan.active)}
                    className={`min-h-[44px] text-xs font-semibold rounded-xl transition flex items-center justify-center ${
                      fan.active ? 'bg-amber-100 text-amber-800' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {fan.active ? 'Tắt' : 'Bật'}
                  </button>

                  <button
                    disabled={!fan.active || processingId === fan.id}
                    onClick={() => triggerRun(fan.id, fan.name)}
                    className="min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center"
                  >
                    {processingId === fan.id ? 'Đang chạy...' : '⚡ Đăng Ngay'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP VIEW: TABLE (hiển thị trên desktop >= md) --- */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs">
                <th className="py-4 px-6">Tên Kênh</th>
                <th className="py-4 px-6">Meta Page ID</th>
                <th className="py-4 px-6">Quota / Ngày</th>
                <th className="py-4 px-6">Trạng Thái</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fanpages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : (
                fanpages.map((fan) => (
                  <tr key={fan.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{fan.name}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{fan.page_id}</td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-800">{fan.quota}</span>
                      <span className="text-xs text-slate-400 ml-1">Reels</span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleActive(fan.id, fan.active)}
                        className={`px-3 py-1 text-xs rounded-full font-semibold transition ${
                          fan.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {fan.active ? '● Hoạt động' : 'Tạm dừng'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(fan)}
                        className="inline-flex items-center space-x-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-1.5 rounded-lg transition border border-slate-200"
                        title="Sửa Token & Quota"
                      >
                        <span>✏️ Sửa Token</span>
                      </button>

                      <button
                        disabled={!fan.active || processingId === fan.id}
                        onClick={() => triggerRun(fan.id, fan.name)}
                        className="inline-flex items-center space-x-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg transition border border-blue-200 disabled:opacity-50"
                      >
                        <span>{processingId === fan.id ? 'Đang chạy...' : '⚡ Đăng Ngay'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MODAL 1: ĐỒNG BỘ 1-CLICK TỪ META ================= */}
        {showSyncModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>🔄 Đồng Bộ Tự Động Toàn Bộ Fanpage Từ Meta</span>
                </h3>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                <p className="font-bold">✨ Cơ chế tự động 100%:</p>
                <p>
                  Chỉ cần dán <strong>User Access Token</strong> của bạn từ Graph API Explorer. Hệ thống sẽ tự động quét danh sách các Fanpage bạn sở hữu, tự lấy đúng <strong>Meta Page ID thật</strong> và cấp <strong>Page Access Token vĩnh viễn</strong> cho từng trang mà không cần bạn phải thao tác từng kênh!
                </p>
              </div>

              <form onSubmit={handleSyncMeta} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    User Access Token từ Meta Graph API Explorer
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={syncToken}
                    onChange={(e) => setSyncToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-xs"
                    placeholder="Dán User Token bắt đầu bằng EAAwaCh... vào đây"
                  />
                </div>

                {syncResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                    <p className="font-bold">✓ Kết quả đồng bộ thành công:</p>
                    <p>Đã đồng bộ {syncResult.total_synced} trang ({syncResult.created} kênh mới, {syncResult.updated} kênh cập nhật).</p>
                    <div className="mt-2 max-h-32 overflow-y-auto divide-y divide-emerald-100">
                      {syncResult.pages?.map((p, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span className="font-semibold">{p.name}</span>
                          <span className="font-mono text-slate-500">{p.page_id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 min-h-[44px] font-semibold"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={syncing}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xs min-h-[44px] disabled:opacity-50"
                  >
                    {syncing ? 'Đang quét Meta...' : '🚀 Bắt Đầu Quét & Đồng Bộ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: THÊM MỚI / SỬA LẺ TỪNG FANPAGE ================= */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingFanpage ? `✏️ Cập Nhật Token: ${editingFanpage.name}` : 'Thêm Fanpage Mới'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
                {/* Dán Token trước để Auto-Detect */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      🔑 Access Token {editingFanpage ? 'Mới' : ''}
                    </label>
                    <button
                      type="button"
                      disabled={inspecting || !formData.access_token}
                      onClick={handleInspectToken}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline disabled:opacity-40"
                    >
                      {inspecting ? 'Đang kiểm tra...' : '🔍 Tự Động Lấy ID & Tên Trang'}
                    </button>
                  </div>
                  <textarea
                    rows="3"
                    value={formData.access_token}
                    onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                    placeholder="Dán Token bắt đầu bằng EAAwaC... rồi bấm 'Tự Động Lấy ID & Tên Trang'"
                  />
                  {editingFanpage && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Để trống nếu không muốn đổi token hiện tại.
                    </p>
                  )}
                </div>

                {inspectResult && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center space-x-1">
                      <span>✓ Đã nhận diện từ Meta:</span>
                      <span className="bg-blue-200 px-1.5 py-0.5 rounded text-[11px]">{inspectResult.type}</span>
                    </div>
                    <p>Tên: <strong>{inspectResult.name}</strong></p>
                    <p>Meta ID: <code className="font-mono bg-blue-100 px-1 rounded">{inspectResult.id}</code></p>
                    {inspectResult.is_user && (
                      <p className="text-amber-700 font-medium mt-1">
                        💡 Đây là User Token. Hãy dùng tính năng <strong>Đồng Bộ 1-Click Meta</strong> ở màn hình chính để hệ thống tự cấp Page Token vĩnh viễn cho tất cả {inspectResult.managed_pages?.length} trang bạn quản lý!
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên Fanpage</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                    placeholder="Tự động điền hoặc nhập tay"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meta Facebook Page ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingFanpage}
                    value={formData.page_id}
                    onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 font-mono focus:outline-none min-h-[44px]"
                    placeholder="Tự động điền dãy ID thật từ Meta"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hạn Mức Đăng / Ngày (Quota)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 24 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 min-h-[44px] font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs min-h-[44px]"
                  >
                    {editingFanpage ? '💾 Lưu Cập Nhật' : 'Tạo Kênh'}
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
