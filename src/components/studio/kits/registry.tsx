import type { ComponentType } from 'react'
import type { KitContent } from '@/lib/studio/kit-schema'
import type { ThemeProps } from '@/lib/studio/theme'
import { AtlasKit } from './AtlasKit'
import { PhotoGridKit } from './PhotoGridKit'

export type KitId = 'atlas' | 'photo-grid'

export interface KitMeta {
  id: KitId
  name: string
  description: string
  Component: ComponentType<{ content: KitContent; theme: ThemeProps }>
}

/**
 * Single source of truth for available kits. The picker, generate, save, publish,
 * and the public /p/[slug] renderer all resolve kits through here so adding a kit
 * is one entry. (Halo in the source was an Atlas variant, so the two distinct
 * designs are Atlas — a full landing page — and Photo Grid — an image bento.)
 */
export const KITS: Record<KitId, KitMeta> = {
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    description: 'A complete, polished landing page — hero, features, pricing, FAQ and more.',
    Component: AtlasKit,
  },
  'photo-grid': {
    id: 'photo-grid',
    name: 'Photo Grid',
    description: 'An image-forward bento grid — ideal for portfolios and visual brands.',
    Component: PhotoGridKit,
  },
}

export const KIT_LIST: KitMeta[] = Object.values(KITS)
export const DEFAULT_KIT: KitId = 'atlas'

/** Resolve a kit id to its component, falling back to the default. */
export function resolveKit(id: string | null | undefined): KitMeta {
  return (id && KITS[id as KitId]) || KITS[DEFAULT_KIT]
}
