"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Download, Video } from "lucide-react";
import { ApproveButton } from "@/components/dashboard/ApproveButton";
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
  open: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const statusLabels: Record<string, string> = {
  processing: "Processing",
  demo: "Demo",
  pending_review: "Pending Review",
  ready: "Ready to Review",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

export default function VideoPlayerModal({ video, open, onClose }: Props) {
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isPendingReview = video.status === "pending_review" || video.status === "ready";
  const statusLabel = statusLabels[video.status] ?? video.status;

  function handleApproveClose() {
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900 text-base line-clamp-1">{video.title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video player */}
        <div className="bg-neutral-900 px-6 py-4">
          {video.video_url ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={video.video_url}
              controls
              autoPlay
              className="w-full max-h-[70vh] rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Video className="w-12 h-12 text-neutral-600" />
              <p className="text-neutral-400 text-sm">
                {video.status === "processing"
                  ? "Video is still processing — check back in a few minutes."
                  : "Video is still being generated."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <div className="space-y-1">
              <span>{formatDate(video.created_at)}</span>
              {video.heygen_avatar_group_id && (
                <div className="text-xs text-neutral-400">
                  Avatar: {getAvatarGroup(video.heygen_avatar_group_id)?.label ?? 'Unknown'}
                </div>
              )}
            </div>
            <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Approve / Reject */}
            {isPendingReview && (
              <div onClick={handleApproveClose}>
                <ApproveButton type="video" id={video.id} />
              </div>
            )}

            {/* Download */}
            {video.video_url && (
              <a
                href={video.video_url}
                download
                className="inline-flex items-center gap-1.5 text-sm font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
