'use client';

export interface ProcessStep {
  number: number;
  title: string;
  description?: string;
  icon?: string;
}

export interface ProcessFlowProps {
  steps: ProcessStep[];
  accentColor: string;
  accentLight: string;
  textColor: string;
}

export function parseProcessFromBullets(bullets: string[]): ProcessStep[] {
  return bullets.map((b, i) => {
    const parts = b.split('|');
    const number = parseInt(parts[0]?.trim() ?? String(i + 1), 10) || i + 1;
    const title = parts[1]?.trim() ?? '';
    const description = parts[2]?.trim();
    const icon = parts[3]?.trim();
    return { number, title, description, icon };
  });
}

export function ProcessFlow({ steps, accentColor, accentLight, textColor }: ProcessFlowProps) {
  return (
    <div className="w-full flex items-start">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex items-center flex-1">
            {/* Step card */}
            <div
              className="flex-1 rounded-xl p-3 flex flex-col gap-1.5"
              style={{
                backgroundColor: accentLight,
                borderTop: `4px solid ${accentColor}`,
                minHeight: 100,
              }}
            >
              {/* Number badge */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: accentColor }}
                >
                  {step.number}
                </div>
                {step.icon && (
                  <span className="text-2xl leading-none">{step.icon}</span>
                )}
              </div>
              {/* Title */}
              <p className="text-xs font-semibold leading-tight" style={{ color: textColor }}>
                {step.title}
              </p>
              {/* Description */}
              {step.description && (
                <p
                  className="text-[10px] leading-tight text-neutral-500"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  } as React.CSSProperties}
                >
                  {step.description}
                </p>
              )}
            </div>
            {/* Arrow */}
            {!isLast && (
              <div
                className="flex-shrink-0 text-xl font-bold px-1"
                style={{ color: accentColor }}
              >
                →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
