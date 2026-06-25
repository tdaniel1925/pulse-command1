import type { ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'

export function StatsBlock({ content }: { content: KitContent; theme: ThemeProps }) {
  return (
    <section style={{ padding: 'calc(var(--pad-scale,1) * 30px) 0' }}>
      <div className="sx-reveal" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px' }}>
        <div className="sx-grain" style={{ background: 'var(--fg,#2A2018)', color: 'var(--bg,#FBF6EF)', borderRadius: 'var(--radius,16px)', padding: '46px 40px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {content.stats ? content.stats.map((st, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "var(--font-display,'Sora')", fontWeight: 800, fontSize: 'clamp(34px,4vw,48px)', letterSpacing: '-.02em', color: 'var(--accent-2,#E7A14C)' }}>{st.value}</div>
              <div style={{ fontFamily: "var(--font-body,'Manrope')", fontSize: '14.5px', opacity: 0.75, marginTop: 4 }}>{st.label}</div>
            </div>
          )) : (<>
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
          </>)}
        </div>
      </div>
    </section>
  )
}
