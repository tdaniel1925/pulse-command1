import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function HeaderBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--surface,#fff)', borderBottom: 'var(--border-w,1px) solid var(--border,#EADFD2)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 21, letterSpacing: '-.02em' }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent,#E0603A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg,#fff)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 6 6 .9-4.5 4.3L17.8 20 12 16.8 6.2 20l1.3-6.8L3 8.9 9 8z" /></svg>
          </span>
          {content.brandName}
        </div>
        <nav style={{ display: 'flex', gap: 26, marginLeft: 8, fontFamily: "var(--font-body,'Manrope')", fontWeight: 600, fontSize: 15 }}>
          <a href="#" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>Product</a>
          <a href="#" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>Features</a>
          <a href="#" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>Pricing</a>
          <a href="#" style={{ color: 'var(--fg)', textDecoration: 'none', opacity: 0.85 }}>Company</a>
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="#" style={{ color: 'var(--fg)', textDecoration: 'none', fontFamily: "var(--font-body,'Manrope')", fontWeight: 600, fontSize: 15, opacity: 0.85 }}>Sign in</a>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 20px', background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', borderRadius: 'var(--btn-radius,12px)', boxShadow: 'var(--btn-shadow,none)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'transform .15s ease' }}>Get started</a>
        </div>
      </div>
    </header>
  )
}
