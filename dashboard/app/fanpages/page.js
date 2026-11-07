'use client';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { fanpageApi } from '../../lib/api';

export default function FanpagesPage() {
  const [fanpages, setFanpages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    page_id: '',
    quota: 10,
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
      setFormData({ name: '', page_id: '', quota: 10, access_token: '', active: true });
      loadFanpages();
    } catch (err) {
      alert(`Error creating fanpage: ${err.response?.data?.detail || err.message}`);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await fanpageApi.update(id, { active: !currentStatus });
      loadFanpages();
    } catch (err) {
      alert(`Error updating fanpage: ${err.message}`);
    }
  };

  return (
    <div>
      <Header
        title="Fanpage Channels"
        subtitle="Manage Meta Facebook Pages, Quotas & Token Credentials"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Registered Pages: <strong className="text-slate-800">{fanpages.length}</strong>
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center space-x-2 transition"
          >
            <span>+ Add Fanpage</span>
          </button>
        </div>

        {/* Fanpages Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">Channel Name</th>
                <th className="py-3.5 px-6 font-semibold">Meta Page ID</th>
                <th className="py-3.5 px-6 font-semibold">Daily Quota</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fanpages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No fanpages configured yet.
                  </td>
                </tr>
              ) : (
                fanpages.map((fan) => (
                  <tr key={fan.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-medium text-slate-900">{fan.name}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">{fan.page_id}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700">{fan.quota}</span>
                      <span className="text-xs text-slate-400 ml-1">posts/day</span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleActive(fan.id, fan.active)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                          fan.active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {fan.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => fanpageApi.process(fan.id, 'Viral Tech')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded bg-blue-50"
                      >
                        ⚡ Trigger Run
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Add Fanpage */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Fanpage</h3>
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fanpage Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Comedy Reels Daily"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Facebook Page ID</label>
                  <input
                    type="text"
                    required
                    value={formData.page_id}
                    onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 109823471923"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Daily Post Quota</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Page Access Token (Optional)</label>
                  <input
                    type="password"
                    value={formData.access_token}
                    onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Encrypted via AES-256 in DB"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Save Channel
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
