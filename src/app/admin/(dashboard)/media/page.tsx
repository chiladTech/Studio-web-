'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaUploader from '@/components/admin/MediaUploader';
import {
  Film,
  Images,
  CheckCircle,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { UploadResult } from '@/lib/blob-client';

export default function AdminMediaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const loadMediaAssets = async () => {
    try {
      const res = await fetch('/api/v1/media');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load media assets:', err);
    }
  };

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      await loadMediaAssets();
      setLoading(false);
    }
    init();
  }, [router]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async (asset: any) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${asset.originalName || asset.filename}"? This will remove it from the media library and database.`
      )
    ) {
      return;
    }

    setDeletingId(asset.id);
    setMessage('');

    try {
      const res = await fetch(`/api/v1/media/${asset.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message || 'Media asset deleted successfully.'}`);
        await loadMediaAssets();
      } else if (res.status === 409) {
        // Referenced elsewhere
        if (confirm(`${data.error}\n\nDo you want to FORCE delete this asset anyway?`)) {
          const forceRes = await fetch(`/api/v1/media/${asset.id}?force=true`, {
            method: 'DELETE',
          });
          if (forceRes.ok) {
            setMessage('✅ Media asset force deleted successfully.');
            await loadMediaAssets();
          } else {
            const forceData = await forceRes.json();
            setMessage(`❌ ${forceData.error || 'Failed to force delete asset.'}`);
          }
        }
      } else {
        setMessage(`❌ ${data.error || 'Failed to delete media asset.'}`);
      }
    } catch (err) {
      setMessage('❌ Network error during media asset deletion.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadComplete = async (result: UploadResult) => {
    setMessage(`✅ Uploaded "${result.originalName}" successfully.`);
    await loadMediaAssets();
  };

  const filteredAssets = assets.filter((asset) => {
    const isVideo = asset.mimeType?.startsWith('video/') || asset.url?.endsWith('.mp4') || asset.url?.endsWith('.webm');
    if (filterType === 'image') return !isVideo;
    if (filterType === 'video') return isVideo;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#6a1b2a] mr-2" />
        Loading Media Library...
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2.5">
                <Film className="w-6 h-6 text-[#6a1b2a]" />
                Media Library
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Upload and manage high-resolution studio photos and cinematic video reels for the studio site.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploader((prev) => !prev)}
                className="inline-flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{showUploader ? 'Close Uploader' : 'Upload New Media'}</span>
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
                message.startsWith('✅')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{message}</span>
              <button onClick={() => setMessage('')} className="text-neutral-400 hover:text-neutral-600 font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Collapsible Direct Uploader Panel */}
          {showUploader && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Images className="w-4 h-4 text-[#6a1b2a]" />
                  Direct Media Upload
                </h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  Direct Media Storage
                </span>
              </div>
              <MediaUploader
                multiple
                category="gallery"
                label="Select or Drag Studio Photos & Videos"
                description="Files stream directly to the studio's media storage. No size limits or database bloat."
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}

          {/* Filter & Count Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-700">Filter:</span>
              <div className="flex items-center gap-1.5">
                {(['all', 'image', 'video'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filterType === t
                        ? 'bg-[#6a1b2a] text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {t === 'all' ? 'All Assets' : t === 'image' ? 'Photos Only' : 'Videos Only'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-semibold text-neutral-500">
              Showing {filteredAssets.length} of {assets.length} Assets
            </div>
          </div>

          {/* Media Grid */}
          {filteredAssets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
              <Images className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-700">No media assets found</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Upload photos or video reels above to add them to your media library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const isVideo =
                  asset.mimeType?.startsWith('video/') ||
                  asset.url?.endsWith('.mp4') ||
                  asset.url?.endsWith('.webm');
                const isBlob = asset.url?.includes('blob.vercel-storage.com');
                const sizeMB = asset.sizeBytes ? (asset.sizeBytes / 1024 / 1024).toFixed(1) + ' MB' : null;

                return (
                  <div
                    key={asset.id}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Media Preview Container */}
                    <div className="h-44 bg-neutral-950 relative flex items-center justify-center overflow-hidden">
                      {isVideo ? (
                        <video
                          src={asset.url}
                          muted
                          preload="metadata"
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.altText || asset.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Type Badge */}
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm ${
                          isVideo ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isVideo ? 'Video' : 'Photo'}
                      </span>

                      {/* Cloud Delivery Badge */}
                      {isBlob && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white shadow-sm">
                          CDN
                        </span>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <div
                          className="text-xs font-semibold text-neutral-800 truncate"
                          title={asset.originalName || asset.filename}
                        >
                          {asset.originalName || asset.filename}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-1">
                          <span>{sizeMB || (isBlob ? 'CDN Asset' : 'Local Static')}</span>
                          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100">
                        <button
                          onClick={() => handleCopyUrl(asset.url)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6a1b2a] hover:text-[#8f2a3e] transition-colors"
                        >
                          {copiedUrl === asset.url ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100"
                            title="Open direct file in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            disabled={deletingId === asset.id}
                            onClick={() => handleDelete(asset)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                            title="Delete permanently"
                          >
                            {deletingId === asset.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
    </main>
  );
}
