import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function GalleryBlock(props: { content: KitContent; theme: ThemeProps }) {
  void props; // static block — no content/theme needed
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>07 / Gallery</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 32px' }}>Show off your work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
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
