"use client";

import { LOOK_PRESETS, tokens, applyLook, type ThemeProps } from "@/lib/studio/theme";

/**
 * Premium "Looks" picker — the primary design control. Each Look is shown as a
 * live visual swatch (its real palette + display font), not a jargon label. One
 * click reskins the whole page. This is what replaces the developer-y pills.
 */
export function LooksPicker({
  theme,
  accent,
  onApply,
}: {
  theme: ThemeProps;
  accent?: string;
  onApply: (next: ThemeProps) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Look</div>
      <div className="grid grid-cols-2 gap-2">
        {LOOK_PRESETS.map((preset) => {
          const active = theme.theme === preset.id;
          // Compute the Look's tokens with the current brand accent for a true preview.
          const t = tokens({ ...applyLook(preset, accent) });
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApply(applyLook(preset, accent))}
              className={`group text-left rounded-xl border overflow-hidden transition-all ${
                active ? "border-primary-500 ring-2 ring-primary-300" : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {/* Live mini-swatch of the look */}
              <div
                style={{
                  background: t["--bg"],
                  padding: "10px 10px 8px",
                  borderBottom: `1px solid ${t["--border"]}`,
                }}
              >
                <div
                  style={{
                    fontFamily: `${t["--font-display"]}, system-ui, sans-serif`,
                    color: t["--fg"],
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-.02em",
                    marginBottom: 8,
                  }}
                >
                  Aa
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ width: 14, height: 14, borderRadius: 5, background: t["--accent"] }} />
                  <span style={{ width: 14, height: 14, borderRadius: 5, background: t["--accent-2"] }} />
                  <span style={{ width: 14, height: 14, borderRadius: 5, background: t["--surface-2"], border: `1px solid ${t["--border"]}` }} />
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9,
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: t["--btn-bg"],
                      color: t["--btn-fg"],
                      fontWeight: 700,
                      fontFamily: `${t["--font-body"]}, sans-serif`,
                    }}
                  >
                    Go
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-1.5 bg-white">
                <div className="text-xs font-semibold text-neutral-800">{preset.name}</div>
                <div className="text-[10px] text-neutral-400 leading-tight">{preset.blurb}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
