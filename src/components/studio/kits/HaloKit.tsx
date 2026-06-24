import type { CSSProperties } from 'react'
import { Slot } from '@/components/studio/Slot'
import { tokenStyle, type ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

/**
 * Halo kit — a byte-exact port of reference/kits/halo.dc.html.
 *
 * The Halo source is a studio editor shell whose canvas renders the imported
 * "Atlas Landing Kit". Per the port rules, all editor chrome (the Halo Studio
 * top bar, design panel, device toggles, browser-frame mock and KIT RIBBON) is
 * removed — only the actual page content remains, which is the imported kit's
 * 14 design sections, reproduced in order.
 *
 * Every inline style string is copied verbatim and converted to a React style
 * object (camelCase keys, identical string values). Text that maps to KitContent
 * is wired to props; sections without a schema yet (logos, stats, gallery,
 * pricing, FAQ, team, newsletter) keep the original hardcoded copy exactly.
 * SSR-safe and presentational.
 */

export function HaloKit({ content, theme }: { content: KitContent; theme: ThemeProps }) {
  const root: CSSProperties = {
    ...tokenStyle(theme),
    width: '100%',
    background: 'var(--bg,#FBF6EF)',
    color: 'var(--fg,#2A2018)',
    fontFamily: "var(--font-body,'Manrope'),system-ui,sans-serif",
    minHeight: '100vh',
    WebkitFontSmoothing: 'antialiased',
  }

  const features = content.features.items
  const f = (i: number, fallback: { title: string; body: string }) => features[i] ?? fallback
  const testimonials = content.testimonials.items
  const t = (i: number, fallback: { quote: string; author: string }) => testimonials[i] ?? fallback

  return (
    <div style={root}>

      {/* 01 — HEADER / NAV */}
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

      {/* 02 — HERO */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 88px) 0 calc(var(--pad-scale,1) * 64px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>01 / Hero</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 48, alignItems: 'stretch' }}>
            <div style={{ alignSelf: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: 'var(--surface-2,#F6EEE3)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 600, fontSize: 13, color: 'var(--muted,#8A7B6B)', marginBottom: 22 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent,#E0603A)' }}></span> {content.hero.eyebrow ?? 'New — AI page builder is live'}
              </span>
              <h1 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(40px,5.4vw,64px)', lineHeight: 1.02, letterSpacing: '-.03em', margin: '0 0 22px' }}>{content.hero.headline}</h1>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 19, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: '0 0 32px', maxWidth: '30em' }}>{content.hero.subhead}</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', borderRadius: 'var(--btn-radius,12px)', boxShadow: 'var(--btn-shadow,none)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 17, textDecoration: 'none', transition: 'transform .15s ease' }}>{content.hero.ctaPrimary} →</a>
                <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '16px 26px', background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 600, fontSize: 17, textDecoration: 'none' }}>▶ {content.hero.ctaSecondary ?? 'Watch demo'}</a>
              </div>
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 14, color: 'var(--muted,#8A7B6B)' }}>
                <div style={{ display: 'flex' }}>
                  <Slot variant="circle" src={null} placeholder="" style={{ width: 34, height: 34, display: 'block', border: '2px solid var(--surface,#fff)', borderRadius: '50%' }} />
                  <Slot variant="circle" src={null} placeholder="" style={{ width: 34, height: 34, display: 'block', border: '2px solid var(--surface,#fff)', borderRadius: '50%', marginLeft: -12 }} />
                  <Slot variant="circle" src={null} placeholder="" style={{ width: 34, height: 34, display: 'block', border: '2px solid var(--surface,#fff)', borderRadius: '50%', marginLeft: -12 }} />
                </div>
                Loved by 12,000+ builders
              </div>
            </div>
            <div style={{ borderRadius: 'var(--img-radius,16px)', overflow: 'hidden', boxShadow: 'var(--img-shadow,0 14px 38px rgba(90,55,30,.10))', border: 'var(--img-border,none)', filter: 'var(--img-filter,none)', display: 'flex', minHeight: 480 }}>
              <Slot variant="rect" src={content.hero.image.src} alt={content.hero.image.alt} placeholder="Drop a photo or video" style={{ width: '100%', height: '100%', minHeight: 480, display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 03 — LOGO / SOCIAL PROOF */}
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

      {/* 04 — FEATURE GRID */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>04 / Features</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <div style={{ maxWidth: '34em', marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 14px' }}>{content.features.heading}</h2>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{content.features.subhead ?? 'A complete toolkit of polished blocks that adapt to your content and your brand automatically.'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></svg></span>
              <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>{f(0, { title: 'Instant layout', body: '' }).title}</h3>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{f(0, { title: '', body: 'Type a prompt and watch a full, balanced page assemble in seconds.' }).body}</p>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg></span>
              <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>{f(1, { title: 'Drop in photos', body: '' }).title}</h3>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{f(1, { title: '', body: 'Drag any image onto a slot — it crops, frames and formats itself.' }).body}</p>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="12.5" r="2.5" /><circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="13.5" r="2.5" /><path d="M12 22a10 10 0 1 1 10-10c0 2-1 3-3 3h-2a2 2 0 0 0-1 4 1 1 0 0 1-1 3z" /></svg></span>
              <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>{f(2, { title: 'One-click themes', body: '' }).title}</h3>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>{f(2, { title: '', body: 'Switch colors, fonts and shapes across the whole page at once.' }).body}</p>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></svg></span>
              <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>Looks great anywhere</h3>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>Every block is responsive out of the box — phone, tablet, desktop.</p>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg></span>
              <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>Built-in analytics</h3>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>See visits, clicks and signups without touching another tool.</p>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 28, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--surface-2,#F6EEE3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#E0603A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg></span>
              <h3 style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 20, margin: '0 0 8px', letterSpacing: '-.01em' }}>Secure &amp; fast</h3>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '15.5px', lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>Free SSL, a global CDN and 99.9% uptime come standard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 05 — STATS */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 30px) 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ background: 'var(--fg,#2A2018)', color: 'var(--bg,#FBF6EF)', borderRadius: 'var(--radius,16px)', padding: '46px 40px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 'clamp(34px,4vw,48px)', letterSpacing: '-.02em', color: 'var(--accent-2,#E7A14C)' }}>12k+</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.75, marginTop: 4 }}>Pages published</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 'clamp(34px,4vw,48px)', letterSpacing: '-.02em', color: 'var(--accent-2,#E7A14C)' }}>4 min</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.75, marginTop: 4 }}>Avg. time to launch</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 'clamp(34px,4vw,48px)', letterSpacing: '-.02em', color: 'var(--accent-2,#E7A14C)' }}>99.9%</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.75, marginTop: 4 }}>Uptime</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 'clamp(34px,4vw,48px)', letterSpacing: '-.02em', color: 'var(--accent-2,#E7A14C)' }}>4.9/5</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.75, marginTop: 4 }}>Customer rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — IMAGE SHOWCASE (split) */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
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

      {/* 07 — GALLERY (bento) */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
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

      {/* 08 — TESTIMONIALS */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>08 / Testimonials</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 36px' }}>{content.testimonials.heading ?? 'People love building with Halo'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 30, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <div style={{ color: 'var(--accent-2,#E7A14C)', fontSize: 18, letterSpacing: '2px', marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '16.5px', lineHeight: 1.6, margin: '0 0 22px' }}>“{t(0, { quote: "I launched my bakery's site over lunch. Dropped in my photos and it just looked right.", author: '' }).quote}”</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Slot variant="circle" src={null} placeholder="" style={{ width: 46, height: 46, display: 'block', borderRadius: '50%' }} />
                <div><div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 15 }}>{t(0, { quote: '', author: 'Maya Okafor' }).author}</div><div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '13.5px', color: 'var(--muted,#8A7B6B)' }}>Owner, Rye &amp; Co.</div></div>
              </div>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 30, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <div style={{ color: 'var(--accent-2,#E7A14C)', fontSize: 18, letterSpacing: '2px', marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '16.5px', lineHeight: 1.6, margin: '0 0 22px' }}>“{t(1, { quote: 'We tried three other builders. Halo was the only one our whole team could actually use.', author: '' }).quote}”</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Slot variant="circle" src={null} placeholder="" style={{ width: 46, height: 46, display: 'block', borderRadius: '50%' }} />
                <div><div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 15 }}>{t(1, { quote: '', author: 'Daniel Reyes' }).author}</div><div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '13.5px', color: 'var(--muted,#8A7B6B)' }}>Founder, Northwind</div></div>
              </div>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 30, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
              <div style={{ color: 'var(--accent-2,#E7A14C)', fontSize: 18, letterSpacing: '2px', marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '16.5px', lineHeight: 1.6, margin: '0 0 22px' }}>“{t(2, { quote: 'Switching themes is addictive. One click and the whole page feels like a different brand.', author: '' }).quote}”</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Slot variant="circle" src={null} placeholder="" style={{ width: 46, height: 46, display: 'block', borderRadius: '50%' }} />
                <div><div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 15 }}>{t(2, { quote: '', author: 'Priya Nair' }).author}</div><div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '13.5px', color: 'var(--muted,#8A7B6B)' }}>Designer, Studio Mint</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — PRICING */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>09 / Pricing</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <div style={{ textAlign: 'center', maxWidth: '34em', margin: '0 auto 44px' }}>
            <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 12px' }}>Simple, honest pricing</h2>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 18, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: 0 }}>Start free. Upgrade when you&apos;re ready to go live.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, alignItems: 'start' }}>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 32 }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>Starter</div>
              <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>$0</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>per month, free forever</div>
              <a href="#" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>Get started</a>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
                <li>1 published page</li><li>Halo subdomain</li><li>Drag-and-drop images</li><li>Community support</li>
              </ul>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: '2px solid var(--accent,#E0603A)', borderRadius: 'var(--radius,16px)', padding: 32, boxShadow: 'var(--shadow,0 20px 50px rgba(90,55,30,.14))', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent,#E0603A)', color: 'var(--accent-fg,#fff)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999 }}>Most popular</span>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>Pro</div>
              <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>$19</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>per month, billed yearly</div>
              <a href="#" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'var(--btn-bg,#E0603A)', color: 'var(--btn-fg,#fff)', border: '2px solid var(--btn-border,transparent)', boxShadow: 'var(--btn-shadow,none)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>Start free trial</a>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
                <li>Unlimited pages</li><li>Custom domain</li><li>Image filters &amp; frames</li><li>Built-in analytics</li><li>Remove Halo badge</li>
              </ul>
            </div>
            <div style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 32 }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 18 }}>Scale</div>
              <div style={{ margin: '14px 0 6px', fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 46, letterSpacing: '-.03em' }}>$49</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", color: 'var(--muted,#8A7B6B)', fontSize: '14.5px', marginBottom: 22 }}>per month, billed yearly</div>
              <a href="#" style={{ display: 'block', textAlign: 'center', padding: 13, background: 'transparent', color: 'var(--fg)', border: '2px solid var(--border,#EADFD2)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 24 }}>Contact sales</a>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "var(--font-body,'Manrope')", fontSize: 15, color: 'var(--muted,#8A7B6B)' }}>
                <li>Everything in Pro</li><li>Team workspaces</li><li>A/B testing</li><li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10 — FAQ */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>10 / FAQ</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 30px', textAlign: 'center' }}>Questions, answered</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <details style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: '20px 24px' }} open>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: '17.5px' }}>Do I need to know how to code?<span style={{ color: 'var(--accent,#E0603A)', fontSize: 22, fontWeight: 400 }}>＋</span></summary>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: '14px 0 0' }}>Not at all. You describe what you want in plain words, drop in your photos, and Halo handles the design for you.</p>
            </details>
            <details style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: '20px 24px' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: '17.5px' }}>Can I use my own photos?<span style={{ color: 'var(--accent,#E0603A)', fontSize: 22, fontWeight: 400 }}>＋</span></summary>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: '14px 0 0' }}>Yes — just drag any image onto a slot. Halo crops, frames and optimizes it to fit the layout perfectly.</p>
            </details>
            <details style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: '20px 24px' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: '17.5px' }}>Can I connect a custom domain?<span style={{ color: 'var(--accent,#E0603A)', fontSize: 22, fontWeight: 400 }}>＋</span></summary>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: '14px 0 0' }}>On the Pro plan and above you can connect any domain you own in a couple of clicks, with free SSL included.</p>
            </details>
            <details style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: '20px 24px' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: '17.5px' }}>What if I want to change the look later?<span style={{ color: 'var(--accent,#E0603A)', fontSize: 22, fontWeight: 400 }}>＋</span></summary>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: '14px 0 0' }}>Switch themes any time. Colors, fonts and shapes update across your whole page instantly — your content stays put.</p>
            </details>
          </div>
        </div>
      </section>

      {/* 11 — TEAM */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
            <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>11 / Team</span>
            <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 36px' }}>The people behind Halo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Slot variant="circle" src={null} placeholder="Photo" style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '50%', marginBottom: 16 }} />
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 17 }}>Sofia Lindqvist</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 14, color: 'var(--muted,#8A7B6B)' }}>CEO &amp; Co-founder</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Slot variant="circle" src={null} placeholder="Photo" style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '50%', marginBottom: 16 }} />
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 17 }}>Marcus Bell</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 14, color: 'var(--muted,#8A7B6B)' }}>Head of Design</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Slot variant="circle" src={null} placeholder="Photo" style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '50%', marginBottom: 16 }} />
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 17 }}>Aisha Rahman</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 14, color: 'var(--muted,#8A7B6B)' }}>Engineering Lead</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Slot variant="circle" src={null} placeholder="Photo" style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '50%', marginBottom: 16 }} />
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 17 }}>Tom Becker</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 14, color: 'var(--muted,#8A7B6B)' }}>Head of Growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 — NEWSLETTER */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 60px) 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
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

      {/* 13 — CTA BAND */}
      <section style={{ padding: 'calc(var(--pad-scale,1) * 40px) 0 calc(var(--pad-scale,1) * 80px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ background: 'var(--accent,#E0603A)', borderRadius: 'var(--radius,16px)', padding: '64px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 40, alignItems: 'center', overflow: 'hidden' }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.04, letterSpacing: '-.02em', margin: '0 0 16px', color: 'var(--accent-fg,#fff)' }}>{content.cta.headline}</h2>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 19, lineHeight: 1.55, margin: '0 0 28px', color: 'var(--accent-fg,#fff)', opacity: 0.92 }}>{content.cta.subhead ?? 'Join 12,000+ builders. Your first page is free — no card required.'}</p>
              <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 30px', background: 'var(--accent-fg,#fff)', color: 'var(--accent,#E0603A)', borderRadius: 'var(--btn-radius,12px)', fontFamily: "var(--font-body,'Manrope')", fontWeight: 800, fontSize: 17, textDecoration: 'none', transition: 'transform .15s ease' }}>{content.cta.button} →</a>
            </div>
            <div style={{ borderRadius: 'var(--img-radius,16px)', overflow: 'hidden', border: 'var(--img-border,none)', filter: 'var(--img-filter,none)', boxShadow: '0 20px 50px rgba(0,0,0,.2)' }}>
              <Slot variant="rect" src={null} placeholder="Drop a photo or video" style={{ width: '100%', aspectRatio: '4/3', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 14 — FOOTER */}
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

    </div>
  )
}
