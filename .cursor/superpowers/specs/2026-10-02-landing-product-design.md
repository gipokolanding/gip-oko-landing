# ГИП «Око» Landing Product Specification

**Status:** Approved design; implementation pending.

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
- Rebuild in place: replace the existing AI Core / agentic-runtime page.
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

The page must communicate four connected capabilities:

1. combine heterogeneous territorial data in one spatial context;
2. compare overlapping layers;
3. perform a spatial action such as measurement or annotation;
4. inspect the result in 3D and return to a flat representation.

The page must not behave like a product manual, a lead-generation form, or a
generic technology showcase. Its job is to establish enough product
understanding and confidence for the visitor to launch the demo.

The primary success action is activation of the configured demo link. No
analytics are added in this project, so this is a product objective rather
than an instrumented conversion metric.

## 2. Page sections

The page is a single linear narrative with eight content sections:

1. Hero — territory as one spatial whole.
2. Unified spatial context — heterogeneous data in one project.
3. Working scenario — the five-step product workflow.
4. Layer comparison — swipe and opacity as concrete evidence.
5. Analysis tools — capabilities grouped by user task.
6. Data and compatibility — confirmed formats, services, and coordinate
   systems.
7. Demo scenario — what the visitor can verify after launch.
8. Final transition — a direct handoff to the working demo.

A site header and a minimal footer support these sections but do not introduce
additional marketing narratives.

The order is fixed. It moves from definition, to product model, to workflow,
to evidence, to breadth, and finally to action. Implementations must not
reorder sections to create a generic feature-card page.

## 3. Content for each section

### Global header

Purpose: identify the product, provide a small number of useful anchors, and
keep the direct demo action visible without competing with the hero.

Required visible content:

- Brand: `ГИП «Око»`
- Navigation:
  - `Данные` → unified spatial context
  - `Сценарий` → working scenario
  - `Инструменты` → analysis tools
- Primary action: `Запустить демонстрацию`

The header must not contain status theater such as “online,” “active,”
“runtime,” or artificial system telemetry. The navigation must remain
available at 390 px rather than disappearing.

### Section 1 — Hero

Purpose: define the product, state the practical result, and offer a direct
demo launch above the fold.

Required content:

- Product name: `ГИП «Око»`
- H1: `Территория в едином пространственном контексте`
- Product definition:
  `ГИП «Око» — промышленная геоинформационная платформа для совместной работы с растрами, векторными слоями, рельефом и 3D-моделями в браузере.`
- Problem-to-result statement:
  `Сопоставляйте данные из разных источников, выполняйте измерения и изучайте территорию в 3D, не переключаясь между разрозненными инструментами.`
- Primary action: `Запустить демонстрацию`
- Supporting action copy:
  `Откройте проект, сравните слои и исследуйте территорию в 3D.`

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
four identical SaaS feature cards.

### Section 3 — Working scenario

Anchor: `workflow`

Purpose: show the real product sequence and prepare the visitor for the demo.
This is the only section where sequential numbering is permitted.

Required heading:

`От запроса к пространственной картине`

Required introductory copy:

`Основной сценарий проходит от поиска территории до проверки результата в объёмном представлении.`

Required five steps:

1. `Найдите территорию`
   - `Перейдите к нужному району по названию или координатам.`
2. `Откройте проект`
   - `Просмотрите структуру слоёв и выберите данные для текущей задачи.`
3. `Сопоставьте материалы`
   - `Измените видимость, порядок или прозрачность слоёв и сравните перекрывающиеся растры.`
4. `Выполните действие`
   - `Измерьте расстояние или площадь либо нанесите пользовательский объект.`
5. `Осмотрите результат в 3D`
   - `Оцените рельеф и объекты в объёме, затем вернитесь к 2D или 2.5D.`

Desktop presentation:

- A manually controlled slider with one step visible as the primary frame.
- Visible controls named `Назад` and `Далее`.
- Visible progress copy in the form `Шаг 1 из 5`.
- No autoplay and no drag-only interaction.

Mobile presentation:

- The five steps become a normal vertical list.
- Content remains fully available without carousel interaction.

Media state before approved product screenshots exist:

- Each frame uses an honest neutral media frame, not a fabricated app UI.
- Frame label format: `Экран 1. Поиск территории`.
- Required media note:
  `Скриншот продукта будет добавлен после согласования материалов.`

When approved screenshots are supplied, replace only the media frames. Keep
the sequence, copy, controls, and accessibility behavior unchanged unless the
brief is revised.

### Section 4 — Layer comparison

Purpose: make the benefit of overlapping-data comparison concrete without
pretending that the landing page performs geospatial analysis.

Required heading:

`Сравнивайте слои в одном положении`

Required body copy:

`Режим «шторки» помогает визуально сопоставить перекрывающиеся растры. Прозрачность и параметры отображения позволяют проверить различия, не теряя пространственный контекст.`

Required supporting points:

- `Перемещайте границу между двумя растровыми материалами.`
- `Изменяйте прозрачность выбранного слоя.`
- `Настраивайте яркость, контрастность, оттенок, насыщенность и гамму.`

The landing implementation defined by this specification uses a static
evidence composition with a clear divider and labels `Материал A` and
`Материал B`. It must not imitate a live map control. An interactive
before/after control is not required by this specification.

Only approved open data or synthetic data may appear in the composition.
Synthetic imagery requires the visible caption:
`Иллюстрация на синтетических данных.`

### Section 5 — Analysis tools

Anchor: `tools`

Purpose: show functional breadth through user tasks rather than an undifferentiated
catalog.

Required heading:

`Инструменты по задаче`

Required introductory copy:

`Выберите территорию, зафиксируйте наблюдение, выполните расчёт и перейдите к объёмному осмотру в том же рабочем пространстве.`

Required task groups:

- `Найти территорию`
  - `Ищите по координатам, странам, областям и городам.`
  - `Проверяйте координаты и высоту рельефа под курсором.`
  - `Работайте в системах координат WGS-84, СК-42 и ПЗ-90.11.`
- `Нанести объекты`
  - `Добавляйте точки, линии, прямоугольники, окружности, полигоны, текст и фотографии.`
  - `Собирайте пользовательские объекты в именованные коллекции.`
  - `Импортируйте и экспортируйте KML/KMZ.`
- `Выполнить измерение`
  - `Измеряйте расстояние, длину линии и площадь непосредственно на карте.`
- `Исследовать рельеф и 3D`
  - `Используйте гипсометрическую раскраску и горизонтали.`
  - `Выполняйте круговой облёт вокруг выбранной точки и переходите к виду из заданной точки.`
  - `Размещайте и настраивайте 3D-модели и объёмные зоны в форме купола.`

The four groups must not be rendered as equal rounded cards. Use an
asymmetric editorial structure that reflects the different amount and type of
content in each group.

### Section 6 — Data and compatibility

Purpose: give selection participants a short, verifiable inventory of
confirmed compatibility.

Required heading:

`Данные и системы координат`

Required introductory copy:

`Платформа работает с подтверждённым набором геопространственных сервисов, форматов и систем координат.`

Required inventory:

- `Сервисы: WMTS 1.0.0, WCS 2.0.1`
- `Форматы: BIR, GPKG, KML/KMZ`
- `Рельеф: .terrain`
- `Системы координат: WGS-84, СК-42, ПЗ-90.11`

Do not add formats, protocols, databases, integrations, or deployment claims
that are not in the brief. This section is an inventory, not a logo wall.

### Section 7 — Demo scenario

Purpose: remove uncertainty about what happens after activation of the primary
CTA.

Required heading:

`Что можно проверить в демонстрации`

Required introductory copy:

`Демонстрационная среда позволяет пройти основной сценарий работы с геопространственными данными.`

Required checklist:

- `Найти территорию по названию или координатам.`
- `Открыть проект с разными типами пространственных данных.`
- `Сопоставить перекрывающиеся слои и изменить их представление.`
- `Выполнить измерение или нанести пользовательский объект.`
- `Перейти к 3D-представлению и вернуться к плоскому виду.`

Do not add a form, email field, phone field, consultation offer, presentation
download, or secondary conversion path.

### Section 8 — Final transition

Purpose: repeat the direct product action after the visitor understands the
scenario.

Required heading:

`Откройте рабочий сценарий ГИП «Око»`

Required body copy:

`Перейдите в демонстрационную среду, откройте проект и проверьте основные инструменты на пространственных данных.`

Required primary action:

`Запустить демонстрацию`

The action opens the configured demo in the current tab. It must not be
replaced with a contact form, modal, download, or callback request.

### Footer

Required content:

- `ГИП «Око»`

No company name, legal statement, contact information, customer logo, or
certification mark may be invented. Add such content only after the product
owner supplies and approves it.

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
- Show the adjacent copy:
  `Демонстрационная версия готовится к публикации.`

### Progressive enhancement

- The server-rendered document contains all meaningful headings, body copy,
  lists, compatibility data, and CTA context.
- JavaScript enhances only the workflow slider and hero canvas.
- Without JavaScript, workflow steps remain readable in document order and
  the page still explains the complete product narrative.
- Without WebGL, the hero uses the normal CSS background and retains all text
  and actions. No blocking error is shown because the model is decorative.

### Workflow slider

- It never advances automatically.
- Previous and next controls are real buttons.
- The active frame and visible step count update together.
- Arrow keys may supplement buttons when focus is inside the slider, but
  arrow-key behavior must not replace visible controls.
- Pointer dragging is optional and must never be the only interaction.
- At viewport widths of 760 px and below, enhancement is removed and steps are
  presented as a standard list.

### Responsive behavior

- The supported minimum viewport width is 390 CSS pixels.
- Content must not require horizontal page scrolling.
- Hero copy precedes the visual in DOM and reading order.
- Navigation wraps or moves to a second row on narrow screens; it is not
  removed.
- Data groups and tool groups become one-column content in logical order.
- Compatibility items wrap as text, not as horizontally scrolling chips.
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
- Restrained Violet — `#7466C9`: comparison, depth, and one secondary layer.

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
- Use tabular figures for coordinates, versions, and step counts.
- Do not use decorative monospace text.
- Do not use tracked all-caps labels.
- Do not emphasize one word in a heading with italic, gradient, or accent
  color.
- Body copy should generally remain within 68–72 characters per line.
- Headings use scale, weight, and line breaks rather than ornamental styling.

Suggested type scale:

- Hero H1: `clamp(3.25rem, 7vw, 7rem)`, line-height `0.92–0.98`.
- Section H2: `clamp(2.25rem, 4.5vw, 4.75rem)`, line-height `0.98–1.05`.
- H3: `clamp(1.25rem, 2vw, 1.75rem)`.
- Body: `1rem–1.125rem`, line-height `1.55–1.7`.
- Supporting text: no smaller than `0.875rem`.

### Layout

- Maximum content width: approximately 1280 px.
- Desktop grid: 12 columns with 24 px gaps.
- Desktop side gutters: at least 32 px.
- Mobile side gutters at 390 px: 18 px.
- Desktop section spacing: 112–144 px.
- Mobile section spacing: 72–88 px.
- Default alignment: left.

Desktop composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ Brand          Data · Scenario · Tools             Demo CTA │
├────────────────────────── Hero ──────────────────────────────┤
│ Product definition      │                       [GLB field] │
│ Problem → result        │                    atmospheric 3D │
│ [Launch demo]           │                                   │
├───────────────┬──────────────────────────────────────────────┤
│ Why together  │ Raster / Vector / Terrain / 3D relations   │
├───────────────┴──────────────────────────────────────────────┤
│ Five-step workflow slider / future product screenshots      │
├──────────────────────────────┬───────────────────────────────┤
│ Layer comparison explanation │ Static comparison evidence  │
├──────────────┬───────────────┴───────────────────────────────┤
│ Tasks        │ Search / Mark / Measure / Inspect in 3D      │
├──────────────┴───────────────────────────────────────────────┤
│ Compatibility inventory                                      │
├──────────────────────────────┬───────────────────────────────┤
│ What happens in demo         │ Five verifiable actions      │
├──────────────────────────────┴───────────────────────────────┤
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
- Product screenshots, when supplied, are shown as evidence and are not
  hidden behind heavy perspective, blur, or decorative device frames.

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
- numbered sections outside the real five-step workflow;
- gradient headline accents;
- identical rounded feature cards;
- speculative app-shell chrome;
- continuous idle orbit from the previous AI Core canvas.

## 6. Component structure

Use Server Components by default. Keep client boundaries narrow and explicit.
Replace `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, and
`src/components/hero.tsx`. Move the canvas into the landing tree below.
Do not keep a second hero implementation.

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
      workflow-section.tsx
      workflow-slider.tsx
      layer-comparison-section.tsx
      analysis-tools-section.tsx
      compatibility-section.tsx
      demo-scenario-section.tsx
      final-cta-section.tsx
      site-footer.tsx
      demo-link.tsx
      section-heading.tsx
      media-placeholder.tsx
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
  - Typed static content for navigation, sections, workflow steps,
    compatibility items, and CTA strings.
  - Contains no HTML and no runtime fetching.
- `lib/demo-url.ts`
  - Validates `NEXT_PUBLIC_DEMO_URL`.
  - Distinguishes development unavailable state from production release
    failure.
- `SiteHeader`
  - Brand, three anchor links, and the shared demo action.
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
- `WorkflowSection`
  - Server wrapper and no-JavaScript ordered content.
- `WorkflowSlider`
  - Client enhancement for desktop only.
  - Owns active-step state and accessible controls.
- `LayerComparisonSection`
  - Static semantic evidence composition.
  - Contains no fake map control.
- `AnalysisToolsSection`
  - Renders four task groups in an asymmetric layout.
- `CompatibilitySection`
  - Renders the exact confirmed inventory.
- `DemoScenarioSection`
  - Explains the five actions available after launch.
- `FinalCtaSection`
  - Repeats the shared direct demo action.
- `DemoLink`
  - The only primary CTA presentation component.
  - Receives validated state and keeps copy and behavior consistent.
- `MediaPlaceholder`
  - Development-stage workflow media frame with explicit approval copy.
- `SectionHeading`
  - Shared semantic heading primitive without automatic eyebrow text.

There is no global client state. Section content is static. The slider state
and canvas state remain isolated within their respective client boundaries.

## 7. Accessibility requirements

The target is WCAG 2.2 AA for the landing page.

### Semantics and reading order

- Use `header`, `nav`, `main`, `section`, and `footer` landmarks.
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
- Slider buttons work with Enter and Space.
- Slider arrow-key enhancement, if implemented, is documented in an
  accessible instruction and does not override page scrolling unexpectedly.
- No content requires hover, drag, pointer parallax, or canvas interaction.
- The landing page works without a mouse. Do not turn this implementation
  property into a claim that all map tools in the product work without a
  mouse.

### Focus and controls

- Use a clearly visible `:focus-visible` treatment based on Signal Cyan.
- Focus indicators have at least 3:1 contrast against adjacent colors.
- Do not remove native focus without a replacement.
- Pointer targets are at least 44 by 44 CSS pixels.
- Disabled demo actions are not focusable as links and expose their
  unavailable state in text.
- The final action is not hidden behind a modal or custom gesture.

### Workflow slider

- Use the WAI-ARIA carousel pattern only where it improves semantics; do not
  add roles that conflict with native elements.
- Controls have visible names.
- The current step is announced politely when changed by a user action.
- Inactive frames must not expose hidden interactive descendants.
- There is no autoplay, pause control, or time limit.
- The complete ordered list remains available to assistive technology and in
  the mobile layout.

### Visual content

- Normal text contrast is at least 4.5:1.
- Large text contrast is at least 3:1.
- UI controls and meaningful graphics meet 3:1 non-text contrast.
- Do not encode layer identity by color alone; pair color with text or shape.
- Approved screenshots require concise alt text describing the task shown,
  not the decorative appearance.
- Decorative stars, the GLB, and decorative layer lines are hidden from the
  accessibility tree.
- No meaningful copy is rendered into canvas.

### Motion

- Respect `prefers-reduced-motion: reduce`.
- Disable smooth scrolling, entrance animation, model rotation, pointer
  parallax, and animated comparison transitions in reduced-motion mode.
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
during local verification, exercise the navigation, workflow controls, and
CTA and confirm that no long task causes a visibly delayed response.

### Rendering and JavaScript

- `app/page.tsx` and all static sections remain Server Components.
- Only the hero model wrapper, canvas, and desktop workflow enhancement ship
  client behavior.
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
- Future product screenshots use AVIF or WebP where practical.
- Provide intrinsic width and height for every raster image.
- Use responsive source sizes rather than sending desktop images to 390 px
  devices.
- Avoid video unless a later approved brief explicitly requires it.

### Network and privacy

- No remote decorative assets.
- No analytics, trackers, session replay, advertising, or telemetry.
- No background product API requests from the landing page.
- The only external navigation is the user-activated demo destination.
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

### Required state copy

Use these exact strings where the corresponding state exists:

- Synthetic visual:
  `Иллюстрация на синтетических данных.`
- Pending approved screenshot:
  `Скриншот продукта будет добавлен после согласования материалов.`
- Demo destination absent in development:
  `Демонстрационная версия готовится к публикации.`

The WebGL fallback does not require an error message because the model is
decorative and the complete hero remains available.

### Visual-data safety

- Do not show sensitive data, restricted territories, personal data,
  classified labels, or real customer interfaces.
- Use synthetic data or explicitly permitted open data.
- Do not display customer names, logos, access levels, user identities,
  incident details, or operational coordinates.
- Any future screenshot must be reviewed for content safety before it enters
  the repository.

## 10. Definition of done

### Content and behavior

- All eight sections appear in the specified order.
- All required Russian UI copy is present and proofread.
- The old AI Core, agentic runtime, and English slogan content is absent.
- Header navigation reaches the correct section anchors.
- Every primary CTA reads `Запустить демонстрацию`.
- A valid real demo URL is configured for production.
- The CTA opens the demo directly in the current tab without a form or modal.
- No unsupported claims or invented business details appear.
- Workflow placeholders are explicit and do not imitate an unverified product
  UI.

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
- The 390 px header navigation is present and operable.
- Focus indicators are visible and not obscured.
- The workflow slider has no autoplay and has working named controls.
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

