import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

const galleryHeader = (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
      <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>07 / Gallery</span>
      <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
    </div>
    <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 32px' }}>Show off your work</h2>
  </>
)

export function GalleryBlock({ variant }: { content: KitContent; theme: ThemeProps; variant?: string }) {
  if (variant === 'bento') {
    // 4-col grid: 1 large 2x2 hero tile + smaller tiles around it, mixed shapes.
    const tiles: { col?: string; row?: string }[] = [
      { col: 'span 2', row: 'span 2' },
      {}, {}, {}, { col: 'span 2' }, {}, {}, {},
    ]
    return (
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
        <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          {galleryHeader}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridAutoRows: 'minmax(170px, 1fr)', gap: 16 }}>
            {tiles.map((tile, i) => (
              <div key={i} style={{ gridColumn: tile.col, gridRow: tile.row, height: '100%' }}>
                <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: even grid.
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>07 / Gallery</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 32px' }}>Show off your work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
          <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
          <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
          <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
          <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
          <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
        </div>
      </div>
    </section>
  )
}
