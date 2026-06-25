import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

const featuresHeader = (content: KitContent) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
      <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>04 / Features</span>
      <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
    </div>
    <div style={{ maxWidth: '34em', marginBottom: 44 }}>
      <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 14px' }}>{content.features.heading}</h2>
      <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{content.features.subhead ?? 'A complete toolkit of polished blocks that adapt to your content and your brand automatically.'}</p>
    </div>
  </>
)

const FEATURE_FALLBACKS = [
  { title: 'Instant layout', body: 'Type a prompt and watch a full, balanced page assemble in seconds.' },
  { title: 'Drop in photos', body: 'Drag any image onto a slot — it crops, frames and formats itself.' },
  { title: 'One-click themes', body: 'Switch colors, fonts and shapes across the whole page at once.' },
  { title: 'Looks great anywhere', body: 'Every block is responsive out of the box — phone, tablet, desktop.' },
  { title: 'Built-in analytics', body: 'See visits, clicks and signups without touching another tool.' },
  { title: 'Secure & fast', body: 'Free SSL, a global CDN and 99.9% uptime come standard.' },
]

export function FeaturesBlock({ content, variant }: { content: KitContent; theme: ThemeProps; variant?: string }) {
  const features = content.features.items
  const f = (i: number, fallback: { title: string; body: string }) => features[i] ?? fallback

  if (variant === 'zigzag') {
    const rows = FEATURE_FALLBACKS.slice(0, 4)
    return (
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
        <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          {featuresHeader(content)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--pad-scale,1) * 64px)' }}>
            {rows.map((fb, i) => {
              const item = f(i, fb)
              const reversed = i % 2 === 1
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 56, alignItems: 'center' }}>
                  <div style={{ order: reversed ? 2 : 1, borderRadius: 'var(--img-radius,16px)', overflow: 'hidden', boxShadow: 'var(--img-shadow,0 14px 38px rgba(90,55,30,.10))', border: 'var(--img-border,none)', filter: 'var(--img-filter,none)' }}>
                    <Slot variant="rect" shape="4/3" src={null} placeholder="Drop a photo or video" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div style={{ order: reversed ? 1 : 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', marginBottom: 18, fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 18, color: 'var(--accent,#E0603A)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 'clamp(22px,2.6vw,30px)', letterSpacing: '-.02em', margin: '0 0 12px', lineHeight: 1.1 }}>{item.title}</h3>
                    <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 17, lineHeight: 1.65, color: 'var(--muted,#8A7B6B)', margin: 0, maxWidth: '32em' }}>{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'list') {
    const items = FEATURE_FALLBACKS
    return (
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
        <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          {featuresHeader(content)}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', columnGap: 48, rowGap: 28 }}>
            {items.map((fb, i) => {
              const item = f(i, fb)
              return (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ flex: 'none', width: 28, height: 28, marginTop: 2, borderRadius: '50%', background: 'var(--accent,#E0603A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow,0 6px 16px rgba(90,55,30,.10))' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg,#fff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 19, margin: '0 0 5px', letterSpacing: '-.01em' }}>{item.title}</h3>
                    <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Default: cards layout (original Atlas features).
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>04 / Features</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <div style={{ maxWidth: '34em', marginBottom: 44 }}>
          <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 14px' }}>{content.features.heading}</h2>
          <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{content.features.subhead ?? 'A complete toolkit of polished blocks that adapt to your content and your brand automatically.'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>{f(0, { title: 'Instant layout', body: '' }).title}</h3>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{f(0, { title: '', body: 'Type a prompt and watch a full, balanced page assemble in seconds.' }).body}</p>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>{f(1, { title: 'Drop in photos', body: '' }).title}</h3>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{f(1, { title: '', body: 'Drag any image onto a slot — it crops, frames and formats itself.' }).body}</p>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="12.5" r="2.5" /><circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="13.5" r="2.5" /><path d="M12 22a10 10 0 1 1 10-10c0 2-1 3-3 3h-2a2 2 0 0 0-1 4 1 1 0 0 1-1 3z" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>{f(2, { title: 'One-click themes', body: '' }).title}</h3>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{f(2, { title: '', body: 'Switch colors, fonts and shapes across the whole page at once.' }).body}</p>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>Looks great anywhere</h3>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>Every block is responsive out of the box — phone, tablet, desktop.</p>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>Built-in analytics</h3>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>See visits, clicks and signups without touching another tool.</p>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>Secure &amp; fast</h3>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>Free SSL, a global CDN and 99.9% uptime come standard.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
