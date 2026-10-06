# ГИП «Око» Landing Product Specification

**Status:** implemented 2026-10-05

## Document purpose

This document is the implementation source of truth for the ГИП «Око»
landing page. It translates `.cursor/docs/brief.md` into page content, UX
behavior, visual rules, React component boundaries, non-functional
requirements, and acceptance criteria.

The specification is written in English for the implementation team. Text in
Russian quotation marks is required production UI copy. The published landing
page is Russian-language by default.

This document does not authorize unsupported product claims. If it conflicts
with the product evidence or safety restrictions in `.cursor/docs/brief.md`,
the brief wins.

## Product and implementation context

- Product: an industrial geoinformation platform for visual control and
  analysis of territorial data.
- Audience: Russian public-sector organizations, state corporations, and
  professional users of spatial data.
- Primary action: open the working product demonstration directly.
- Current stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS,
  React Three Fiber, Drei, and Three.js.
- Primary 3D asset: `public/models/background-model.glb`.
- Related rendering specification:
  `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`.
- Rebuild in place: the obsolete AI Core / agentic-runtime page is gone.
  Keep the local GLB and the Blender-parity color-management contract.
  Do not add a parallel route.
- This implementation cycle does not set `NEXT_PUBLIC_DEMO_URL`. Development
  uses the disabled CTA defined below. A production release remains blocked
  until a valid URL exists. Do not invent a substitute destination.
- Out of scope: changing the product itself, building the demo, lead capture,
  analytics, authentication, a CMS, a database, or remote decorative assets.

## 1. Page goal

The page must help a professional visitor understand the working model of
ГИП «Око» within two to four minutes and then move directly into the product
demonstration.

The page must communicate three connected capabilities:

1. combine heterogeneous territorial data in one spatial context;
2. perform a spatial action such as measurement or annotation;
3. inspect the result in 3D and return to a flat representation.

The page must not behave like a product manual, a lead-generation form, or a
generic technology showcase. Its job is to establish enough product
understanding and confidence for the visitor to launch the demo.

The primary success action is activation of the configured demo link. No
analytics are added in this project, so this is a product objective rather
than an instrumented conversion metric.

## 2. Page sections

The page is a single linear narrative with four product sections, followed
by institutional contacts:

1. Hero — territory as one spatial whole.
2. Unified spatial context — heterogeneous data in one project.
3. Analysis tools — capabilities grouped by user task.
4. Final transition — a direct handoff to the working demo.
5. Contacts — organization requisites after the product narrative.

A site header supports these sections but does not introduce additional
marketing narratives.

The order is fixed. It moves from definition, to product model, to task
breadth, to action, and ends with contacts. Implementations must not reorder
sections to create a generic feature-card page.

## 3. Content for each section

### Global header

Purpose: identify the product, provide a small number of useful anchors, and
keep the direct demo action visible without competing with the hero.

Required visible content:

- Brand: `ГИП «Око»`
- Navigation:
  - `Данные` → unified spatial context
  - `Сценарии` → analysis tools
  - `Контакты` → contacts
- Primary action: `Запустить демонстрацию`

The header must not contain status theater such as “online,” “active,”
“runtime,” or artificial system telemetry. The navigation must remain
available at 390 px rather than disappearing. The header stays in the
viewport while the page scrolls, so brand, anchors, and the demo action
remain reachable without returning to the top.

### Section 1 — Hero

Purpose: define the product, state the practical result, and offer a direct
demo launch above the fold.

Required content:

- H1: `Территория в едином пространственном контексте`
- Product definition:
  `ГИП «Око» — промышленная геоинформационная платформа для совместной работы с растрами, векторными слоями, рельефом и 3D-моделями в браузере.`
- Problem-to-result statement:
  `Сопоставляйте данные из разных источников, выполняйте измерения и изучайте территорию в 3D, не переключаясь между разрозненными инструментами.`
- Primary action: `Запустить демонстрацию`

The local GLB is an atmospheric hero-level background visual. It may react
subtly to pointer movement, but it does not represent a product control,
dataset, globe interaction, or live system state. Product understanding must
not depend on the canvas.

The hero must not use an eyebrow, an English slogan, an “AI” label, a
decorative sequence number, or a second competing CTA.

### Section 2 — Unified spatial context

Anchor: `data`

Purpose: explain which data types meet in a project and why their shared
position matters.

Required heading:

`Разные данные. Одна территория.`

Required introductory copy:

`Растры, векторные слои, рельеф и 3D-модели сохраняют взаимное положение в одном проекте. Специалист видит общую обстановку и управляет представлением данных, не переключаясь между разрозненными инструментами.`

Required data groups:

- `Растры`
  - `Снимки и картографические материалы можно накладывать, настраивать и сравнивать.`
- `Векторные слои`
  - `Границы и тематические объекты отображаются в том же пространственном контексте.`
- `Рельеф`
  - `Высоты, горизонтали и гипсометрическая раскраска помогают оценивать местность.`
- `3D-модели`
  - `Объёмные объекты дополняют карту там, где плоского представления недостаточно.`

Required closing line:

`Видимость, порядок и прозрачность слоёв настраиваются внутри одного рабочего пространства.`

This content must be presented as relationships around one territory, not as
four identical SaaS feature cards. The four groups fill a 2×2 grid without
empty cells.

### Section 3 — Analysis tools

Anchor: `tools`

Purpose: show functional breadth through user tasks rather than an undifferentiated
catalog.

Required heading:

`Комплексные сценарии работы с данными`

Required introductory copy:

`Выберите территорию, зафиксируйте наблюдение, выполните расчёт и перейдите к объёмному осмотру в том же рабочем пространстве.`

Required task groups:

- `Найти территорию`
  - `Ищите по координатам, странам, областям и городам.`
  - `Проверяйте координаты и высоту рельефа под курсором.`
  - `Работайте в системах координат WGS-84, СК-42 и ПЗ-90.11.`
- `Нанести объекты`
  - `Добавляйте точки, линии, прямоугольники, окружности, полигоны, полусферы, текст и фотографии.`
  - `Собирайте пользовательские объекты в именованные коллекции.`
  - `Импортируйте и экспортируйте KML/KMZ.`
- `Выполнить измерение`
  - `Измеряйте расстояние, длину линии и площадь непосредственно на карте.`
- `Исследовать рельеф`
  - `Используйте гипсометрическую раскраску и горизонтали, определяйте профили высот.`
- `Управлять обзором`
  - `Выполняйте круговой облёт вокруг выбранной точки, переходите к виду «из глаз», просматривайте карту в 2D, 2,5D и 3D режимах, делайте снимки экрана без интерфейса приложения.`

The five groups must not be rendered as equal rounded cards. Use an
asymmetric editorial structure that reflects the different amount and type of
content in each group. The first group spans the full row; the remaining four
sit in two paired rows.

### Section 4 — Final transition

Purpose: repeat the direct product action after the visitor understands the
product model.

Required heading:

`Откройте демонстрацию ГИП «Око»`

Required body copy:

`Перейдите в демонстрационную среду, откройте проект и проверьте основные инструменты на пространственных данных.`

Required primary action:

`Запустить демонстрацию`

The action opens the configured demo in the current tab. It must not be
replaced with a contact form, modal, download, or callback request.

### Section 5 — Contacts

Anchor: `contacts`

Purpose: give a typical institutional contact block after the product
narrative. This section must not compete with the demo CTA or collect leads.

Required heading:

`Контакты`

Required introductory copy:

`Реквизиты для связи по вопросам применения платформы.`

Required fields, using development placeholders until the product owner
supplies real requisites:

- `Организация` — `ООО «Наименование организации»`
- `Адрес` — `000000, г. Москва, ул. Примерная, д. 0`
- `Телефон` — `+7 (000) 000-00-00`
- `Электронная почта` — `info@example.com`

Phone and email may be ordinary `tel:` and `mailto:` links. Do not invent a
real organization, address, or published legal identity. Do not add a contact
form, map, or callback request.

### Page metadata

Required metadata:

- Title:
  `ГИП «Око» — геоинформационная платформа для анализа территории`
- Description:
  `Растры, векторные слои, рельеф и 3D-модели в едином пространственном контексте. Откройте демонстрацию ГИП «Око».`
- Document language: `ru`
- Open Graph locale: `ru_RU`

Metadata must not mention AI, agentic systems, certifications, performance,
or unsupported deployment properties.

## 4. UX logic

### Narrative and navigation

- The primary experience is a linear top-to-bottom scroll.
- The site header remains visible at the top of the viewport during scroll.
- In-page anchors account for the sticky header height and do not hide
  headings under it.
- Header links are optional accelerators, not a requirement for understanding
  the page.
- Anchor targets use stable IDs and account for keyboard focus.
- The page may use smooth anchor scrolling for users who do not request
  reduced motion.
- Browser history, back behavior, and normal link semantics must remain
  intact.

### Primary CTA

- Every primary CTA uses the exact text `Запустить демонстрацию`.
- All primary CTAs use the same destination and behavior.
- The destination comes from one configuration source,
  `NEXT_PUBLIC_DEMO_URL`.
- A valid configured URL opens directly in the current tab.
- A production release is blocked when the URL is absent or invalid.
- Development must never use `#`, `javascript:`, a fabricated `/demo` route,
  or a lead form as a substitute.
- Until the product owner supplies a real demo URL, every primary CTA uses
  the development unavailable state below.

When the URL is absent in development:

- Render a non-link disabled action.
- Apply `aria-disabled="true"`.
- Do not add adjacent explanation copy.

### Progressive enhancement

- The server-rendered document contains all meaningful headings, body copy,
  lists, and CTA context.
- JavaScript enhances only the hero canvas.
- Without JavaScript, the page still explains the complete product narrative.
- Without WebGL, the hero uses the normal CSS background and retains all text
  and actions. No blocking error is shown because the model is decorative.

### Responsive behavior

- The supported minimum viewport width is 390 CSS pixels.
- Content must not require horizontal page scrolling.
- Hero copy precedes the visual in DOM and reading order.
- Navigation wraps or moves to a second row on narrow screens; it is not
  removed.
- Data groups and tool groups become one-column content in logical order.
- No essential copy appears only on hover.

## 5. Visual direction

### Concept

The page is a precise, restrained spatial instrument on a dark star-field
background. The GLB is the single expressive visual gesture. Everything else
uses disciplined typography, meaningful alignment, and product evidence.

The page must not look like an AI runtime, a command-line dashboard, a game
HUD, or a generic card-based SaaS template.

### Core palette

- Abyss — `#05070B`: primary page background.
- Instrument — `#0D1420`: raised or inset product-evidence surfaces.
- Frost — `#ECF6F7`: primary text.
- Muted Steel — `#8FA1AB`: secondary text.
- Signal Cyan — `#58E8F4`: primary CTA, focus, selection, and key data line.
- Restrained Violet — `#7466C9`: depth and one secondary layer.

Rules:

- Derive dividers from Frost with low alpha rather than introducing another
  decorative color.
- Signal Cyan is the only primary action color.
- Restrained Violet is subordinate and must not compete with the CTA.
- Use gradients only to establish spatial depth around the hero model.
- Do not use gradient text.
- Do not apply glow to every cyan element.
- Text and controls must retain WCAG AA contrast in every state.

### Typography

- Use one self-hosted variable family: Golos Text.
- Store the WOFF2 asset and its license locally in the repository.
- Use the same family for display, body, labels, and controls.
- Use tabular figures for coordinates and versions.
- Do not use decorative monospace text.
- Do not use tracked all-caps labels.
- Do not emphasize one word in a heading with italic, gradient, or accent
  color.
- Body copy should generally remain within 68–72 characters per line.
- Headings use scale, weight, and line breaks rather than ornamental styling.

Suggested type scale (clamp maxima match 1024 px):

- Hero H1: `clamp(3.25rem, 7vw, 4.48rem)`, line-height `0.92–0.98`.
- Section H2: `clamp(2.25rem, 4.5vw, 2.88rem)`, line-height `0.98–1.05`.
- H3: `clamp(1.25rem, 2vw, 1.28rem)`.
- Body: `1rem–1.125rem`, line-height `1.55–1.7`.
- Supporting text: no smaller than `0.875rem`.
- At 390 px the root `html` font-size is `93.75%`, so every rem-based size
  on the page scales down slightly.
- At 410 px and below, the header brand and demo action use `0.9375rem` and
  stay on one line.

### Layout

- Maximum content width: approximately 1280 px.
- Desktop grid: 12 columns with 24 px gaps.
- Desktop side gutters: at least 32 px.
- Mobile side gutters at 390 px: 18 px.
- Desktop section `padding-block`: 64 px.
- Mobile section `padding-block`: 40 px.
- Hero bottom padding: 48 px on desktop, 32 px at 390 px. Do not double
  these values as extra gap between sections.
- Default alignment: left.

Desktop composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ Brand          Data · Tools                        Demo CTA │
├────────────────────────── Hero ──────────────────────────────┤
│ Product definition      │                       [GLB field] │
│ Problem → result        │                    atmospheric 3D │
│ [Launch demo]           │                                   │
├───────────────┬──────────────────────────────────────────────┤
│ Why together  │ Raster / Vector / Terrain / 3D relations   │
├───────────────┴──────────────────────────────────────────────┤
│ Tasks: Search / Mark / Measure / Inspect in 3D              │
├──────────────────────────────────────────────────────────────┤
│ Final direct demo transition                                 │
└──────────────────────────────────────────────────────────────┘
```

Additional rules:

- Do not use a repeated three- or four-column card grid as the default
  structure.
- Borders, dividers, and labels must encode grouping or state.
- Avoid pill-shaped decorative tags.
- Use corner radii only where they communicate a media frame or control
  boundary; do not apply one global radius to every surface.
- Stars are sparse local CSS layers, not a stock image.

### Hero model and motion

- The model exists only in the hero.
- On desktop it occupies the right/background visual field and may extend
  into unoccupied hero space.
- It must not reduce text contrast or intercept CTA input.
- On mobile it moves behind or below the copy without changing reading order.
- Pointer response is subtle and available only for fine-pointer devices.
- Touch input remains available for vertical page scrolling.
- Do not use continuous idle rotation, orbit, or other motion while the
  pointer is still. The previous AI Core canvas idle orbit is not part of
  this landing.
- The only orchestrated entrance is the hero copy and model becoming ready.
- Sections must not use repeated fade-and-slide reveals.
- Reduced motion produces an immediate static state.

### Uniqueness check

Dark space, cyan, violet, and a central 3D object are explicit brief
requirements, not arbitrary style defaults. To avoid a generic “AI space
SaaS” result, the implementation must remove:

- AI Core and agentic runtime language;
- decorative system status;
- English marketing slogans;
- monospace telemetry labels;
- all-caps eyebrows above every heading;
- numbered marketing sections;
- gradient headline accents;
- identical rounded feature cards;
- speculative app-shell chrome;
- continuous idle orbit from the previous AI Core canvas.

## 6. Component structure

Use Server Components by default. Keep client boundaries narrow and explicit.
The page lives in `src/app/page.tsx`, `src/app/layout.tsx`, and
`src/app/globals.css`. The canvas lives in the landing tree below.
Do not keep a second hero implementation or restore `src/components/hero.tsx`.

File and component structure:

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    landing/
      site-header.tsx
      hero-section.tsx
      hero-model.tsx
      background-model-canvas.tsx
      spatial-context-section.tsx
      analysis-tools-section.tsx
      final-cta-section.tsx
      contacts-section.tsx
      demo-link.tsx
      section-heading.tsx
  content/
    landing.ts
  lib/
    demo-url.ts
```

Responsibilities:

- `app/page.tsx`
  - Server Component.
  - Composes sections in the fixed order.
  - Supplies validated demo configuration.
- `app/layout.tsx`
  - Owns Russian document language, metadata, local font configuration,
    viewport, and global page shell.
- `content/landing.ts`
  - Typed static content for navigation, sections, and CTA strings.
  - Contains no HTML and no runtime fetching.
- `lib/demo-url.ts`
  - Validates `NEXT_PUBLIC_DEMO_URL`.
  - Distinguishes development unavailable state from production release
    failure.
- `SiteHeader`
  - Brand, three anchor links, and the shared demo action.
  - Stays in the viewport while the page scrolls.
- `HeroSection`
  - Server-rendered heading, definition, result statement, CTA, and visual
    slot.
  - Must not become a Client Component.
- `HeroModel`
  - Small Client Component boundary.
  - Detects WebGL, handles canvas failure, and loads the 3D implementation
    dynamically with SSR disabled.
- `BackgroundModelCanvas`
  - Owns all React Three Fiber and Three.js logic.
  - Loads the local GLB, configures rendering, and responds to permitted
    pointer and motion states.
- `SpatialContextSection`
  - Renders the four data relationships as semantic content.
- `AnalysisToolsSection`
  - Renders four task groups in an asymmetric layout.
- `FinalCtaSection`
  - Repeats the shared direct demo action.
- `ContactsSection`
  - Renders the institutional contact requisites after the final CTA.
  - Uses placeholder values until real requisites exist.
- `DemoLink`
  - The only primary CTA presentation component.
  - Receives validated state and keeps copy and behavior consistent.
- `SectionHeading`
  - Shared semantic heading primitive without automatic eyebrow text.

There is no global client state. Section content is static. Canvas state
remains isolated within its client boundary.

## 7. Accessibility requirements

The target is WCAG 2.2 AA for the landing page.

### Semantics and reading order

- Use `header`, `nav`, `main`, and `section` landmarks.
- Include a visible-on-focus skip link to `main`.
- Use exactly one H1.
- Preserve sequential heading levels.
- Every section has a programmatic name from its visible heading.
- DOM order matches visual and reading order at every breakpoint.
- Set `<html lang="ru">`.

### Keyboard and no-mouse use

- Every link and button is reachable and operable with a keyboard.
- Focus order follows the page narrative.
- Focus is never trapped.
- The header navigation remains present at 390 px.
- No content requires hover, drag, pointer parallax, or canvas interaction.
- The landing page works without a mouse. Do not turn this implementation
  property into a claim that all map tools in the product work without a
  mouse.

### Focus and controls

- Use a clearly visible `:focus-visible` treatment based on Signal Cyan.
- Focus indicators have at least 3:1 contrast against adjacent colors.
- Do not remove native focus without a replacement.
- Pointer targets are at least 44 by 44 CSS pixels.
- Disabled demo actions are not focusable as links.
- The final action is not hidden behind a modal or custom gesture.

### Visual content

- Normal text contrast is at least 4.5:1.
- Large text contrast is at least 3:1.
- UI controls and meaningful graphics meet 3:1 non-text contrast.
- Do not encode meaning by color alone; pair color with text or shape.
- Decorative stars, the GLB, and decorative layer lines are hidden from the
  accessibility tree.
- No meaningful copy is rendered into canvas.

### Motion

- Respect `prefers-reduced-motion: reduce`.
- Disable smooth scrolling, entrance animation, model rotation, and pointer
  parallax in reduced-motion mode.
- A static model or CSS fallback is acceptable.
- Do not use flashing, rapid pulsing, or parallax that moves independently of
  user input.

## 8. Performance requirements

### User-facing targets

On the target production profile:

- Largest Contentful Paint: at most 2.5 seconds.
- Interaction to Next Paint: at most 200 milliseconds.
- Cumulative Layout Shift: at most 0.1.

The hero heading or text block should be the LCP candidate. The canvas must
not block first content paint or CTA usability.

Measure lab results against a production build in Chromium with a cold cache,
a 390 by 844 px viewport, 4× CPU slowdown, and Slow 4G network emulation.
Record the median of three runs. Treat INP as the production field target;
during local verification, exercise the navigation and CTA and confirm that
no long task causes a visibly delayed response.

### Rendering and JavaScript

- `app/page.tsx` and all static sections remain Server Components.
- Only the hero model wrapper and canvas ship client behavior.
- Dynamically import the canvas with SSR disabled.
- Do not load Three.js, React Three Fiber, Drei, or the GLB before the primary
  HTML is usable.
- Do not use continuous animation when the model is idle.
- Pause or stop rendering when the hero is outside the viewport or the
  document is hidden.
- Use `frameloop="demand"` for static and reduced-motion states.
- Cap device pixel ratio to the range 1–1.5.
- Avoid layout effects and synchronous measurements in static sections.

### GLB requirements

- Asset path: `public/models/background-model.glb`.
- Maximum size: below 5 MB.
- Source: `.cursor/ai-assets/background-model.blend`.
- Export without lights or camera.
- Do not include `KHR_lights_punctual`.
- Canvas owns lighting.
- Preserve `AgXToneMapping`, sRGB output, and `toneMappingExposure = 0.8`
  unless a documented Blender comparison proves another value.
- A failed model request or unavailable WebGL must leave a complete,
  readable, actionable hero.

### Fonts and media

- Self-host Golos Text as WOFF2.
- Preload only the font file needed for initial text.
- Use `font-display: swap`.
- Do not fetch fonts from a remote provider at runtime.
- Avoid video unless a later approved brief explicitly requires it.

### Network and privacy

- No remote decorative assets.
- No analytics, trackers, session replay, advertising, or telemetry.
- No background product API requests from the landing page.
- The only user-activated destinations outside the page are the configured
  demo URL and the contact `tel:` / `mailto:` links.
- There must be no unexpected network failures in the browser console.

## 9. Safety copy

### Allowed claims

The page may state only capabilities confirmed by `.cursor/docs/brief.md`:

- shared visualization of rasters, vectors, terrain, and 3D models;
- 3D, 2D, and 2.5D modes;
- layer visibility, ordering, transparency, swipe comparison, and confirmed
  display adjustments;
- confirmed search, coordinate, annotation, measurement, terrain, 3D
  inspection, screenshot, and KML/KMZ capabilities;
- confirmed services, formats, and coordinate systems;
- browser-based thin-client operation;
- light and dark product themes;
- interactive help.

### Prohibited claims

Until the product owner provides evidence and approves wording, do not claim:

- FSTEC, FSB, or other certification or regulatory compliance;
- operation in a closed, isolated, or fully autonomous environment;
- a protection class or specific information-security characteristics;
- registry inclusion, fully domestic origin, or import independence;
- performance, accuracy, uptime, SLA, user-count, or storage figures;
- deployment for named customers or measurable economic outcomes;
- real-time monitoring, video surveillance, or moving-object tracking;
- AI, predictive analytics, recognition, or built-in reporting;
- offline operation or a mobile application;
- full keyboard-only operation of the map product;
- integrations, services, or formats outside the confirmed list.

### Visual-data safety

- Do not show sensitive data, restricted territories, personal data,
  classified labels, or real customer interfaces.
- Use synthetic data or explicitly permitted open data.
- Do not display customer names, logos, access levels, user identities,
  incident details, or operational coordinates.
- Any future screenshot must be reviewed for content safety before it enters
  the repository.
- The WebGL fallback does not require an error message because the model is
  decorative and the complete hero remains available.

## 10. Definition of done

### Content and behavior

- All five sections appear in the specified order.
- All required Russian UI copy is present and proofread.
- The old AI Core, agentic runtime, and English slogan content is absent.
- Header navigation reaches the correct section anchors.
- Every primary CTA reads `Запустить демонстрацию`.
- A valid real demo URL is configured for production.
- The CTA opens the demo directly in the current tab without a form or modal.
- No unsupported claims or invented business details appear.

### Visual implementation

- The approved palette, Golos Text typography, left-aligned grid, and spacing
  system are implemented consistently.
- The page does not default to identical rounded feature cards.
- The GLB is used only in the hero.
- The model remains subordinate to the hero copy and CTA.
- Desktop and 390 px layouts match the specified narrative and reading order.
- No text is clipped, overlapped, or available only through hover.

### Accessibility

- Keyboard-only navigation reaches and activates every control.
- The page remains usable without a mouse.
- The 390 px header navigation is present, operable, and remains visible
  while the page scrolls.
- Focus indicators are visible and not obscured.
- Reduced-motion mode removes nonessential motion.
- Automated accessibility inspection reports no critical or serious issues.
- Manual checks confirm heading order, landmarks, reading order, focus order,
  control names, contrast, and no-mouse use.

### Performance and resilience

- The GLB request succeeds and the asset remains below 5 MB.
- The canvas uses the approved color-management and tone-mapping settings.
- The exported GLB contains no lights or camera.
- WebGL-disabled, model-failure, reduced-motion, and narrow-screen states
  retain complete content and CTA context.
- Core Web Vitals meet the targets in this specification under the agreed
  production profile.
- The browser console has no runtime, hydration, accessibility, or unexpected
  network errors.
- The page makes no remote decorative-asset or analytics requests.

### Project checks

- `npm run lint` passes from the repository root.
- `npm run build` passes from the repository root.
- Browser verification covers desktop and 390 px layouts, keyboard-only use,
  no-mouse use, reduced motion, WebGL fallback, GLB loading, and console
  output.
- The final implementation is compared with `.cursor/docs/brief.md`, this
  specification, `AGENTS.md`, and the Blender parity specification.

