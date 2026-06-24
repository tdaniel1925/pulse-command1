import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function FooterBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <footer style={{ background: 'var(--fg,#2A2018)', color: 'var(--bg,#FBF6EF)', padding: '60px 0 32px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 40, paddingBottom: 44, borderBottom: '1px solid rgba(255,255,255,.14)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 21, marginBottom: 14 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent,#E0603A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg,#fff)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 6 6 .9-4.5 4.3L17.8 20 12 16.8 6.2 20l1.3-6.8L3 8.9 9 8z" /></svg></span>
              {content.brandName}
            </div>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 15, lineHeight: 1.6, opacity: 0.7, margin: 0, maxWidth: '24em' }}>The AI landing page builder for everyone. Describe it, drop in photos, publish.</p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 14, marginBottom: 14, opacity: 0.95 }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.7 }}><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Templates</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</a></div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 14, marginBottom: 14, opacity: 0.95 }}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.7 }}><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a></div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 14, marginBottom: 14, opacity: 0.95 }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.7 }}><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a></div>
          </div>
        </div>
        <div style={{ paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: '13.5px', opacity: 0.6 }}>
          <span>© 2026 {content.brandName} Labs, Inc. All rights reserved.</span>
          <span>Made with {content.brandName}</span>
        </div>
      </div>
    </footer>
  )
}
