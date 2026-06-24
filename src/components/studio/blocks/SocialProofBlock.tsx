import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function SocialProofBlock(props: { content: KitContent; theme: ThemeProps }) {
  void props; // static block — no content/theme needed
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 34px) 0' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <p style={{ textAlign: 'center', fontFamily: "var(--font-body,'Manrope')", fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted,#8A7B6B)', margin: '0 0 22px' }}>Trusted by fast-moving teams</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '18px 48px', opacity: 0.72 }}>
          <span style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 22, letterSpacing: '-.02em' }}>Nova</span>
          <span style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 22, letterSpacing: '.06em' }}>FORGE</span>
          <span style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 22, fontStyle: 'italic' }}>Quill</span>
          <span style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 22, letterSpacing: '-.03em' }}>mosaic</span>
          <span style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 22, letterSpacing: '.04em' }}>PULSE</span>
          <span style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 22 }}>Lumen·</span>
        </div>
      </div>
    </section>
  )
}
