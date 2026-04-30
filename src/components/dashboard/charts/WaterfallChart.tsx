'use client';

export interface WaterfallBar {
  label: string;
  value: number;
  isTotal?: boolean;
  color?: string;
}

export interface WaterfallChartProps {
  bars: WaterfallBar[];
  accentColor: string;
  textColor: string;
  title?: string;
}

function parseWaterfallBullets(bullets: string[]): WaterfallBar[] {
  return bullets.map((b) => {
    const parts = b.split('|');
    const label = parts[0]?.trim() ?? '';
    const rawValue = parts[1]?.trim() ?? '0';
    const isTotal = parts[2]?.trim() === 'total';
    const value = parseFloat(rawValue.replace(/[^0-9.\-+]/g, '')) || 0;
    return { label, value, isTotal };
  });
}

function formatValue(v: number): string {
  const abs = Math.abs(v);
  let str: string;
  if (abs >= 1_000_000) str = `$${(abs / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) str = `$${(abs / 1_000).toFixed(0)}K`;
  else str = `$${abs.toFixed(0)}`;
  return v >= 0 ? `+${str}` : `-${str}`;
}

function darken(hex: string, amount = 40): string {
  const cleaned = hex.replace('#', '');
  const r = Math.max(0, parseInt(cleaned.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(cleaned.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(cleaned.substring(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function WaterfallChart({ bars, accentColor, textColor, title }: WaterfallChartProps) {
  const CHART_HEIGHT = 160;

  // Build running totals: each bar floats from its base
  // isTotal bars start from 0
  const processed: { bar: WaterfallBar; base: number; top: number }[] = [];
  let running = 0;

  for (const bar of bars) {
    if (bar.isTotal) {
      processed.push({ bar, base: 0, top: running + bar.value });
      running = running + bar.value;
    } else {
      const base = running;
      const top = running + bar.value;
      processed.push({ bar, base, top });
      running = top;
    }
  }

  // Find chart scale
  const allValues = processed.flatMap(({ base, top }) => [base, top]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(0, ...allValues);
  const range = maxVal - minVal || 1;

  const toY = (v: number) => ((maxVal - v) / range) * CHART_HEIGHT;

  const zeroY = toY(0);

  return (
    <div className="w-full" style={{ color: textColor }}>
      {title && (
        <p className="text-sm font-semibold mb-3" style={{ color: textColor }}>{title}</p>
      )}
      <div className="relative" style={{ height: CHART_HEIGHT + 48 }}>
        {/* Zero line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: zeroY,
            height: 1,
            backgroundColor: '#D1D5DB',
          }}
        />

        {/* Bars */}
        <div className="flex items-end gap-1 h-full" style={{ alignItems: 'flex-start', paddingBottom: 40 }}>
          {processed.map(({ bar, base, top }, i) => {
            const barTop = Math.min(toY(base), toY(top));
            const barHeight = Math.abs(toY(base) - toY(top));
            const isPositive = bar.value >= 0;

            let barColor: string;
            if (bar.color) {
              barColor = bar.color;
            } else if (bar.isTotal) {
              barColor = darken(accentColor, 30);
            } else if (isPositive) {
              barColor = accentColor;
            } else {
              barColor = '#EF4444';
            }

            const labelY = barTop - 20;

            return (
              <div
                key={i}
                className="relative flex-1"
                style={{ height: CHART_HEIGHT }}
              >
                {/* Value label */}
                <span
                  className="absolute text-[10px] font-semibold text-center w-full"
                  style={{
                    top: Math.max(0, labelY),
                    color: barColor,
                    left: 0,
                  }}
                >
                  {formatValue(bar.value)}
                </span>

                {/* Bar body */}
                <div
                  className="absolute left-1 right-1 rounded-sm"
                  style={{
                    top: barTop,
                    height: Math.max(2, barHeight),
                    backgroundColor: barColor,
                  }}
                />

                {/* Connector dashed line to next bar */}
                {i < processed.length - 1 && (
                  <div
                    className="absolute right-0"
                    style={{
                      top: toY(top),
                      width: 8,
                      height: 1,
                      borderTop: `1px dashed #9CA3AF`,
                    }}
                  />
                )}

                {/* Category label */}
                <span
                  className="absolute bottom-0 left-0 right-0 text-[9px] text-center leading-tight"
                  style={{
                    color: textColor,
                    bottom: -38,
                  }}
                >
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function parseWaterfallFromBullets(bullets: string[]): WaterfallBar[] {
  return parseWaterfallBullets(bullets);
}
