import type { CSSProperties } from 'react'
import { tokenStyle, type ThemeProps } from '@/lib/studio/theme'
import type { KitContent } from '@/lib/studio/kit-schema'
import { HeaderBlock } from '@/components/studio/blocks/HeaderBlock'
import { HeroBlock } from '@/components/studio/blocks/HeroBlock'
import { SocialProofBlock } from '@/components/studio/blocks/SocialProofBlock'
import { FeaturesBlock } from '@/components/studio/blocks/FeaturesBlock'
import { StatsBlock } from '@/components/studio/blocks/StatsBlock'
import { ShowcaseBlock } from '@/components/studio/blocks/ShowcaseBlock'
import { GalleryBlock } from '@/components/studio/blocks/GalleryBlock'
import { TestimonialsBlock } from '@/components/studio/blocks/TestimonialsBlock'
import { PricingBlock } from '@/components/studio/blocks/PricingBlock'
import { FaqBlock } from '@/components/studio/blocks/FaqBlock'
import { TeamBlock } from '@/components/studio/blocks/TeamBlock'
import { NewsletterBlock } from '@/components/studio/blocks/NewsletterBlock'
import { CtaBlock } from '@/components/studio/blocks/CtaBlock'
import { FooterBlock } from '@/components/studio/blocks/FooterBlock'

/**
 * Atlas kit — a byte-exact port of reference/kits/atlas.dc.html.
 *
 * The 14 design sections are now standalone BLOCK components in
 * src/components/studio/blocks. AtlasKit composes them in original order inside
 * the root token wrapper, which applies the theme tokens once at the page root.
 * Visual output is identical to the previous monolithic implementation.
 */

export function AtlasKit({ content, theme }: { content: KitContent; theme: ThemeProps }) {
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
    <div style={root}>
      <HeaderBlock content={content} theme={theme} />
      <HeroBlock content={content} theme={theme} />
      <SocialProofBlock content={content} theme={theme} />
      <FeaturesBlock content={content} theme={theme} />
      <StatsBlock content={content} theme={theme} />
      <ShowcaseBlock content={content} theme={theme} />
      <GalleryBlock content={content} theme={theme} />
      <TestimonialsBlock content={content} theme={theme} />
      <PricingBlock content={content} theme={theme} />
      <FaqBlock content={content} theme={theme} />
      <TeamBlock content={content} theme={theme} />
      <NewsletterBlock content={content} theme={theme} />
      <CtaBlock content={content} theme={theme} />
      <FooterBlock content={content} theme={theme} />
    </div>
  )
}
