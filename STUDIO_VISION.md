# Studio — the living-canvas vision

The page builder is a **generative canvas, not a template filler.** A page is
composed dynamically from a library of validated section-blocks; the design bible
(token engine + per-block constraints) guarantees the result is always good.

## Principles
- **Living / breathing** — AI composes the page by choosing WHICH blocks and their
  ORDER based on brand + goal + content. Photo-heavy brand → gallery-forward;
  service business → features/pricing-forward; no plans → no pricing block.
- **Complete creativity** — real variety across brands (theme moods + block choice +
  image treatment), not one fixed look.
- **Can never break** — whatever content/images flow in, spacing, type scale, color,
  and image fitting stay valid. Impossible to produce something ugly or broken.
- **Curated user control** — non-designers add/remove/reorder WHOLE blocks from a
  menu, swap content, pick theme moods. NO freeform drag/resize. Every action lands
  in a valid state.

## Build order (agreed)
1. **Kits first (in progress).** Port Atlas, Halo, Photo Grid byte-exact from the
   originals in `reference/kits/`. Each ported section becomes a reusable BLOCK.
2. **AI fill.** Schema covers all real sections; AI fills text + Gemini images.
3. **Canvas layer (next).** Promote the kit sections into a block library; AI
   composes pages by selecting + ordering blocks; curated add/remove/reorder UI.

## Why kits → canvas (not throwaway)
The faithfully-ported kit sections ARE the seed block library. Atlas's hero,
feature grid, stats, gallery, testimonials, pricing, FAQ, team, CTA become the
first validated blocks the canvas composes from. Finishing the kits exactly is
literally step one of the canvas.

## Non-negotiable: exactness
The reference is `reference/kits/*.dc.html` — byte-exact. Never reinterpret the
designer's markup; only turn text/images into props.
