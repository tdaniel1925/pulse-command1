import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function NewsletterBlock(props: { content: KitContent; theme: ThemeProps }) {
  void props; // static block — no content/theme needed
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 60px) 0' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: '48px 40px', textAlign: 'center', boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
          <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(26px,3.2vw,36px)', letterSpacing: '-.02em', margin: '0 0 10px' }}>Get design tips in your inbox</h2>
          <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 17, color: 'var(--muted,#8A7B6B)', margin: '0 0 26px' }}>One short email a week. No spam, unsubscribe any time.</p>
          <form style={{ display: 'flex', gap: 12, maxWidth: 460, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input type="email" placeholder="you@example.com" style={{ flex: 1, minWidth: 220, padding: '15px 18px', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontSize: 16, background: 'var(--bg,#FBF6EF)', color: 'var(--fg,#2A2018)' }} />
            <button type="submit" style={{ padding: '15px 26px', background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', boxShadow: 'var(--btn-shadow,none)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  )
}
