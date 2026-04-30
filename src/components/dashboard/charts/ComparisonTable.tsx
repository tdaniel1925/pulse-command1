'use client';

export interface ComparisonTableProps {
  headers: string[];
  rows: string[][];
  highlightCol?: number; // 1-indexed
  accentColor: string;
  accentLight: string;
  textColor: string;
}

export function parseComparisonFromBullets(bullets: string[]): {
  headers: string[];
  rows: string[][];
} {
  if (bullets.length === 0) return { headers: [], rows: [] };
  const headers = bullets[0]!.split('|').map((h) => h.trim());
  const rows = bullets.slice(1).map((b) => b.split('|').map((c) => c.trim()));
  return { headers, rows };
}

function CellValue({ value }: { value: string }) {
  const normalized = value.toLowerCase().trim();

  if (value === '✓' || normalized === 'true') {
    return (
      <span className="inline-flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#22C55E" opacity="0.15" />
          <path
            d="M4.5 8L7 10.5L11.5 5.5"
            stroke="#16A34A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (value === '✗' || normalized === 'false') {
    return (
      <span className="inline-flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#EF4444" opacity="0.15" />
          <path
            d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
            stroke="#DC2626"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return <span>{value}</span>;
}

export function ComparisonTable({
  headers,
  rows,
  highlightCol = 1,
  accentColor,
  accentLight,
  textColor,
}: ComparisonTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg" style={{ border: `1px solid #E5E7EB` }}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => {
              const isHighlight = i === highlightCol - 1;
              return (
                <th
                  key={i}
                  className="px-3 py-2 text-center font-semibold"
                  style={{
                    backgroundColor: isHighlight ? accentColor : '#F9FAFB',
                    color: isHighlight ? '#FFFFFF' : textColor,
                    borderBottom: '1px solid #E5E7EB',
                    borderRight: i < headers.length - 1 ? '1px solid #E5E7EB' : undefined,
                    textAlign: i === 0 ? 'left' : 'center',
                  }}
                >
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{ backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}
            >
              {row.map((cell, colIdx) => {
                const isHighlight = colIdx === highlightCol - 1;
                return (
                  <td
                    key={colIdx}
                    className="px-3 py-2"
                    style={{
                      backgroundColor: isHighlight ? accentLight : undefined,
                      color: isHighlight ? accentColor : textColor,
                      fontWeight: isHighlight ? 600 : 400,
                      borderBottom: rowIdx < rows.length - 1 ? '1px solid #E5E7EB' : undefined,
                      borderRight: colIdx < row.length - 1 ? '1px solid #E5E7EB' : undefined,
                      textAlign: colIdx === 0 ? 'left' : 'center',
                    }}
                  >
                    <CellValue value={cell} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
