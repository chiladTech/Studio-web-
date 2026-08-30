'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, RefreshCw, Film, Image as ImageIcon } from 'lucide-react';
import { uploadMediaDirect, UploadResult } from '@/lib/blob-client';

export interface FileUploadItem {
  id: string;
  file: File;
  previewUrl?: string;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETE' | 'ERROR';
  progress: number;
  error?: string;
  result?: UploadResult;
}

interface MediaUploaderProps {
  category?: 'portfolio' | 'gallery' | 'services' | 'hero' | 'stories' | 'logo' | 'general';
  accept?: string;
  multiple?: boolean;
  compact?: boolean;
  label?: string;
  description?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onAllUploadsComplete?: (results: UploadResult[]) => void;
}

export default function MediaUploader({
  category = 'general',
  accept = 'image/*,video/*',
  multiple = false,
  compact = false,
  label = 'Upload Media',
  description = 'Drag & drop files or click to browse. Supported: JPEG, PNG, WebP, AVIF, MP4, WebM (up to 250MB).',
  onUploadComplete,
  onAllUploadsComplete,
}: MediaUploaderProps) {
  const [items, setItems] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUploadForItem = async (item: FileUploadItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'UPLOADING', progress: 0, error: undefined } : i))
    );

    try {
      const result = await uploadMediaDirect(item.file, {
        category,
        onProgress: (percent) => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: percent } : i))
          );
        },
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'COMPLETE', progress: 100, result } : i
        )
      );

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err: any) {
      console.error('Direct upload failed:', err);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'ERROR', error: err.message || 'Upload failed. Please check your connection.' }
            : i
        )
      );
    }
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const newItems: FileUploadItem[] = [];

    const fileArray = Array.from(files);
    const selected = multiple ? fileArray : [fileArray[0]];

    for (const file of selected) {
      if (!file) continue;
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const isImg = file.type.startsWith('image/');
      const previewUrl = isImg ? URL.createObjectURL(file) : undefined;

      const item: FileUploadItem = {
        id,
        file,
        previewUrl,
        status: 'QUEUED',
        progress: 0,
      };

      newItems.push(item);
    }

    if (multiple) {
      setItems((prev) => [...prev, ...newItems]);
    } else {
      setItems(newItems);
    }

    // Automatically trigger upload for each added item
    newItems.forEach((item) => {
      startUploadForItem(item);
    });
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return filtered;
    });
  };

  const handleRetry = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) {
      startUploadForItem(target);
    }
  };

  if (compact) {
    const isUploading = items.some((i) => i.status === 'UPLOADING');
    const latestItem = items[items.length - 1];

    return (
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesAdded(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-[#f4e8ea] hover:bg-[#ebd5d8] text-[#6a1b2a] border border-[#6a1b2a]/20 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isUploading ? `Uploading (${latestItem?.progress || 0}%)...` : label}</span>
        </button>

        {latestItem?.status === 'ERROR' && (
          <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{latestItem.error}</span>
            <button
              type="button"
              onClick={() => handleRetry(latestItem.id)}
              className="ml-2 text-xs underline font-semibold hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesAdded(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#6a1b2a] bg-[#f4e8ea]/50 scale-[0.99]'
            : 'border-neutral-300 hover:border-[#6a1b2a]/50 bg-neutral-50/50 hover:bg-neutral-50'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#f4e8ea] text-[#6a1b2a] flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-neutral-800 mb-1">{label}</p>
        <p className="text-xs text-neutral-500 max-w-md">{description}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-[#6a1b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:bg-[#8f2a3e] transition-colors">
          Browse Files
        </div>
      </div>

      {/* Upload Items Progress List */}
      {items.length > 0 && (
        <div className="space-y-2.5">
          {items.map((item) => {
            const isVid = item.file.type.startsWith('video/');
            const sizeMB = (item.file.size / 1024 / 1024).toFixed(1);

            return (
              <div
                key={item.id}
                className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3"
              >
                {/* Thumbnail Preview */}
                <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-neutral-400">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                  ) : isVid ? (
                    <Film className="w-6 h-6 text-purple-600" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  )}
                </div>

                {/* Details & Progress Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-xs font-semibold text-neutral-800 truncate" title={item.file.name}>
                      {item.file.name}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 flex-shrink-0">
                      {sizeMB} MB
                    </div>
                  </div>

                  {/* Progress Bar or Status */}
                  {item.status === 'UPLOADING' && (
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#6a1b2a] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.status === 'COMPLETE' && (
                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Uploaded to Vercel Blob successfully</span>
                    </div>
                  )}

                  {item.status === 'ERROR' && (
                    <div className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{item.error}</span>
                    </div>
                  )}

                  {item.status === 'QUEUED' && (
                    <div className="text-[11px] text-neutral-400 font-medium">Waiting to start...</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.status === 'UPLOADING' && (
                    <span className="text-xs font-bold text-[#6a1b2a]">{item.progress}%</span>
                  )}

                  {item.status === 'ERROR' && (
                    <button
                      type="button"
                      onClick={() => handleRetry(item.id)}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-[#6a1b2a]"
                      title="Retry"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-red-600"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
