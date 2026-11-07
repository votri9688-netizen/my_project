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
      const res = await fanpageApi.process(id, 'Trending Viral Entertainment');
      setMessage(`Processing queued for ${name}! Reel #${res.data.reel_id}`);
      loadData();
    } catch (err) {
      setMessage(`Failed to trigger: ${err.response?.data?.detail || err.message}`);
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
        title="System Overview"
        subtitle="Automated Facebook Reels, AI Content & Celery Workers"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {message && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Total Fanpages</span>
            <div className="text-3xl font-bold text-slate-800 mt-2">{fanpages.length}</div>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
              {activeCount} active pages
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Reels Published</span>
            <div className="text-3xl font-bold text-slate-800 mt-2">{publishedReels}</div>
            <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">
              {reels.length} total generated
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Daily Quota Capacity</span>
            <div className="text-3xl font-bold text-slate-800 mt-2">{totalQuota}</div>
            <span className="text-xs text-slate-500 mt-1 inline-block">Posts/day limit</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Celery Engine</span>
            <div className="text-3xl font-bold text-emerald-600 mt-2">Active</div>
            <span className="text-xs text-slate-500 mt-1 inline-block">FFmpeg + Redis ready</span>
          </div>
        </div>

        {/* Active Fanpages Quick Execution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Quick Reel Dispatch</h3>
            <span className="text-xs text-slate-500">Trigger FFmpeg + AI Caption + Meta Graph API</span>
          </div>

          <div className="divide-y divide-slate-100">
            {fanpages.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No fanpages added yet. Head over to the Fanpages tab to create one.
              </div>
            ) : (
              fanpages.map((fan) => (
                <div key={fan.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center space-x-2">
                      <span>{fan.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${fan.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {fan.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Page ID: <code className="bg-slate-100 px-1 py-0.5 rounded">{fan.page_id}</code> | Daily Quota: {fan.quota}
                    </div>
                  </div>

                  <button
                    disabled={!fan.active || processingId === fan.id}
                    onClick={() => handleQuickProcess(fan.id, fan.name)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    {processingId === fan.id ? 'Starting...' : '⚡ Process & Publish'}
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
