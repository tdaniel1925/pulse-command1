"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, ExternalLink, Copy, Trash2, Sparkles, Pencil } from "lucide-react";

interface PageRow {
  id: string;
  title: string | null;
  kit: string | null;
  status: string;
  slug: string | null;
  url: string | null;
  updated_at: string;
}

export default function StudioDashboard() {
  const [pages, setPages] = useState<PageRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/studio/pages");
    const data = await res.json();
    setPages(res.ok ? data.pages : []);
  }
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch("/api/studio/pages");
      const data = await res.json();
      if (alive) setPages(res.ok ? data.pages : []);
    })();
    return () => { alive = false; };
  }, []);

  async function act(action: "duplicate" | "delete", pageId: string) {
    if (action === "delete" && !confirm("Delete this page? This can't be undone.")) return;
    setBusy(pageId);
    try {
      await fetch("/api/studio/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, pageId }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" /> Your pages
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Build, edit, and publish AI landing pages.</p>
          </div>
          <Link
            href="/studio/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New page
          </Link>
        </div>

        {pages === null ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Sparkles className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="font-medium text-neutral-700">No pages yet</p>
            <p className="text-sm text-neutral-400 mt-1 mb-5">Describe a goal and we&apos;ll design a beautiful page.</p>
            <Link href="/studio/new" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700">
              <Plus className="w-4 h-4" /> Build your first page
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {pages.map((p) => (
              <li key={p.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4 hover:border-neutral-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 truncate">{p.title ?? "Untitled page"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === "live" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}>{p.status === "live" ? "Live" : "Draft"}</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {p.kit ?? "atlas"} · updated {new Date(p.updated_at).toLocaleDateString()}
                    {p.status === "live" && p.slug && <> · /p/{p.slug}</>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {p.status === "live" && p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" title="View live" className="p-2 text-neutral-400 hover:text-green-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Link href={`/studio/new?page=${p.id}`} title="Edit" className="p-2 text-neutral-400 hover:text-primary-600">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button onClick={() => act("duplicate", p.id)} disabled={busy === p.id} title="Duplicate" className="p-2 text-neutral-400 hover:text-neutral-700 disabled:opacity-40">
                    {busy === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => act("delete", p.id)} disabled={busy === p.id} title="Delete" className="p-2 text-neutral-400 hover:text-red-600 disabled:opacity-40">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
