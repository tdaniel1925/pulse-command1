import type { CSSProperties } from 'react'
import { tokenStyle, type ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'
import { BLOCKS, normalizeLayout, type BlockType } from './blocks/registry'

/**
 * The living canvas. A page is an ordered list of blocks (its `layout`), rendered
 * inside one token-style root. The layout is normalized first, so whatever order
 * is passed in, the result is always a valid, coherent page — header first, footer
 * last, no duplicates, no unknown blocks. Each block also falls back to its own
 * on-brand copy when its content is absent. Together: it can't break.
 *
 * This single renderer powers both the editor preview and the published page, so
 * what you see is exactly what publishes.
 */
export function CanvasPage({
  content,
  theme,
  layout,
  variants,
}: {
  content: KitContent
  theme: ThemeProps
  layout: BlockType[] | unknown
  /** Optional per-block variant id, e.g. { hero: "centered" }. */
  variants?: Record<string, string> | null
}) {
  const blocks = normalizeLayout(layout)
  const v = variants ?? {}

  const root: CSSProperties = {
    ...tokenStyle(theme),
    width: '100%',
    background: 'var(--bg,#FBF6EF)',
    color: 'var(--fg,#2A2018)',
    fontFamily: "var(--font-body,'Manrope'),system-ui,sans-serif",
    minHeight: '100vh',
    WebkitFontSmoothing: 'antialiased',
  }

  return (
    <div className="sx-root" style={root}>
      <CanvasStyles />
      {blocks.map((type, i) => {
        const Block = BLOCKS[type].Component
        return <Block key={`${type}-${i}`} content={content} theme={theme} variant={v[type]} />
      })}
    </div>
  )
}

/**
 * Premium polish layer — injected once per page. Inline styles can't do :hover or
 * keyframes, so the motion/depth lives here as real CSS classes the blocks opt into
 * (.sx-lift, .sx-btn, .sx-reveal, .sx-grad). Scroll-reveal is progressive
 * enhancement: a tiny IntersectionObserver reveals sections; with no JS they're
 * simply visible. SSR-safe — no client hooks needed.
 */
function CanvasStyles() {
  const css = `
.sx-root *{box-sizing:border-box}
/* Buttons + cards: smooth lift on hover */
.sx-btn{transition:transform .18s cubic-bezier(.2,.7,.3,1),box-shadow .18s ease,filter .18s ease;will-change:transform}
.sx-btn:hover{transform:translateY(-2px);filter:brightness(1.03)}
.sx-lift{transition:transform .25s cubic-bezier(.2,.7,.3,1),box-shadow .25s ease}
.sx-lift:hover{transform:translateY(-4px);box-shadow:var(--hover-shadow,0 22px 60px rgba(0,0,0,.12))}
.sx-link{transition:opacity .15s ease,color .15s ease}
.sx-link:hover{opacity:1;color:var(--accent)}
/* Scroll reveal */
.sx-reveal{opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.2,.7,.3,1),transform .6s cubic-bezier(.2,.7,.3,1)}
.sx-reveal.sx-in{opacity:1;transform:none}
@media (prefers-reduced-motion: reduce){.sx-reveal{opacity:1;transform:none;transition:none}.sx-btn,.sx-lift{transition:none}}
/* Subtle grain texture overlay for accent bands */
.sx-grain{position:relative;isolation:isolate}
.sx-grain::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")}
`.trim()
  const reveal = `(function(){try{var els=document.querySelectorAll('.sx-reveal');if(!('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('sx-in')});return}var o=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('sx-in');o.unobserve(x.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});els.forEach(function(e){o.observe(e)})}catch(e){document.querySelectorAll('.sx-reveal').forEach(function(x){x.classList.add('sx-in')})}})();`
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script dangerouslySetInnerHTML={{ __html: reveal }} />
    </>
  )
}
