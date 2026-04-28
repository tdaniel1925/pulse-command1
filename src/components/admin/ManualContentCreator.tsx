"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "X"];

type Tab = "posts" | "video" | "audio";

export default function ManualContentCreator({ clientId }: { clientId: string }) {
  const [tab, setTab] = useState<Tab>("posts");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Posts state
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postPlatforms, setPostPlatforms] = useState<string[]>(["Instagram", "Facebook"]);

  // Video state
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  // Audio state
  const [audioUrl, setAudioUrl] = useState("");
  const [audioTitle, setAudioTitle] = useState("");

  function togglePlatform(p: string) {
    setPostPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  async function submit() {
    setSaving(true);
    try {
      let body: Record<string, unknown> = { type: tab, clientId };
      if (tab === "posts") {
        body = { ...body, content: postContent, imageUrl: postImageUrl || undefined, platforms: postPlatforms };
      } else if (tab === "video") {
        body = { ...body, videoUrl, title: videoTitle };
      } else {
        body = { ...body, audioUrl, title: audioTitle };
      }

      await fetch(`/api/admin/clients/${clientId}/add-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Reset fields
      if (tab === "posts") { setPostContent(""); setPostImageUrl(""); }
      if (tab === "video") { setVideoUrl(""); setVideoTitle(""); }
      if (tab === "audio") { setAudioUrl(""); setAudioTitle(""); }
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: "Social Post" },
    { key: "video", label: "Video" },
    { key: "audio", label: "Audio" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-neutral-900 text-sm">Add Content to Client Queue</h3>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {tab === "posts" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Post Copy</label>
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              rows={4}
              placeholder="Write the post copy here..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Image URL (optional)</label>
            <input
              type="url"
              value={postImageUrl}
              onChange={e => setPostImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Platforms</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    postPlatforms.includes(p)
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
      )}

      {/* Video */}
      {tab === "video" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Video Title</label>
            <input
              type="text"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              placeholder="Monthly AI Video — April 2026"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Video URL</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
      )}

      {/* Audio */}
      {tab === "audio" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Episode Title</label>
            <input
              type="text"
              value={audioTitle}
              onChange={e => setAudioTitle(e.target.value)}
              placeholder="Episode 1 — Your Brand Story"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Audio URL (MP3)</label>
            <input
              type="url"
              value={audioUrl}
              onChange={e => setAudioUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={submit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Add to Client Queue"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle className="w-4 h-4" /> Added!
          </span>
        )}
      </div>
    </div>
  );
}
