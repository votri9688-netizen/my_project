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
        return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 font-semibold">Published</span>;
      case 'failed':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-rose-100 text-rose-800 font-semibold">Failed</span>;
      case 'rendering':
      case 'uploading':
        return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-100 text-amber-800 font-semibold animate-pulse">{status}...</span>;
      default:
        return <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">Pending</span>;
    }
  };

  return (
    <div>
      <Header
        title="Reels Publishing Log"
        subtitle="Track AI-generated videos, captions, and Meta Graph API publish results"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Total History: <strong className="text-slate-800">{reels.length}</strong> items
          </p>
          <button
            onClick={loadReels}
            className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
          >
            ↻ Refresh Log
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">Reel ID</th>
                <th className="py-3.5 px-6 font-semibold">Title & Caption</th>
                <th className="py-3.5 px-6 font-semibold">Meta Video ID</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Created At</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reels.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No reels published yet.
                  </td>
                </tr>
              ) : (
                reels.map((reel) => (
                  <tr key={reel.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">#{reel.id}</td>
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-slate-800 truncate">{reel.title || 'Untitled Reel'}</div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{reel.caption || 'No caption'}</p>
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
                          View Reel ↗
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedVideo(reel)}
                          className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Video / Reel Details Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Reel Details #{selectedVideo.id}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-slate-700">Title:</strong>
                  <p className="text-slate-600 mt-0.5">{selectedVideo.title}</p>
                </div>
                <div>
                  <strong className="text-slate-700">Full Caption & Hashtags:</strong>
                  <pre className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 whitespace-pre-wrap mt-1">
                    {selectedVideo.caption}
                  </pre>
                </div>
                <div>
                  <strong className="text-slate-700">Video Storage Path:</strong>
                  <p className="font-mono text-xs text-slate-600 mt-0.5">{selectedVideo.video_path}</p>
                </div>
                {selectedVideo.error_message && (
                  <div className="p-3 rounded bg-rose-50 text-rose-700 text-xs">
                    <strong>Error:</strong> {selectedVideo.error_message}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
