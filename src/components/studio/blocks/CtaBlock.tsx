import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function CtaBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 40px) 0 calc(var(--pad-scale,1) * 80px)' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div className="sx-grain" style={{ background: 'var(--grad-accent,var(--accent,#E0603A))', borderRadius: 'var(--radius,16px)', padding: '64px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 40, alignItems: 'center', overflow: 'hidden' }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.04, letterSpacing: '-.02em', margin: '0 0 16px', color: 'var(--accent-fg,#fff)' }}>{content.cta.headline}</h2>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 19, lineHeight: 1.55, margin: '0 0 28px', color: 'var(--accent-fg,#fff)', opacity: 0.92 }}>{content.cta.subhead ?? 'Join 12,000+ builders. Your first page is free — no card required.'}</p>
            <a href="#" className="sx-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 30px', background: 'var(--accent-fg,#fff)', color: 'var(--accent,#E0603A)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 800, fontSize: 17, textDecoration: 'none', transition: 'transform .15s ease' }}>{content.cta.button} →</a>
          </div>
          <div style={{ borderRadius: 'var(--img-radius,16px)', overflow: 'hidden', border: 'var(--img-border,none)', filter: 'var(--img-filter,none)', boxShadow: '0 20px 50px rgba(0,0,0,.2)' }}>
            <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
