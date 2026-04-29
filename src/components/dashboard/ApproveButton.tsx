"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  type: "post" | "video";
  id: string;
}

export function ApproveButton({ type, id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    try {
      await fetch("/api/content/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action }),
      });

      // If approving a social post, publish it via Ayrshare
      if (action === "approve" && type === "post") {
        await fetch("/api/ayrshare/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: id }),
        });
      }

      setDone(action === "approve" ? "approved" : "rejected");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (done === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
        <CheckCircle className="w-3.5 h-3.5" /> Approved
      </span>
    );
  }
  if (done === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg">
        Rejected
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("approve")}
        disabled={!!loading}
        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
      >
        {loading === "approve" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5" />
        )}
        Approve
      </button>
      <button
        onClick={() => act("reject")}
        disabled={!!loading}
        className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
      >
        {loading === "reject" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
        Reject
      </button>
    </div>
  );
}
