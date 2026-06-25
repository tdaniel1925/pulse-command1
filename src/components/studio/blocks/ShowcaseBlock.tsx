import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function ShowcaseBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>06 / Showcase</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 48, alignItems: 'center' }}>
          <div style={{ borderRadius: 'var(--img-radius,16px)', overflow: 'hidden', boxShadow: 'var(--img-shadow,0 14px 38px rgba(90,55,30,.10))', border: 'var(--img-border,none)', filter: 'var(--img-filter,none)' }}>
            <Slot variant="rect" src={content.showcase.image.src} alt={content.showcase.image.alt} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3.4', display: 'block' }} />
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>Why Halo</span>
            <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '12px 0 18px' }}>{content.showcase.heading}</h2>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.65, color: 'var(--muted,#8A7B6B)', margin: '0 0 24px' }}>{content.showcase.body}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.5 }}><span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: 'var(--accent,#E0603A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg,#fff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>Smart cropping keeps faces and focal points in frame</li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.5 }}><span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: 'var(--accent,#E0603A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg,#fff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>Filters and frames apply across the whole page in one click</li>
              <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.5 }}><span style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: 'var(--accent,#E0603A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg,#fff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>Optimized and compressed for fast loading, automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
