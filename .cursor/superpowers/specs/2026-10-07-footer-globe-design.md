# Contacts footer with cropped wireframe globe

**Status:** implemented 2026-10-07; owner requisites and scaled peek 2026-10-08

## Document purpose

This document is the implementation source of truth for turning the landing’s
terminal contacts block into a page `footer` with a cropped, slowly rotating
SVG wireframe globe.

The published page remains Russian-language. This specification is written
in English for the implementation team. Text in Russian quotation marks is
required production UI copy.

If this document conflicts with product-safety restrictions in
`.cursor/docs/brief.md`, the brief wins. Hero copy, CTA behavior, GLB
runtime, starfield, and Blender color management stay owned by their
existing specs.

## Context

- Brief §7.5 and the landing product spec used to describe contacts as a
  typical requisites block after the final CTA, inside `main`, with no form,
  map, or callback request. They now describe this `footer`.
- Evgeniy approved replacing that block with a footer whose composition
  follows [Contact with Globe on 21st.dev](https://21st.dev/@scrollxui/components/contact-with-globe),
  not a paste of that component.
- The reference’s rose badge, contact form, zinc/rose palette, shadcn,
  `motion`, lucide-react, Radix, and CDN `world-atlas` fetch are out of
  scope.
- The heading, lede, and owner-supplied requisites stay in the footer.
- The hero already owns the only WebGL globe. This footer globe is a
  separate SVG decoration.

## Goal

Close the page with an institutional footer: heading and lede on the left,
requisites on the right, and under both columns a wireframe globe that
peeks from the bottom the way the reference globe peeks above its form.
Keep the demo CTA as the only conversion action.

## Non-goals

- Do not add a contact form, lead capture, callback request, or map product
  control.
- Do not fetch `world-atlas` or any other decorative asset from a CDN.
- Do not add a second WebGL / React Three Fiber context.
- Do not install shadcn, `motion`, lucide-react, Radix, class-variance-authority,
  or `@radix-ui/react-slot` for this work.
- Do not copy the reference’s projection morph (`wireframe` variant),
  city-to-city rotation, solid country fills, or “Contact” pill.
- Do not reuse `BackgroundModelCanvas` or clip the hero GLB.
- Do not invent a real organization, address, or published legal identity.
- Do not change hero, `#data`, `#tools`, final CTA, or starfield behavior.

## Relationship to other specs

| Topic                                                                                               | Owner after this change                   |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Footer landmark, two-column layout, cropped SVG globe, local TopoJSON                               | this spec                                 |
| Required Russian copy for heading, lede, and four requisites; header nav label `Контакты`; demo CTA | landing product spec                      |
| Product claims, no remote decorative assets, no lead form                                           | `.cursor/docs/brief.md`                   |
| Hero GLB lighting, spin, AgX                                                                        | hero globe runtime + Blender parity specs |
| Page-wide stars                                                                                     | starfield spec                            |

Implementation must patch `.cursor/docs/brief.md` §7.5,
`.cursor/superpowers/specs/2026-10-02-landing-product-design.md` §5 /
landmarks / component tree, and `.cursor/skills/3d-landing/SKILL.md` so
they describe a `footer` with this decorative globe instead of a `main`
section that forbids any map. Those patches are part of this change, not a
later cleanup.

The landing product spec keeps owning the requisite strings. This
spec owns how they are laid out and that a cropped SVG globe may sit under
them. The brief still forbids a form and remote assets; it no longer
forbids this local decorative globe in the footer.

## Architecture

`src/app/page.tsx` stays a Server Component. Contacts leave `main`. The
footer is a sibling of `main` inside `.page-shell`:

```text
.page-shell#top
  .star-layer
  skip-link → #main-content
  SiteHeader
  main#main-content
    Hero, Spatial context, Tools, Final CTA
  SiteFooter#contacts
    .footer-copy (heading + lede)
    .footer-requisites (owner-supplied fields)
    FooterGlobe (cropped SVG band)
```

- `SiteFooter` is a Server Component at
  `src/components/landing/site-footer.tsx`.
  `src/components/landing/contacts-section.tsx` is gone.
- `FooterGlobe` is a Client Component at
  `src/components/landing/footer-globe.tsx`. Three.js stays out of it.
- Header nav `Контакты` continues to target `#contacts`. That id moves to
  the `footer`.
- The skip link still targets `#main-content`. The footer is after `main`
  in DOM order.
- Reuse `SectionHeading` for the footer `h2`. Do not add an eyebrow.

Allowed new npm packages: `d3-geo`, `d3-selection`, and `topojson-client`.
Do not add the `d3` meta-package, `topojson-specification`, or `world-atlas`.
Type the local topology in `footer-globe.tsx`.

Do not share refs, frame loops, or observers with `BackgroundModelCanvas`
or `StarField`. `FooterGlobe` may copy the existing `matchMedia` /
`document.hidden` patterns; it must not import globe runtime modules from
the hero.

### Data flow

- Copy and requisites: static `landing.contacts` in
  `src/content/landing.ts`. Phone and email rows may have several linked
  values with a non-linked parenthetical note. No runtime fetch for text.
- Country outlines: committed file `public/data/countries-110m.json`, the
  Natural Earth 110m countries topology as published by world-atlas 2.x.
  Vendor the JSON into the repo; do not depend on the `world-atlas` package
  at runtime. `FooterGlobe` loads it from `/data/countries-110m.json` on the
  same origin after mount.
- No other network requests from the footer.

### Error handling

- TopoJSON fetch or parse fails: leave the crop band empty at the specified
  height. Do not show an error, skeleton, or fallback map. Requisites remain.
- SVG cannot be drawn: same empty band.
- JavaScript disabled: footer copy and requisites remain; the globe band
  may be empty. That is acceptable.

## Layout and content

Required visible copy:

- Heading: `Контакты`
- Lede: `Реквизиты для связи по вопросам применения платформы.`
- Organization, address, phones, and emails: owned by the landing product
  spec. Phone and email `tel:` / `mailto:` links wrap only the number or
  address. Notes in parentheses are not links.

Two columns on wide viewports, one row:

- Left: heading + lede.
- Right: the four fields as a vertical list, not the old 2×2 cell grid.
  Organization and address are plain text. Phone and email rows may list
  several linked values. Phone and email rows include a 16px local stroke
  SVG (envelope, handset). No lucide. No map pin. Organization and address
  have no icon.

No rose/red pill, no “Get in touch” heading, no English supporting sentence,
no form, no submit button.

Below both columns, full content width: the globe crop band.

From `max-width: 760px` (same breakpoint as the current contacts stack):
heading, then requisites, then the globe band. No horizontal overflow at
390 px. Footer padding uses the existing `--gutter` / section rhythm.

Colors: `--frost`, `--muted`, `--cyan` on link hover, `--line`,
`--instrument` if a row needs a quiet plate. Do not use the reference’s
zinc, white card, or rose hover.

## Globe

Visual reference: the reference component’s `GlobeWireframe` with
`variant="wireframesolid"`, `strokeWidth={0.6}`, `autoRotate`, and the
`h-52` overflow window with a bottom fade. Implement only that look.

### Crop

- The crop window keeps a constant peek fraction of the globe, matched to
  a 1024px-wide viewport: wrap width 960px (`1024px` minus two 32px
  gutters) and the former `13rem` (208px) host, so host height is
  **13/60 of the column width** (`aspect-ratio: 60 / 13`).
- Do not use a fixed `13rem` host height. As the column grows or shrinks,
  the square SVG and the window scale together; the visible share of the
  sphere stays the same.
- `overflow: hidden`.
- The SVG globe is square and as wide as the host (`width: 100%`,
  `aspect-ratio: 1`, `position: absolute; top: 0; left: 0`). The host is
  shorter than that square, so only the upper portion of the sphere is
  visible.
- A non-interactive gradient covers the lower half of the host and fades to
  `--abyss` (`#05070b`), matching the page background so the sphere dissolves
  downward the way the reference dissolves into its section background.
- `pointer-events: none` on the globe host, SVG, and gradient. The globe
  does not capture clicks, drags, or hover.

### Projection and drawing

- Orthographic projection only (`d3.geoOrthographic`).
- Fill the sphere disk with `--abyss` (`#05070b`) so the page starfield
  does not show through the globe. Country paths stay unfilled strokes.
  No graticule.
- Stroke color is `currentColor` from `--frost`. Country paths use opacity
  `0.45`; the sphere outline uses opacity `0.8`. No rose hover fill.
- Do not implement `interpolateProjection`, `equirectangularRaw`, progress
  morph, `rotateCities`, or `rotateToLocation`.

### Motion

- Auto-rotate longitude by **0.1125 degrees per animation frame** — a
  quarter of the reference’s `autoRotateSpeed={0.45}`.
- No pointer drag, grab cursor, or mouse handlers on the globe.
- Do not put the globe in the tab order. No keyboard handler on the SVG.
- `prefers-reduced-motion: reduce`: draw one static frame at the initial
  rotation and attach no auto-rotate loop.
- Pause the loop when `document.hidden` is true or when the footer globe
  host is not intersecting the viewport (IntersectionObserver threshold
  0.1). Resume from the last rotation. Do not keep rAF running off-screen.
- Initial rotation is `[0, 0]`. Do not match the hero’s Siberia-facing
  first frame.

### Accessibility

- The globe host is `aria-hidden="true"`.
- The `footer` landmark is named by the visible `Контакты` heading
  (`aria-labelledby` on the footer).
- Requisites stay in `address` with a description list or equivalent
  readable grouping. Phone and email links keep a minimum 44px hit size.

## Testing

Verify in a browser, not only from a screenshot:

- Desktop: two columns, globe band under both, only the upper sphere
  visible, slow auto-rotation, no mouse response, starfield not visible
  through the disk, bottom fade into Abyss. Host height / host width is
  13/60 at 1024px, 1280px content, and 390px (same peek fraction).
- 390 px: stacked heading → requisites → globe band, no horizontal
  overflow, header `Контакты` still present. Anchor offset is the landing
  product spec `scroll-padding-top` (`5.5rem`; the header stays one row).
- Keyboard: phone and email links reachable; globe not focused.
- No-mouse: page readable; globe may rotate on its own.
- `prefers-reduced-motion: reduce`: static globe, no rAF rotate.
- Network: `/data/countries-110m.json` from the same origin only. No
  jsDelivr, unpkg, or other remote world-atlas URL.
- Fetch failure (block the JSON): requisites remain, band empty, no
  console error spam beyond a single guarded failure.
- Header `Контакты` scrolls to the footer. Skip link still lands in
  `main`. Final CTA is unchanged and is not a form.
- No second WebGL context. Hero GLB and starfield unchanged.

## Ownership after implementation

| Topic                                                            | Owner                   |
| ---------------------------------------------------------------- | ----------------------- |
| Footer structure, crop window, SVG globe runtime, local TopoJSON | this spec               |
| Heading, lede, four requisites, nav label                        | landing product spec    |
| Hero GLB                                                         | hero globe runtime spec |
| Stars                                                            | starfield spec          |
| Product claims                                                   | `.cursor/docs/brief.md` |
