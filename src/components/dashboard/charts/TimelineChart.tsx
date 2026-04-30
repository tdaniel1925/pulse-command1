'use client';

export interface TimelineItem {
  label: string;
  sublabel?: string;
  quarter?: string;
  status: 'done' | 'active' | 'upcoming';
}

export interface TimelineChartProps {
  items: TimelineItem[];
  accentColor: string;
  textColor: string;
}

export function parseTimelineFromBullets(bullets: string[]): TimelineItem[] {
  return bullets.map((b) => {
    const parts = b.split('|');
    const quarter = parts[0]?.trim();
    const label = parts[1]?.trim() ?? '';
    const rawStatus = parts[2]?.trim() ?? 'upcoming';
    const status: TimelineItem['status'] =
      rawStatus === 'done' ? 'done' : rawStatus === 'active' ? 'active' : 'upcoming';
    return { quarter, label, status };
  });
}

function NodeIcon({
  status,
  accentColor,
}: {
  status: TimelineItem['status'];
  accentColor: string;
}) {
  if (status === 'done') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2.5 7L5.5 10L11.5 4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ border: `2px solid ${accentColor}`, backgroundColor: 'transparent' }}
      >
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    );
  }

  // upcoming
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white"
      style={{ border: `2px dashed ${accentColor}` }}
    />
  );
}

function ConnectorLine({
  fromStatus,
  accentColor,
}: {
  fromStatus: TimelineItem['status'];
  accentColor: string;
}) {
  const isDashed = fromStatus === 'upcoming';
  return (
    <div className="flex-1 flex items-center" style={{ marginTop: -16 }}>
      <div
        className="w-full"
        style={{
          height: 2,
          borderTop: isDashed
            ? `2px dashed #D1D5DB`
            : `2px solid ${accentColor}`,
        }}
      />
    </div>
  );
}

export function TimelineChart({ items, accentColor, textColor }: TimelineChartProps) {
  return (
    <div className="w-full">
      {/* Nodes row */}
      <div className="flex items-start">
        {items.map((item, i) => (
          <div key={i} className="flex items-center flex-1">
            {/* Node + label */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 64 }}>
              <NodeIcon status={item.status} accentColor={accentColor} />
              <div className="mt-2 text-center px-1">
                {item.quarter && (
                  <p className="text-xs font-semibold" style={{ color: accentColor }}>
                    {item.quarter}
                  </p>
                )}
                <p className="text-xs font-semibold leading-tight mt-0.5" style={{ color: textColor }}>
                  {item.label}
                </p>
                {item.sublabel && (
                  <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">
                    {item.sublabel}
                  </p>
                )}
              </div>
            </div>
            {/* Connector (not after last) */}
            {i < items.length - 1 && (
              <ConnectorLine fromStatus={item.status} accentColor={accentColor} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
