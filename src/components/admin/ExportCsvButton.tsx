"use client";

interface Props {
  data: Array<{ rank: string; client: string; published: number; lastPost: string }>;
}

export function ExportCsvButton({ data }: Props) {
  const handleExport = () => {
    const header = ["Rank", "Client", "Posts Published", "Last Post"].join(",");
    const rows = data.map((r) =>
      [r.rank, `"${r.client}"`, r.published, `"${r.lastPost}"`].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulse-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-4 py-2 rounded-lg transition"
    >
      Export CSV ↓
    </button>
  );
}
