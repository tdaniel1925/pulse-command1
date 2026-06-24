import type { CSSProperties } from 'react'
import { Slot } from '@/components/studio/Slot'
import { tokenStyle, type ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

/**
 * Photo Grid kit — a byte-exact port of reference/kits/photo-grid.dc.html.
 *
 * A bento-style photo grid. The source renders a list of cards (each a media-slot
 * in a sized grid cell) plus an "Add photo" button. Per the port rules, editor
 * chrome — the per-card grip/resize/delete controls and the bottom hint ribbon —
 * is removed; only the grid of photo slots and the add-photo affordance remain.
 *
 * The five default cards and their sizes (big, sm, sm, wide, sm) are reproduced
 * exactly, with grid-column / grid-row spans derived from the source SIZES map.
 * Every inline style string is copied verbatim into a React style object
 * (camelCase keys, identical string values). media-slot -> <Slot variant="rect">
 * with src={null} (Gemini fills these later). SSR-safe and presentational.
 */

// SIZES + ORDER + COLS, copied verbatim from the source component logic.
const SIZES: Record<string, { c: number; r: number }> = {
  sm: { c: 1, r: 1 },
  wide: { c: 2, r: 1 },
  tall: { c: 1, r: 2 },
  big: { c: 2, r: 2 },
}
const COLS = 4

// The five default cards from the source constructor.
const DEFAULT_CARDS: { k: number; size: string }[] = [
  { k: 1, size: 'big' },
  { k: 2, size: 'sm' },
  { k: 3, size: 'sm' },
  { k: 4, size: 'wide' },
  { k: 5, size: 'sm' },
]

export function PhotoGridKit({ content, theme }: { content: KitContent; theme: ThemeProps }) {
  void content

  const root: CSSProperties = {
    ...tokenStyle(theme),
    width: '100%',
  }

  return (
    <div style={root}>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gridAutoRows: '158px', gap: 16, gridAutoFlow: 'dense' }}>
          {DEFAULT_CARDS.map((c) => {
            const sz = SIZES[c.size] || SIZES.sm
            const cs = Math.min(COLS, sz.c)
            return (
              <div
                key={c.k}
                style={{
                  position: 'relative',
                  gridColumn: 'span ' + cs,
                  gridRow: 'span ' + sz.r,
                  borderRadius: 'var(--img-radius,16px)',
                  overflow: 'hidden',
                  background: 'var(--surface-2,#F4EADC)',
                  boxShadow: 'var(--img-shadow,0 14px 38px rgba(90,55,30,.10))',
                  border: 'var(--img-border,none)',
                  minHeight: 0,
                }}
              >
                <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            )
          })}
          <button style={{ gridColumn: 'span 1', border: '2px dashed var(--border,#EADFD2)', background: 'var(--surface-2,#F4EADC)', borderRadius: 'var(--img-radius,16px)', color: 'var(--muted,#8A7B6B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, minHeight: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            Add photo
          </button>
        </div>
      </div>
    </div>
  )
}
