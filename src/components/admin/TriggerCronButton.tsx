"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function TriggerCronButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTrigger() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/trigger-cron", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Unknown error");
      } else {
        setResult(json.message ?? "Done");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleTrigger}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Trigger Weekly Posts
      </button>
      {result && <p className="text-sm text-green-600">{result}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
