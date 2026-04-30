"use client";

import { useState } from "react";
import { Video, Play } from "lucide-react";
import VideoPlayerModal from "@/components/dashboard/VideoPlayerModal";
import { getAvatarGroup } from "@/lib/heygen";

interface VideoRow {
  id: string;
  title: string;
  status: string;
  thumbnail_url: string | null;
  video_url: string | null;
  heygen_video_id: string | null;
  heygen_avatar_group_id?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

interface Props {
  video: VideoRow;
}

const statusStyles: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-700",
  demo: "bg-neutral-100 text-neutral-600",
  pending_review: "bg-amber-100 text-amber-700",
  ready: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-neutral-100 text-neutral-500",
};

const statusLabels: Record<string, string> = {
  processing: "Processing",
  demo: "Demo",
  pending_review: "Pending Review",
  ready: "Ready to Review",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function VideoCard({ video }: Props) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isProcessing = video.status === "processing";
  const isWatchable =
    video.status === "ready" ||
    video.status === "pending_review" ||
    video.status === "approved" ||
    video.status === "published";
  const statusLabel = statusLabels[video.status] ?? video.status;
  const statusStyle = statusStyles[video.status] ?? "bg-neutral-100 text-neutral-600";

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
        {/* Thumbnail / preview area */}
        <div
          className="aspect-video bg-neutral-900 relative cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => isWatchable && setPlayerOpen(true)}
        >
          {video.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <Video className="w-10 h-10 text-neutral-600" />
            </div>
          )}

          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span className="text-white text-xs font-medium">Processing...</span>
            </div>
          )}

          {/* Play button on hover */}
          {isWatchable && hovered && !isProcessing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-neutral-900 ml-1" />
              </div>
            </div>
          )}

          {/* Status badge */}
          <span
            className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <p className="font-semibold text-neutral-900 text-sm line-clamp-1">{video.title}</p>
          <div>
            <p className="text-xs text-neutral-400">{formatDate(video.created_at)}</p>
            {video.heygen_avatar_group_id && (
              <p className="text-xs text-neutral-400 mt-1">
                Avatar: {getAvatarGroup(video.heygen_avatar_group_id)?.label ?? 'Unknown'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isWatchable && (
              <button
                onClick={() => setPlayerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Watch
              </button>
            )}
          </div>
        </div>
      </div>

      <VideoPlayerModal
        video={video}
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
      />
    </>
  );
}
