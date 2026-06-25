import { Slot } from '@/components/studio/Slot'
import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function TeamBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 80px) 0', background: 'var(--surface-2,#F6EEE3)' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
          <span style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent,#E0603A)' }}>11 / Team</span>
          <span style={{ height: 1, flex: 1, background: 'var(--border,#EADFD2)' }}></span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display,'Sora'),sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 36px' }}>{content.team?.heading ?? 'The people behind Halo'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 24 }}>
          {content.team ? content.team.members.map((m, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <Slot variant="circle" src={null} placeholder="Photo" style={{ width: '100%', aspectRatio: '1', display: 'block', borderRadius: '50%', marginBottom: 16 }} />
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 700, fontSize: 17 }}>{m.name}</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: 14, color: 'var(--muted,#8A7B6B)' }}>{m.role}</div>
            </div>
          )) : (<>
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
          </>)}
        </div>
      </div>
    </section>
  )
}
