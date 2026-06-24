import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function FaqBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>10 / FAQ</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 30px', textAlign: 'center' }}>{content.faq?.heading ?? 'Questions, answered'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {content.faq ? content.faq.items.map((item, i) => (
            <details key={i} style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: '20px 24px' }} open={i === 0}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: '17.5px' }}>{item.q}<span style={{ color: 'var(--accent,#E0603A)', fontSize: 22, fontWeight: 400 }}>＋</span></summary>
              <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 16, lineHeight: 1.6, color: 'var(--muted,#8A7B6B)', margin: '14px 0 0' }}>{item.a}</p>
            </details>
          )) : (<>
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
          </>)}
        </div>
      </div>
    </section>
  )
}
