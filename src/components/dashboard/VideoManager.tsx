"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import VideoCard from "@/components/dashboard/VideoCard";
import CreateVideoModal from "@/components/dashboard/CreateVideoModal";

interface VideoRow {
  id: string;
  title: string;
  status: string;
  thumbnail_url: string | null;
  video_url: string | null;
  heygen_video_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface Props {
  videos: VideoRow[];
  clientId: string;
  planName: string;
}

export default function VideoManager({ videos, clientId, planName }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">AI Videos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            HeyGen-powered talking-head videos generated from your content.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Video className="w-4 h-4" />
          Create Video
        </button>
      </div>

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-neutral-300" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Create your first AI video
          </h2>
          <p className="text-sm text-neutral-500 max-w-sm mb-8">
            Generate professional talking-head videos powered by HeyGen AI
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors mb-8"
          >
            <Video className="w-4 h-4" />
            Create Video
          </button>
          <ul className="text-sm text-neutral-500 space-y-2 text-left">
            {[
              "AI avatar presenter",
              "Custom script",
              "Your brand colors",
              "HD quality",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* Video grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <CreateVideoModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        clientId={clientId}
      />
    </div>
  );
}
