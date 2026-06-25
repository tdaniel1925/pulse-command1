import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function PricingBlock({ content, variant }: { content: KitContent; theme: ThemeProps; variant?: string }) {
  if (variant === 'scaled' && content.pricing) {
    return (
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
        <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>09 / Pricing</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <div style={{ textAlign: 'center', maxWidth: '34em', margin: '0 auto 56px' }}>
            <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 12px' }}>{content.pricing.heading ?? 'Simple, honest pricing'}</h2>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{content.pricing.subhead ?? <>Start free. Upgrade when you&apos;re ready to go live.</>}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24, alignItems: 'center' }}>
            {content.pricing.tiers.map((tier, i) => (
              <div key={i} className="sx-lift" style={tier.highlighted
                ? { background: 'var(--surface,#fff)', border: '2px solid var(--accent,#E0603A)', borderRadius: 'var(--radius,16px)', padding: 36, boxShadow: 'var(--shadow,0 28px 64px rgba(90,55,30,.20))', position: 'relative', transform: 'scale(1.06) translateY(-6px)', zIndex: 1 }
                : { background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, opacity: 0.92, transform: 'scale(0.97)' }}>
                {tier.highlighted && <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--grad-accent,var(--accent,#E0603A))', color: 'var(--accent-fg,#fff)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999 }}>Most popular</span>}
                <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>{tier.name}</div>
                <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>{tier.price}</div>
                <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>{tier.blurb ?? 'per month'}</div>
                <a href="#" className="sx-btn" style={tier.highlighted
                  ? { display: 'block', textAlign: 'center', padding: 13, background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', boxShadow: 'var(--btn-shadow,none)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }
                  : { display: 'block', textAlign: 'center', padding: 13, background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>{tier.cta}</a>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
                  {tier.features.map((ft, j) => <li key={j}>{ft}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>09 / Pricing</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <div style={{ textAlign: 'center', maxWidth: '34em', margin: '0 auto 44px' }}>
          <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 12px' }}>{content.pricing?.heading ?? 'Simple, honest pricing'}</h2>
          <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{content.pricing?.subhead ?? <>Start free. Upgrade when you&apos;re ready to go live.</>}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, alignItems: 'start' }}>
          {content.pricing ? content.pricing.tiers.map((tier, i) => (
            <div key={i} className="sx-lift" style={tier.highlighted
              ? { background: 'var(--surface,#fff)', border: '2px solid var(--accent,#E0603A)', borderRadius: 'var(--radius,16px)', padding: 32, boxShadow: 'var(--shadow,0 20px 50px rgba(90,55,30,.14))', position: 'relative' }
              : { background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 32 }}>
              {tier.highlighted && <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent,#E0603A)', color: 'var(--accent-fg,#fff)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999 }}>Most popular</span>}
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>{tier.name}</div>
              <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>{tier.price}</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>{tier.blurb ?? 'per month'}</div>
              <a href="#" className="sx-btn" style={tier.highlighted
                ? { display: 'block', textAlign: 'center', padding: 13, background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', boxShadow: 'var(--btn-shadow,none)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }
                : { display: 'block', textAlign: 'center', padding: 13, background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>{tier.cta}</a>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
                {tier.features.map((ft, j) => <li key={j}>{ft}</li>)}
              </ul>
            </div>
          )) : (<>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 32 }}>
            <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>Starter</div>
            <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>$0</div>
            <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>per month, free forever</div>
            <a href="#" className="sx-btn" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>Get started</a>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
              <li>1 published page</li><li>Halo subdomain</li><li>Drag-and-drop images</li><li>Community support</li>
            </ul>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: '2px solid var(--accent,#E0603A)', borderRadius: 'var(--radius,16px)', padding: 32, boxShadow: 'var(--shadow,0 20px 50px rgba(90,55,30,.14))', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent,#E0603A)', color: 'var(--accent-fg,#fff)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999 }}>Most popular</span>
            <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>Pro</div>
            <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>$19</div>
            <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>per month, billed yearly</div>
            <a href="#" className="sx-btn" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', boxShadow: 'var(--btn-shadow,none)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>Start free trial</a>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
              <li>Unlimited pages</li><li>Custom domain</li><li>Image filters &amp; frames</li><li>Built-in analytics</li><li>Remove Halo badge</li>
            </ul>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 32 }}>
            <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>Scale</div>
            <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>$49</div>
            <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>per month, billed yearly</div>
            <a href="#" className="sx-btn" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>Contact sales</a>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
              <li>Everything in Pro</li><li>Team workspaces</li><li>A/B testing</li><li>Priority support</li>
            </ul>
          </div>
          </>)}
        </div>
      </div>
    </section>
  )
}
