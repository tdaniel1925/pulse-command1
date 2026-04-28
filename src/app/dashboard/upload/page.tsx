"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, Loader2, Image as ImageIcon, Film } from "lucide-react";

const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "X"];

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  url?: string;
  progress: number;
  error?: string;
  done: boolean;
};

type ContentRequest = {
  id: string;
  occasion: string;
  description: string | null;
  target_date: string | null;
  platforms: string[];
  status: string;
  created_at: string;
  content_request_files: { id: string }[];
};

export default function UploadPage() {
  const [occasion, setOccasion] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pastRequests, setPastRequests] = useState<ContentRequest[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPastRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/content-requests");
      const data = await res.json();
      setPastRequests(data.requests ?? []);
    } finally {
      setLoadingPast(false);
    }
  }, []);

  useEffect(() => {
    loadPastRequests();
  }, [loadPastRequests]);

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function addFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming);
    const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
    const MAX_IMAGE = 10 * 1024 * 1024;
    const MAX_VIDEO = 500 * 1024 * 1024;

    const newFiles: UploadedFile[] = arr.slice(0, 20 - files.length).map(f => {
      if (!allowed.includes(f.type)) {
        return { name: f.name, size: f.size, type: f.type, progress: 0, done: true, error: "File type not allowed" };
      }
      const isVideo = f.type.startsWith("video/");
      const maxSize = isVideo ? MAX_VIDEO : MAX_IMAGE;
      if (f.size > maxSize) {
        return { name: f.name, size: f.size, type: f.type, progress: 0, done: true, error: `Too large (max ${isVideo ? "500MB" : "10MB"})` };
      }
      return { name: f.name, size: f.size, type: f.type, progress: 0, done: false };
    });

    setFiles(prev => [...prev, ...newFiles]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function uploadFilesToRequest(requestId: string) {
    const filesToUpload = files.filter(f => !f.error && !f.done);
    const fileElements = fileInputRef.current?.files;
    if (!fileElements) return;

    // Build a map of name → File
    const fileMap = new Map<string, File>();
    Array.from(fileElements).forEach(f => fileMap.set(f.name, f));

    for (let i = 0; i < filesToUpload.length; i++) {
      const fileInfo = filesToUpload[i];
      const file = fileMap.get(fileInfo.name);
      if (!file) continue;

      setFiles(prev => prev.map(f => f.name === fileInfo.name ? { ...f, progress: 10 } : f));

      const fd = new FormData();
      fd.append("file", file);
      fd.append("requestId", requestId);

      try {
        const res = await fetch("/api/content-requests/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.fileUrl) {
          setFiles(prev => prev.map(f => f.name === fileInfo.name ? { ...f, progress: 100, done: true, url: data.fileUrl } : f));
        } else {
          setFiles(prev => prev.map(f => f.name === fileInfo.name ? { ...f, done: true, error: data.error ?? "Upload failed" } : f));
        }
      } catch {
        setFiles(prev => prev.map(f => f.name === fileInfo.name ? { ...f, done: true, error: "Upload failed" } : f));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!occasion.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/content-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, description, targetDate: targetDate || null, platforms }),
      });
      const data = await res.json();
      if (data.requestId) {
        await uploadFilesToRequest(data.requestId);
        setSubmitted(true);
        setOccasion("");
        setDescription("");
        setTargetDate("");
        setPlatforms([]);
        setFiles([]);
        loadPastRequests();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };

  function formatBytes(b: number) {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Content Requests</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Upload photos or videos and tell us what you need — we&apos;ll have content ready within 48 hours.
        </p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Request submitted!</p>
            <p className="text-green-700 text-xs mt-0.5">
              Your request has been submitted! We&apos;ll have content ready within 48 hours.
            </p>
          </div>
          <button onClick={() => setSubmitted(false)} className="ml-auto text-green-400 hover:text-green-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-neutral-900">New Request</h2>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Occasion <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
            placeholder="e.g. Mother's Day promotion, Grand opening, Product launch..."
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Any details about what you want — tone, message, specific products, etc."
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Target Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Platforms</label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    platforms.includes(p)
                      ? "bg-primary-600 text-white border-primary-600"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Files <span className="text-neutral-400 font-normal">(max 20 files · images up to 10 MB · videos up to 500 MB)</span>
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-primary-400 bg-primary-50" : "border-neutral-200 hover:border-neutral-300 bg-neutral-50"
            }`}
          >
            <Upload className="w-7 h-7 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Drop files here or click to browse</p>
            <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP, MP4, MOV</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
              className="hidden"
              onChange={e => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-neutral-50 rounded-lg px-3 py-2">
                  {f.type.startsWith("video/") ? (
                    <Film className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-700 truncate">{f.name}</p>
                    <p className="text-xs text-neutral-400">{formatBytes(f.size)}</p>
                    {f.error && <p className="text-xs text-red-500">{f.error}</p>}
                    {!f.error && !f.done && f.progress > 0 && (
                      <div className="mt-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                      </div>
                    )}
                    {f.done && !f.error && <p className="text-xs text-green-600">Uploaded</p>}
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!occasion.trim() || submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Request"}
        </button>
      </form>

      {/* Past requests */}
      <div className="space-y-3">
        <h2 className="font-semibold text-neutral-900">Past Requests</h2>
        {loadingPast ? (
          <div className="flex items-center gap-2 text-neutral-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : pastRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-sm text-neutral-400">
            No requests yet — submit your first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {pastRequests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900">{req.occasion}</p>
                  {req.description && <p className="text-xs text-neutral-500 mt-0.5 truncate">{req.description}</p>}
                  <p className="text-xs text-neutral-400 mt-1">
                    {req.content_request_files.length} file{req.content_request_files.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[req.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {req.status === "in_progress" ? "In Progress" : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
