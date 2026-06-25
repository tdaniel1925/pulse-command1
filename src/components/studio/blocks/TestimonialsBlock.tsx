import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function TestimonialsBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  const testimonials = content.testimonials.items
  const t = (i: number, fallback: { quote: string; author: string }) => testimonials[i] ?? fallback
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>08 / Testimonials</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 36px' }}>{content.testimonials.heading ?? 'People love building with Halo'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 30, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <div style={{ color: 'var(--accent-2,#E7A14C)', fontSize: 18, letterSpacing: '2px', marginBottom: 14 }}>★★★★★</div>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '16.5px', lineHeight: 1.6, margin: '0 0 22px' }}>“{t(0, { quote: "I launched my bakery's site over lunch. Dropped in my photos and it just looked right.", author: '' }).quote}”</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Slot variant="circle" src={null} placeholder="" style={{ width: 46, height: 46, display: 'block', borderRadius: '50%' }} />
              <div><div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 15 }}>{t(0, { quote: '', author: 'Maya Okafor' }).author}</div><div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '13.5px', color: 'var(--muted,#8A7B6B)' }}>Owner, Rye &amp; Co.</div></div>
            </div>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 30, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
            <div style={{ color: 'var(--accent-2,#E7A14C)', fontSize: 18, letterSpacing: '2px', marginBottom: 14 }}>★★★★★</div>
            <p style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '16.5px', lineHeight: 1.6, margin: '0 0 22px' }}>“{t(1, { quote: 'We tried three other builders. Halo was the only one our whole team could actually use.', author: '' }).quote}”</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Slot variant="circle" src={null} placeholder="" style={{ width: 46, height: 46, display: 'block', borderRadius: '50%' }} />
              <div><div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 15 }}>{t(1, { quote: '', author: 'Daniel Reyes' }).author}</div><div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '13.5px', color: 'var(--muted,#8A7B6B)' }}>Founder, Northwind</div></div>
            </div>
          </div>
          <div className="sx-lift" style={{ background: 'var(--surface,#fff)', border: 'var(--border-w,1px) solid var(--border,#EADFD2)', borderRadius: 'var(--radius,16px)', padding: 30, boxShadow: 'var(--shadow,0 14px 38px rgba(90,55,30,.06))' }}>
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
  )
}
