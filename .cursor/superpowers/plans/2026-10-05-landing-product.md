# ГИП «Око» Landing Product Implementation Plan

> **Status:** executed 2026-10-05. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the obsolete AI Core landing with the eight-section Russian product page specified in the landing product design, keeping the local GLB and Blender-parity color pipeline.

**Architecture:** Rebuild in place on the existing Next.js App Router tree. Server Components own copy and layout. Client islands exist only for the hero canvas and the desktop workflow slider. `NEXT_PUBLIC_DEMO_URL` stays unset in this cycle, so every primary CTA renders the specified disabled state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, React Three Fiber, Drei, Three.js r186, local Golos Text WOFF2.

**Design spec:** `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`

**Related specs:** `.cursor/docs/brief.md`, `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`, `AGENTS.md`

## Global Constraints

- Stack stays Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, React Three Fiber, Drei, and Three.js.
- Primary 3D asset: `public/models/background-model.glb`, below 5 MB, no `KHR_lights_punctual`.
- Preserve `AgXToneMapping`, sRGB output, and `toneMappingExposure = 0.8`.
- Rebuild in place. Do not add a parallel route.
- Do not set `NEXT_PUBLIC_DEMO_URL` in this cycle. Do not invent `#`, `javascript:`, or `/demo`.
- `next build` in this repo uses `NODE_ENV=production` and must still pass: `resolveDemoUrl` returns `unavailable` when the URL is missing. Do not throw during build.
- All visible UI copy is the exact Russian strings from the spec. No AI Core, agentic runtime, English slogans, or unsupported claims.
- One self-hosted family: Golos Text. No remote font providers at runtime.
- Supported minimum viewport: 390 CSS pixels. Navigation remains visible.
- Respect `prefers-reduced-motion`. No idle orbit. Pointer response only on fine-pointer devices.
- No analytics, auth, CMS, databases, remote decorative assets, or new npm packages unless Evgeniy approves an install.
- Do not initialize or mutate Git. Use review checkpoints instead of commits.
- Every implementer and reviewer must first read:
  - `.cursor/skills/3d-landing/SKILL.md`
  - `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`
  - this plan
  - `C:/Users/user/.cursor/plugins/cache/cursor-public/superpowers/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/verification-before-completion/SKILL.md`
- Landing-page tasks must also compare the result with `.cursor/docs/brief.md` and `AGENTS.md`.
- Canvas tasks must also read `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`.

## File map

Create:

- `src/lib/demo-url.ts`
- `src/content/landing.ts`
- `src/fonts/OFL.txt`
- `src/fonts/golos-text-cyrillic-wght-normal.woff2`
- `src/fonts/golos-text-latin-wght-normal.woff2`
- `src/components/landing/demo-link.tsx`
- `src/components/landing/section-heading.tsx`
- `src/components/landing/media-placeholder.tsx`
- `src/components/landing/site-header.tsx`
- `src/components/landing/site-footer.tsx`
- `src/components/landing/hero-section.tsx`
- `src/components/landing/hero-model.tsx`
- `src/components/landing/background-model-canvas.tsx`
- `src/components/landing/spatial-context-section.tsx`
- `src/components/landing/workflow-section.tsx`
- `src/components/landing/workflow-slider.tsx`
- `src/components/landing/layer-comparison-section.tsx`
- `src/components/landing/analysis-tools-section.tsx`
- `src/components/landing/compatibility-section.tsx`
- `src/components/landing/demo-scenario-section.tsx`
- `src/components/landing/final-cta-section.tsx`

Replace:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

Delete after the new hero is wired:

- `src/components/hero.tsx`
- `src/components/background-model-canvas.tsx`

Do not change:

- `public/models/background-model.glb`
- `next.config.ts` (`output: "export"`, production `basePath` `/gip-oko-landing`)
- package.json dependencies

---

### Task 1: Demo URL helper and static content

**Files:**
- Create: `src/lib/demo-url.ts`
- Create: `src/content/landing.ts`

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_DEMO_URL` and `process.env.NODE_ENV` from the App Router server tree.
- Produces:
  - `export type DemoConfig = { status: "ready"; href: string } | { status: "unavailable" }`
  - `export function isValidDemoUrl(value: string): boolean`
  - `export function resolveDemoUrl(raw: string | undefined, nodeEnv: string): DemoConfig`
  - `export const landing` typed object with every required Russian string used by later tasks.

- [ ] **Step 1: Record the failing product condition**

From the repository root, search the current page for obsolete copy:

```powershell
Select-String -Path src/app/page.tsx,src/components/hero.tsx,src/app/layout.tsx -Pattern "AGENTIC|AI Core|Launch the demo|AI-процессов"
```

Expected: matches exist. That is the failing baseline. Do not edit those files in this task.

- [ ] **Step 2: Write `src/lib/demo-url.ts`**

```ts
export type DemoConfig =
  | { status: "ready"; href: string }
  | { status: "unavailable" };

export function isValidDemoUrl(value: string): boolean {
  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    trimmed === "#" ||
    trimmed.toLowerCase().startsWith("javascript:") ||
    trimmed === "/demo" ||
    trimmed.startsWith("/demo?") ||
    trimmed.startsWith("/demo#")
  ) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveDemoUrl(
  raw: string | undefined,
  nodeEnv: string,
): DemoConfig {
  void nodeEnv;

  if (typeof raw === "string" && isValidDemoUrl(raw)) {
    return { status: "ready", href: raw.trim() };
  }

  return { status: "unavailable" };
}
```

`nodeEnv` is accepted so later release logic can distinguish environments without changing call sites. Do not throw. A missing URL in `next build` must yield `unavailable`.

- [ ] **Step 3: Write `src/content/landing.ts`**

Copy must match the spec character-for-character, including «ё» and quotation marks.

```ts
export const landing = {
  brand: "ГИП «Око»",
  skip: "Перейти к содержимому",
  metadata: {
    title: "ГИП «Око» — геоинформационная платформа для анализа территории",
    description:
      "Растры, векторные слои, рельеф и 3D-модели в едином пространственном контексте. Откройте демонстрацию ГИП «Око».",
  },
  nav: [
    { href: "#data", label: "Данные" },
    { href: "#workflow", label: "Сценарий" },
    { href: "#tools", label: "Инструменты" },
  ],
  cta: {
    label: "Запустить демонстрацию",
    unavailable: "Демонстрационная версия готовится к публикации.",
  },
  hero: {
    productName: "ГИП «Око»",
    title: "Территория в едином пространственном контексте",
    definition:
      "ГИП «Око» — промышленная геоинформационная платформа для совместной работы с растрами, векторными слоями, рельефом и 3D-моделями в браузере.",
    result:
      "Сопоставляйте данные из разных источников, выполняйте измерения и изучайте территорию в 3D, не переключаясь между разрозненными инструментами.",
    supporting: "Откройте проект, сравните слои и исследуйте территорию в 3D.",
  },
  spatial: {
    id: "data",
    title: "Разные данные. Одна территория.",
    intro:
      "Растры, векторные слои, рельеф и 3D-модели сохраняют взаимное положение в одном проекте. Специалист видит общую обстановку и управляет представлением данных, не переключаясь между разрозненными инструментами.",
    groups: [
      {
        title: "Растры",
        body: "Снимки и картографические материалы можно накладывать, настраивать и сравнивать.",
      },
      {
        title: "Векторные слои",
        body: "Границы и тематические объекты отображаются в том же пространственном контексте.",
      },
      {
        title: "Рельеф",
        body: "Высоты, горизонтали и гипсометрическая раскраска помогают оценивать местность.",
      },
      {
        title: "3D-модели",
        body: "Объёмные объекты дополняют карту там, где плоского представления недостаточно.",
      },
    ],
    closing:
      "Видимость, порядок и прозрачность слоёв настраиваются внутри одного рабочего пространства.",
  },
  workflow: {
    id: "workflow",
    title: "От запроса к пространственной картине",
    intro:
      "Основной сценарий проходит от поиска территории до проверки результата в объёмном представлении.",
    previous: "Назад",
    next: "Далее",
    progress: (current: number, total: number) => `Шаг ${current} из ${total}`,
    screenshotNote:
      "Скриншот продукта будет добавлен после согласования материалов.",
    keyboardHint:
      "Клавиши стрелок переключают шаги, когда фокус внутри блока сценария.",
    steps: [
      {
        title: "Найдите территорию",
        body: "Перейдите к нужному району по названию или координатам.",
        frameLabel: "Экран 1. Поиск территории",
      },
      {
        title: "Откройте проект",
        body: "Просмотрите структуру слоёв и выберите данные для текущей задачи.",
        frameLabel: "Экран 2. Открытие проекта",
      },
      {
        title: "Сопоставьте материалы",
        body: "Измените видимость, порядок или прозрачность слоёв и сравните перекрывающиеся растры.",
        frameLabel: "Экран 3. Сопоставление материалов",
      },
      {
        title: "Выполните действие",
        body: "Измерьте расстояние или площадь либо нанесите пользовательский объект.",
        frameLabel: "Экран 4. Измерение или объект",
      },
      {
        title: "Осмотрите результат в 3D",
        body: "Оцените рельеф и объекты в объёме, затем вернитесь к 2D или 2.5D.",
        frameLabel: "Экран 5. Осмотр в 3D",
      },
    ],
  },
  comparison: {
    title: "Сравнивайте слои в одном положении",
    body: "Режим «шторки» помогает визуально сопоставить перекрывающиеся растры. Прозрачность и параметры отображения позволяют проверить различия, не теряя пространственный контекст.",
    points: [
      "Перемещайте границу между двумя растровыми материалами.",
      "Изменяйте прозрачность выбранного слоя.",
      "Настраивайте яркость, контрастность, оттенок, насыщенность и гамму.",
    ],
    materialA: "Материал A",
    materialB: "Материал B",
    synthetic: "Иллюстрация на синтетических данных.",
  },
  tools: {
    id: "tools",
    title: "Инструменты по задаче",
    intro:
      "Выберите территорию, зафиксируйте наблюдение, выполните расчёт и перейдите к объёмному осмотру в том же рабочем пространстве.",
    groups: [
      {
        title: "Найти территорию",
        items: [
          "Ищите по координатам, странам, областям и городам.",
          "Проверяйте координаты и высоту рельефа под курсором.",
          "Работайте в системах координат WGS-84, СК-42 и ПЗ-90.11.",
        ],
      },
      {
        title: "Нанести объекты",
        items: [
          "Добавляйте точки, линии, прямоугольники, окружности, полигоны, текст и фотографии.",
          "Собирайте пользовательские объекты в именованные коллекции.",
          "Импортируйте и экспортируйте KML/KMZ.",
        ],
      },
      {
        title: "Выполнить измерение",
        items: [
          "Измеряйте расстояние, длину линии и площадь непосредственно на карте.",
        ],
      },
      {
        title: "Исследовать рельеф и 3D",
        items: [
          "Используйте гипсометрическую раскраску и горизонтали.",
          "Выполняйте круговой облёт вокруг выбранной точки и переходите к виду из заданной точки.",
          "Размещайте и настраивайте 3D-модели и объёмные зоны в форме купола.",
        ],
      },
    ],
  },
  compatibility: {
    title: "Данные и системы координат",
    intro:
      "Платформа работает с подтверждённым набором геопространственных сервисов, форматов и систем координат.",
    items: [
      "Сервисы: WMTS 1.0.0, WCS 2.0.1",
      "Форматы: BIR, GPKG, KML/KMZ",
      "Рельеф: .terrain",
      "Системы координат: WGS-84, СК-42, ПЗ-90.11",
    ],
  },
  demoScenario: {
    title: "Что можно проверить в демонстрации",
    intro:
      "Демонстрационная среда позволяет пройти основной сценарий работы с геопространственными данными.",
    items: [
      "Найти территорию по названию или координатам.",
      "Открыть проект с разными типами пространственных данных.",
      "Сопоставить перекрывающиеся слои и изменить их представление.",
      "Выполнить измерение или нанести пользовательский объект.",
      "Перейти к 3D-представлению и вернуться к плоскому виду.",
    ],
  },
  finalCta: {
    title: "Откройте рабочий сценарий ГИП «Око»",
    body: "Перейдите в демонстрационную среду, откройте проект и проверьте основные инструменты на пространственных данных.",
  },
} as const;

export type LandingContent = typeof landing;
```

- [ ] **Step 4: Verify the helper cases by reading the module**

Confirm in `src/lib/demo-url.ts`:

- `undefined` / `""` / `"#"` / `"javascript:alert(1)"` / `"/demo"` → not valid
- `"https://example.org/app"` → valid
- `resolveDemoUrl(undefined, "production")` returns `{ status: "unavailable" }`

Expected: those branches exist. No `.env` file is created.

- [ ] **Step 5: Review checkpoint**

Do not git add or commit. Confirm the two new files exist and contain the exact CTA strings `Запустить демонстрацию` and `Демонстрационная версия готовится к публикации.`

---

### Task 2: Golos Text, metadata, and visual tokens

**Files:**
- Create: `src/fonts/OFL.txt`
- Create: `src/fonts/golos-text-cyrillic-wght-normal.woff2`
- Create: `src/fonts/golos-text-latin-wght-normal.woff2`
- Replace: `src/app/layout.tsx`
- Replace: `src/app/globals.css`

**Interfaces:**
- Consumes: `landing.metadata` from Task 1.
- Produces: `html lang="ru"`, Golos Text on `body` via `next/font/local`, CSS tokens Abyss `#05070B`, Instrument `#0D1420`, Frost `#ECF6F7`, Muted Steel `#8FA1AB`, Signal Cyan `#58E8F4`, Restrained Violet `#7466C9`.

- [ ] **Step 1: Vendor the OFL font files locally**

Create `src/fonts/`. Download and save:

1. `https://raw.githubusercontent.com/googlefonts/golos-text/main/OFL.txt` → `src/fonts/OFL.txt`
2. `https://cdn.jsdelivr.net/npm/@fontsource-variable/golos-text@5.2.5/files/golos-text-cyrillic-wght-normal.woff2` → `src/fonts/golos-text-cyrillic-wght-normal.woff2`
3. `https://cdn.jsdelivr.net/npm/@fontsource-variable/golos-text@5.2.5/files/golos-text-latin-wght-normal.woff2` → `src/fonts/golos-text-latin-wght-normal.woff2`

If 5.2.5 returns 404, use the newest 5.x files listed by that npm package. Do not add the npm package as a runtime dependency. Do not link Google Fonts in `layout.tsx`.

PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path src/fonts | Out-Null
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/googlefonts/golos-text/main/OFL.txt" -OutFile "src/fonts/OFL.txt"
Invoke-WebRequest -UseBasicParsing -Uri "https://cdn.jsdelivr.net/npm/@fontsource-variable/golos-text@5.2.5/files/golos-text-cyrillic-wght-normal.woff2" -OutFile "src/fonts/golos-text-cyrillic-wght-normal.woff2"
Invoke-WebRequest -UseBasicParsing -Uri "https://cdn.jsdelivr.net/npm/@fontsource-variable/golos-text@5.2.5/files/golos-text-latin-wght-normal.woff2" -OutFile "src/fonts/golos-text-latin-wght-normal.woff2"
Get-Item src/fonts/* | Select-Object Name, Length
```

Expected: `OFL.txt` is non-empty; both WOFF2 files are larger than 10 KB.

If Auto-review blocks `Invoke-WebRequest`, stop and ask Evgeniy to approve the download. Do not substitute Inter, Segoe UI, or a remote `@import`.

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { landing } from "@/content/landing";
import "./globals.css";

const golosText = localFont({
  src: [
    {
      path: "../fonts/golos-text-cyrillic-wght-normal.woff2",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "../fonts/golos-text-latin-wght-normal.woff2",
      weight: "400 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-golos",
  preload: true,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: landing.metadata.title,
  description: landing.metadata.description,
  applicationName: landing.brand,
  openGraph: {
    title: landing.metadata.title,
    description: landing.metadata.description,
    type: "website",
    locale: "ru_RU",
    siteName: landing.brand,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={golosText.variable}>
      <body className={golosText.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `src/app/globals.css`**

This file is the page design system. Later tasks add section rules at the end; do not reintroduce mono telemetry, all-caps labels, or glow-on-every-cyan.

```css
@import "tailwindcss";

:root {
  --abyss: #05070b;
  --instrument: #0d1420;
  --frost: #ecf6f7;
  --muted: #8fa1ab;
  --cyan: #58e8f4;
  --violet: #7466c9;
  --line: rgb(236 246 247 / 0.14);
  --font-sans: var(--font-golos), "Segoe UI", Arial, sans-serif;
  --content: 1280px;
  --gutter: 32px;
  --gap: 24px;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--abyss);
  scroll-behavior: smooth;
}

body {
  min-width: 320px;
  margin: 0;
  background: var(--abyss);
  color: var(--frost);
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.62;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
}

.skip-link {
  position: absolute;
  z-index: 8;
  top: 12px;
  left: 12px;
  padding: 10px 14px;
  background: var(--instrument);
  color: var(--frost);
  transform: translateY(-160%);
}

.skip-link:focus {
  transform: none;
}

.page-shell {
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
}

.page-shell::before {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 12%, rgb(88 232 244 / 0.05), transparent 22%),
    radial-gradient(circle at 78% 18%, rgb(116 102 201 / 0.07), transparent 28%),
    var(--abyss);
  content: "";
}

.star-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 12% 22%, rgb(236 246 247 / 0.55), transparent),
    radial-gradient(1px 1px at 28% 64%, rgb(236 246 247 / 0.35), transparent),
    radial-gradient(1.5px 1.5px at 61% 18%, rgb(236 246 247 / 0.4), transparent),
    radial-gradient(1px 1px at 81% 48%, rgb(236 246 247 / 0.28), transparent),
    radial-gradient(1px 1px at 44% 82%, rgb(236 246 247 / 0.22), transparent),
    radial-gradient(1px 1px at 9% 88%, rgb(236 246 247 / 0.18), transparent);
}

.wrap {
  width: min(100% - (var(--gutter) * 2), var(--content));
  margin-inline: auto;
}

.site-header {
  display: grid;
  min-height: 72px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--line);
}

.brand {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 28px;
}

.site-nav a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: var(--muted);
}

.site-nav a:hover {
  color: var(--frost);
}

.demo-link {
  display: inline-flex;
  min-height: 44px;
  min-width: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid rgb(88 232 244 / 0.7);
  background: var(--cyan);
  color: var(--abyss);
  font-weight: 650;
  letter-spacing: -0.02em;
}

.demo-link:hover {
  background: #8df2fa;
}

.demo-link.is-disabled {
  background: var(--instrument);
  border-color: var(--line);
  color: var(--muted);
}

.demo-unavailable {
  display: grid;
  gap: 8px;
  justify-items: start;
}

.demo-unavailable-note {
  max-width: 36ch;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.45;
}

.section {
  padding-block: 128px;
}

.section-heading {
  max-width: 18ch;
  margin: 0;
  font-size: clamp(2.25rem, 4.5vw, 4.75rem);
  font-weight: 560;
  letter-spacing: -0.055em;
  line-height: 1.02;
}

.lede,
.copy {
  max-width: 68ch;
  color: var(--muted);
}

.hero {
  position: relative;
  display: grid;
  min-height: 100dvh;
  grid-template-columns: minmax(0, 0.92fr) minmax(280px, 1.08fr);
  align-items: center;
  gap: var(--gap);
  padding-top: 28px;
  padding-bottom: 72px;
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 40rem;
}

.hero-name {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 1rem;
  font-weight: 500;
}

.hero h1 {
  margin: 0;
  font-size: clamp(3.25rem, 7vw, 7rem);
  font-weight: 580;
  letter-spacing: -0.07em;
  line-height: 0.95;
}

.hero-definition,
.hero-result {
  margin: 22px 0 0;
  max-width: 62ch;
}

.hero-definition {
  color: var(--frost);
  font-size: 1.125rem;
  line-height: 1.55;
}

.hero-result,
.hero-supporting {
  color: var(--muted);
}

.hero-actions {
  display: grid;
  gap: 12px;
  margin-top: 36px;
  justify-items: start;
}

.hero-visual {
  position: relative;
  z-index: 1;
  min-height: min(68vh, 640px);
  pointer-events: none;
}

.hero-visual > * {
  pointer-events: auto;
}

.background-model-canvas {
  position: absolute !important;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  touch-action: pan-y;
}

.hero-visual-fallback {
  position: absolute;
  inset: 12% 8%;
  border: 1px solid var(--line);
  background:
    radial-gradient(circle at 50% 45%, rgb(88 232 244 / 0.08), transparent 42%),
    var(--instrument);
}

.spatial-layout,
.comparison-layout,
.demo-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.42fr) minmax(0, 0.58fr);
  gap: 48px;
  align-items: start;
}

.spatial-groups {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: auto auto;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
}

.spatial-groups article {
  margin: 0;
  padding: 28px 24px;
  background: var(--instrument);
}

.spatial-groups article:first-child {
  grid-row: span 2;
}

.spatial-groups h3,
.tool-group h3 {
  margin: 0 0 12px;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 560;
  letter-spacing: -0.03em;
}

.workflow-static {
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 28px;
}

.workflow-static li {
  display: grid;
  gap: 8px;
  max-width: 72ch;
}

.workflow-step-index {
  color: var(--cyan);
  font-size: 0.875rem;
}

.workflow-slider {
  display: none;
}

.media-frame {
  display: grid;
  min-height: 240px;
  place-content: end start;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--instrument);
}

.media-frame p {
  margin: 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.comparison-evidence {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 280px;
  border: 1px solid var(--line);
  background: var(--instrument);
}

.comparison-pane {
  position: relative;
  min-height: 280px;
  padding: 18px;
}

.comparison-pane:first-child {
  background: linear-gradient(160deg, rgb(88 232 244 / 0.16), rgb(13 20 32 / 0.2) 55%);
}

.comparison-pane:last-child {
  background: linear-gradient(200deg, rgb(116 102 201 / 0.28), rgb(13 20 32 / 0.2) 60%);
  box-shadow: inset 1px 0 0 var(--line);
}

.comparison-pane span {
  color: var(--frost);
  font-size: 0.95rem;
}

.comparison-caption {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.tools-layout {
  display: grid;
  gap: 1px;
  margin-top: 48px;
  background: var(--line);
  border: 1px solid var(--line);
}

.tool-group {
  padding: 28px 24px;
  background: var(--abyss);
}

.tool-group:first-child {
  background: var(--instrument);
}

.tool-group:nth-child(2),
.tool-group:nth-child(3) {
  display: grid;
  grid-template-columns: subgrid;
}

.tools-layout {
  grid-template-columns: 1.15fr 0.85fr;
}

.tool-group:first-child,
.tool-group:nth-child(4) {
  grid-column: 1 / -1;
}

.tool-group ul,
.demo-list,
.compat-list,
.comparison-points {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--muted);
}

.compat-list {
  display: grid;
  gap: 12px;
  margin-top: 36px;
  padding: 0;
  list-style: none;
  max-width: 72ch;
}

.compat-list li {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  color: var(--frost);
}

.final-cta .section-heading {
  max-width: 16ch;
}

.site-footer {
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.875rem;
}

.site-footer .wrap {
  padding-block: 28px;
}

@media (max-width: 760px) {
  :root {
    --gutter: 18px;
  }

  .section {
    padding-block: 80px;
  }

  .site-header {
    min-height: 64px;
    padding-block: 10px;
    grid-template-columns: 1fr auto;
  }

  .site-nav {
    grid-column: 1 / -1;
    justify-content: start;
    order: 3;
  }

  .hero {
    min-height: auto;
    grid-template-columns: 1fr;
    padding-bottom: 48px;
  }

  .hero-visual {
    min-height: 390px;
    order: 2;
  }

  .spatial-layout,
  .comparison-layout,
  .demo-layout,
  .spatial-groups,
  .tools-layout,
  .comparison-evidence {
    grid-template-columns: 1fr;
  }

  .spatial-groups article:first-child,
  .tool-group:first-child,
  .tool-group:nth-child(4) {
    grid-column: auto;
    grid-row: auto;
  }

  .workflow-slider {
    display: none !important;
  }
}

@media (min-width: 761px) {
  .workflow-has-slider .workflow-static {
    display: none;
  }

  .workflow-has-slider .workflow-slider {
    display: grid;
    gap: 24px;
    margin-top: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Confirm obsolete metadata is gone from the layout**

```powershell
Select-String -Path src/app/layout.tsx -Pattern "agentic|AI-процессов|Every AI workflow"
```

Expected: no matches. `lang="ru"` and the spec title string are present.

- [ ] **Step 5: Review checkpoint**

Do not commit. Fonts are local. No Google Fonts `<link>`.

---

### Task 3: Shared CTA, headings, and media frames

**Files:**
- Create: `src/components/landing/demo-link.tsx`
- Create: `src/components/landing/section-heading.tsx`
- Create: `src/components/landing/media-placeholder.tsx`

**Interfaces:**
- Consumes: `DemoConfig` from `src/lib/demo-url.ts`; `landing.cta` and `landing.workflow.screenshotNote` from `src/content/landing.ts`.
- Produces:
  - `export function DemoLink(props: { demo: DemoConfig; className?: string })`
  - `export function SectionHeading(props: { id: string; children: string })`
  - `export function MediaPlaceholder(props: { label: string })`

- [ ] **Step 1: Write the three primitives**

`src/components/landing/demo-link.tsx`:

```tsx
import type { DemoConfig } from "@/lib/demo-url";
import { landing } from "@/content/landing";

type DemoLinkProps = {
  demo: DemoConfig;
  className?: string;
};

export function DemoLink({ demo, className }: DemoLinkProps) {
  const label = landing.cta.label;

  if (demo.status === "ready") {
    return (
      <a className={className ?? "demo-link"} href={demo.href}>
        {label}
      </a>
    );
  }

  return (
    <div className="demo-unavailable">
      <span className="demo-link is-disabled" aria-disabled="true">
        {label}
      </span>
      <span className="demo-unavailable-note">{landing.cta.unavailable}</span>
    </div>
  );
}
```

`src/components/landing/section-heading.tsx`:

```tsx
type SectionHeadingProps = {
  id: string;
  children: string;
};

export function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h2 id={id} className="section-heading">
      {children}
    </h2>
  );
}
```

`src/components/landing/media-placeholder.tsx`:

```tsx
import { landing } from "@/content/landing";

type MediaPlaceholderProps = {
  label: string;
};

export function MediaPlaceholder({ label }: MediaPlaceholderProps) {
  return (
    <figure className="media-frame">
      <figcaption>
        <p>{label}</p>
        <p>{landing.workflow.screenshotNote}</p>
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 2: Confirm there is no `<a>` in the unavailable CTA**

The disabled branch must not render `href`. The visible label remains `Запустить демонстрацию`. `SectionHeading` must not render an eyebrow.

- [ ] **Step 3: Review checkpoint**

Do not commit.

---

### Task 4: Header, footer, and page landmarks

**Files:**
- Create: `src/components/landing/site-header.tsx`
- Create: `src/components/landing/site-footer.tsx`
- Replace: `src/app/page.tsx`

**Interfaces:**
- Consumes: `DemoLink`, `landing.brand`, `landing.nav`, `landing.skip`, `resolveDemoUrl`.
- Produces: skip link to `#main-content`; header with brand, three anchors, shared CTA; footer with only `ГИП «Око»`. Temporary `page.tsx` still hosts old sections until later tasks delete them, but the chrome must already be correct.

- [ ] **Step 1: Write header and footer**

`src/components/landing/site-header.tsx`:

```tsx
import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";
import { DemoLink } from "@/components/landing/demo-link";

type SiteHeaderProps = {
  demo: DemoConfig;
};

export function SiteHeader({ demo }: SiteHeaderProps) {
  return (
    <header className="site-header wrap">
      <a className="brand" href="#top">
        {landing.brand}
      </a>
      <nav className="site-nav" aria-label="Разделы страницы">
        {landing.nav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <DemoLink demo={demo} />
    </header>
  );
}
```

`src/components/landing/site-footer.tsx`:

```tsx
import { landing } from "@/content/landing";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">{landing.brand}</div>
    </footer>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx` with the shell only**

Remove the old AI Core sections in this task. The page will grow section by section after this. A page with header, empty main, and footer is the intended intermediate state.

```tsx
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { landing } from "@/content/landing";
import { resolveDemoUrl } from "@/lib/demo-url";

export default function Home() {
  const demo = resolveDemoUrl(
    process.env.NEXT_PUBLIC_DEMO_URL,
    process.env.NODE_ENV,
  );

  return (
    <div className="page-shell" id="top">
      <div className="star-layer" aria-hidden="true" />
      <a className="skip-link" href="#main-content">
        {landing.skip}
      </a>
      <SiteHeader demo={demo} />
      <main id="main-content"></main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 3: Run lint**

```powershell
npm run lint
```

Expected: pass. If `hero.tsx` is unused, lint may warn; delete `src/components/hero.tsx` and `src/components/background-model-canvas.tsx` only after Task 6 rehomes the canvas. If lint fails on unused files, keep them until Task 6 and ignore unused-export warnings only if ESLint currently errors. If ESLint errors on unused `hero.tsx`, delete it in Task 6 immediately after the new canvas works, not before.

If `npm run lint` fails because `hero.tsx` is unused: leave `page.tsx` as above and move Task 5+6 next without restoring AI copy.

- [ ] **Step 4: Review checkpoint**

Do not commit. Confirm footer text is only `ГИП «Око»`.

---

### Task 5: Hero copy as a Server Component

**Files:**
- Create: `src/components/landing/hero-section.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `DemoLink`, `landing.hero`, `DemoConfig`.
- Produces: `export function HeroSection(props: { demo: DemoConfig })` — Server Component, one `h1`, visual slot for Task 6.

- [ ] **Step 1: Write `src/components/landing/hero-section.tsx`**

Do not add `"use client"`.

```tsx
import { DemoLink } from "@/components/landing/demo-link";
import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";

type HeroSectionProps = {
  demo: DemoConfig;
};

export function HeroSection({ demo }: HeroSectionProps) {
  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-name">{landing.hero.productName}</p>
        <h1 id="hero-title">{landing.hero.title}</h1>
        <p className="hero-definition">{landing.hero.definition}</p>
        <p className="hero-result">{landing.hero.result}</p>
        <div className="hero-actions">
          <DemoLink demo={demo} />
          <p className="hero-supporting">{landing.hero.supporting}</p>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-visual-fallback" />
      </div>
    </section>
  );
}
```

Do not import `HeroModel` yet. Task 6 adds it.

- [ ] **Step 2: Render the hero inside `main`**

```tsx
import { HeroSection } from "@/components/landing/hero-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { landing } from "@/content/landing";
import { resolveDemoUrl } from "@/lib/demo-url";

export default function Home() {
  const demo = resolveDemoUrl(
    process.env.NEXT_PUBLIC_DEMO_URL,
    process.env.NODE_ENV,
  );

  return (
    <div className="page-shell" id="top">
      <div className="star-layer" aria-hidden="true" />
      <a className="skip-link" href="#main-content">
        {landing.skip}
      </a>
      <SiteHeader demo={demo} />
      <main id="main-content">
        <HeroSection demo={demo} />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 3: Review checkpoint**

Hero copy is complete without the canvas. DOM order is text then visual. No eyebrow, no English slogan.

---

### Task 6: Hero model island and Blender-parity canvas

**Files:**
- Create: `src/components/landing/hero-model.tsx`
- Create: `src/components/landing/background-model-canvas.tsx`
- Delete: `src/components/hero.tsx`
- Delete: `src/components/background-model-canvas.tsx`

**Interfaces:**
- Consumes: `public/models/background-model.glb`, `process.env.NEXT_PUBLIC_BASE_PATH`.
- Produces: `export function HeroModel()` client wrapper; `export function BackgroundModelCanvas(props: { onReady: () => void })`.

- [ ] **Step 1: Write `src/components/landing/hero-model.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const BackgroundModelCanvas = dynamic(
  () =>
    import("./background-model-canvas").then(
      (module) => module.BackgroundModelCanvas,
    ),
  { ssr: false },
);

type SceneBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type SceneBoundaryState = {
  failed: boolean;
};

class SceneBoundary extends Component<
  SceneBoundaryProps,
  SceneBoundaryState
> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) {
      return null;
    }

    return this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export function HeroModel() {
  const webGLAvailable = useSyncExternalStore(
    () => () => undefined,
    supportsWebGL,
    () => false,
  );
  const [sceneFailed, setSceneFailed] = useState(false);
  const handleReady = useCallback(() => undefined, []);
  const handleError = useCallback(() => setSceneFailed(true), []);

  if (!webGLAvailable || sceneFailed) {
    return null;
  }

  return (
    <SceneBoundary onError={handleError}>
      <BackgroundModelCanvas onReady={handleReady} />
    </SceneBoundary>
  );
}
```

No WebGL error copy. The CSS fallback in `HeroSection` remains.

- [ ] **Step 2: Write `src/components/landing/background-model-canvas.tsx`**

Keep the current light rig, AgX, sRGB, exposure `0.8`, `dpr={[1, 1.5]}`, `Center`, and `MODEL_URL`. Remove idle orbit. Use `frameloop="demand"`. Invalidate on fine-pointer move only. Pause when hidden or off-screen.

```tsx
"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useRef,
  useSyncExternalStore,
  type MutableRefObject,
} from "react";
import {
  AgXToneMapping,
  Group,
  MathUtils,
  SRGBColorSpace,
} from "three";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MODEL_URL = `${BASE_PATH}/models/background-model.glb`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(pointer: fine)";

type BackgroundModelCanvasProps = {
  onReady: () => void;
};

type FlagRef = MutableRefObject<boolean>;

function subscribeQuery(query: string) {
  return (onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeQuery(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function Model({
  onReady,
  reducedMotion,
  finePointer,
  visibleRef,
  hiddenRef,
}: BackgroundModelCanvasProps & {
  reducedMotion: boolean;
  finePointer: boolean;
  visibleRef: FlagRef;
  hiddenRef: FlagRef;
}) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, onReady]);

  useFrame((state) => {
    if (
      !group.current ||
      reducedMotion ||
      !finePointer ||
      !visibleRef.current ||
      hiddenRef.current
    ) {
      return;
    }

    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.045,
      0.08,
    );
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      -0.28 + state.pointer.x * 0.07,
      0.08,
    );
  });

  return (
    <group ref={group} rotation={[0, -0.28, 0]}>
      <Center>
        <primitive object={scene} dispose={null} />
      </Center>
    </group>
  );
}

function PointerDemand({
  enabled,
  visibleRef,
  hiddenRef,
}: {
  enabled: boolean;
  visibleRef: FlagRef;
  hiddenRef: FlagRef;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMove = () => {
      if (visibleRef.current && !hiddenRef.current) {
        invalidate();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, hiddenRef, invalidate, visibleRef]);

  return null;
}

export function BackgroundModelCanvas({ onReady }: BackgroundModelCanvasProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const visibleRef = useRef(true);
  const hiddenRef = useRef(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    observer.observe(node);

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={hostRef} className="background-model-host">
      <Canvas
        className="background-model-canvas"
        camera={{ position: [0, 0, 4.5], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, invalidate }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 0.8;
          invalidate();
        }}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#d9faff", "#080914", 1.45]} />
        <directionalLight
          color="#bdf8ff"
          intensity={2.6}
          position={[3.5, 4, 5]}
        />
        <pointLight color="#7658ff" intensity={8} position={[-3, -1.5, 2]} />
        <Suspense fallback={null}>
          <PointerDemand
            enabled={finePointer && !reducedMotion}
            visibleRef={visibleRef}
            hiddenRef={hiddenRef}
          />
          <Model
            onReady={onReady}
            reducedMotion={reducedMotion}
            finePointer={finePointer}
            visibleRef={visibleRef}
            hiddenRef={hiddenRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
```

Add to `src/app/globals.css`:

```css
.background-model-host {
  position: absolute;
  inset: 0;
}
```

Then in `src/components/landing/hero-section.tsx` import `HeroModel` and render it inside `.hero-visual` after the fallback:

```tsx
import { HeroModel } from "@/components/landing/hero-model";
```

```tsx
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-visual-fallback" />
        <HeroModel />
      </div>
```

- [ ] **Step 3: Delete the old hero files**

Delete `src/components/hero.tsx` and `src/components/background-model-canvas.tsx`. Grep must find no `AiCoreCanvas` and no `AGENTIC RUNTIME`.

- [ ] **Step 4: Run lint**

```powershell
npm run lint
```

Expected: pass.

- [ ] **Step 5: Review checkpoint**

No `baseRotation.current +=`. Canvas lives under `src/components/landing/`. `useGLTF.preload` is only inside the dynamically imported canvas module.

---

### Task 7: Spatial context through final CTA

**Files:**
- Create: `src/components/landing/spatial-context-section.tsx`
- Create: `src/components/landing/workflow-section.tsx`
- Create: `src/components/landing/workflow-slider.tsx`
- Create: `src/components/landing/layer-comparison-section.tsx`
- Create: `src/components/landing/analysis-tools-section.tsx`
- Create: `src/components/landing/compatibility-section.tsx`
- Create: `src/components/landing/demo-scenario-section.tsx`
- Create: `src/components/landing/final-cta-section.tsx`
- Replace: `src/app/page.tsx`

**Interfaces:**
- Consumes: `landing.*`, `SectionHeading`, `MediaPlaceholder`, `DemoLink`, `DemoConfig`.
- Produces: the remaining seven sections in spec order. `WorkflowSlider` is the only additional client component.

- [ ] **Step 1: Write `src/components/landing/spatial-context-section.tsx`**

```tsx
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function SpatialContextSection() {
  return (
    <section className="section wrap" id={landing.spatial.id} aria-labelledby="spatial-title">
      <div className="spatial-layout">
        <div>
          <SectionHeading id="spatial-title">{landing.spatial.title}</SectionHeading>
          <p className="lede">{landing.spatial.intro}</p>
          <p className="copy">{landing.spatial.closing}</p>
        </div>
        <div className="spatial-groups">
          {landing.spatial.groups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write workflow files**

`src/components/landing/workflow-slider.tsx`:

```tsx
"use client";

import { useId, useState } from "react";
import { MediaPlaceholder } from "@/components/landing/media-placeholder";
import { landing } from "@/content/landing";

const steps = landing.workflow.steps;

export function WorkflowSlider() {
  const [index, setIndex] = useState(0);
  const statusId = useId();
  const hintId = useId();
  const step = steps[index];
  const total = steps.length;

  if (!step) {
    return null;
  }

  const go = (next: number) => {
    setIndex((current) => {
      const target = current + next;
      if (target < 0 || target >= total) {
        return current;
      }
      return target;
    });
  };

  return (
    <div
      className="workflow-slider"
      role="group"
      aria-roledescription="Карусель"
      aria-labelledby="workflow-title"
      aria-describedby={`${hintId} ${statusId}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
      }}
    >
      <p id={hintId}>{landing.workflow.keyboardHint}</p>
      <p id={statusId} aria-live="polite">
        {landing.workflow.progress(index + 1, total)}
      </p>
      <MediaPlaceholder label={step.frameLabel} />
      <h3>{step.title}</h3>
      <p className="copy">{step.body}</p>
      <div className="hero-actions">
        <button type="button" className="step-button" onClick={() => go(-1)} disabled={index === 0}>
          {landing.workflow.previous}
        </button>
        <button
          type="button"
          className="step-button"
          onClick={() => go(1)}
          disabled={index === total - 1}
        >
          {landing.workflow.next}
        </button>
      </div>
    </div>
  );
}
```

Add to `src/app/globals.css`:

```css
.step-button {
  display: inline-flex;
  min-height: 44px;
  min-width: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid var(--line);
  background: var(--instrument);
  color: var(--frost);
  font: inherit;
}

.step-button:disabled {
  color: var(--muted);
}
```

`src/components/landing/workflow-section.tsx`:

```tsx
import { MediaPlaceholder } from "@/components/landing/media-placeholder";
import { SectionHeading } from "@/components/landing/section-heading";
import { WorkflowSlider } from "@/components/landing/workflow-slider";
import { landing } from "@/content/landing";

export function WorkflowSection() {
  return (
    <section
      className="section wrap workflow-has-slider"
      id={landing.workflow.id}
      aria-labelledby="workflow-title"
    >
      <SectionHeading id="workflow-title">{landing.workflow.title}</SectionHeading>
      <p className="lede">{landing.workflow.intro}</p>
      <ol className="workflow-static">
        {landing.workflow.steps.map((step, index) => (
          <li key={step.title}>
            <span className="workflow-step-index">
              {landing.workflow.progress(index + 1, landing.workflow.steps.length)}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <MediaPlaceholder label={step.frameLabel} />
          </li>
        ))}
      </ol>
      <WorkflowSlider />
    </section>
  );
}
```

The ordered list stays in the document for no-JS and for viewports `<= 760px`. CSS from Task 2 hides it only when `.workflow-has-slider` and `min-width: 761px`.

- [ ] **Step 3: Write the remaining sections**

`src/components/landing/layer-comparison-section.tsx`:

```tsx
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function LayerComparisonSection() {
  return (
    <section className="section wrap" aria-labelledby="comparison-title">
      <div className="comparison-layout">
        <div>
          <SectionHeading id="comparison-title">
            {landing.comparison.title}
          </SectionHeading>
          <p className="lede">{landing.comparison.body}</p>
          <ul className="comparison-points">
            {landing.comparison.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <figure>
          <div className="comparison-evidence" aria-hidden="true">
            <div className="comparison-pane">
              <span>{landing.comparison.materialA}</span>
            </div>
            <div className="comparison-pane">
              <span>{landing.comparison.materialB}</span>
            </div>
          </div>
          <figcaption className="comparison-caption">
            {landing.comparison.synthetic}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
```

Labels `Материал A` and `Материал B` remain visible to AT through the figcaption plus visually present text. Do not add range inputs or drag handles.

`src/components/landing/analysis-tools-section.tsx`:

```tsx
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function AnalysisToolsSection() {
  return (
    <section className="section wrap" id={landing.tools.id} aria-labelledby="tools-title">
      <SectionHeading id="tools-title">{landing.tools.title}</SectionHeading>
      <p className="lede">{landing.tools.intro}</p>
      <div className="tools-layout">
        {landing.tools.groups.map((group) => (
          <article className="tool-group" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
```

`src/components/landing/compatibility-section.tsx`:

```tsx
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function CompatibilitySection() {
  return (
    <section className="section wrap" aria-labelledby="compat-title">
      <SectionHeading id="compat-title">{landing.compatibility.title}</SectionHeading>
      <p className="lede">{landing.compatibility.intro}</p>
      <ul className="compat-list">
        {landing.compatibility.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
```

`src/components/landing/demo-scenario-section.tsx`:

```tsx
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";

export function DemoScenarioSection() {
  return (
    <section className="section wrap" aria-labelledby="demo-scenario-title">
      <div className="demo-layout">
        <SectionHeading id="demo-scenario-title">
          {landing.demoScenario.title}
        </SectionHeading>
        <div>
          <p className="lede">{landing.demoScenario.intro}</p>
          <ul className="demo-list">
            {landing.demoScenario.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

`src/components/landing/final-cta-section.tsx`:

```tsx
import { DemoLink } from "@/components/landing/demo-link";
import { SectionHeading } from "@/components/landing/section-heading";
import { landing } from "@/content/landing";
import type { DemoConfig } from "@/lib/demo-url";

type FinalCtaSectionProps = {
  demo: DemoConfig;
};

export function FinalCtaSection({ demo }: FinalCtaSectionProps) {
  return (
    <section className="section wrap final-cta" aria-labelledby="final-cta-title">
      <SectionHeading id="final-cta-title">{landing.finalCta.title}</SectionHeading>
      <p className="lede">{landing.finalCta.body}</p>
      <DemoLink demo={demo} />
    </section>
  );
}
```

- [ ] **Step 4: Compose the full page**

```tsx
import { AnalysisToolsSection } from "@/components/landing/analysis-tools-section";
import { CompatibilitySection } from "@/components/landing/compatibility-section";
import { DemoScenarioSection } from "@/components/landing/demo-scenario-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LayerComparisonSection } from "@/components/landing/layer-comparison-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { SpatialContextSection } from "@/components/landing/spatial-context-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { landing } from "@/content/landing";
import { resolveDemoUrl } from "@/lib/demo-url";

export default function Home() {
  const demo = resolveDemoUrl(
    process.env.NEXT_PUBLIC_DEMO_URL,
    process.env.NODE_ENV,
  );

  return (
    <div className="page-shell" id="top">
      <div className="star-layer" aria-hidden="true" />
      <a className="skip-link" href="#main-content">
        {landing.skip}
      </a>
      <SiteHeader demo={demo} />
      <main id="main-content">
        <HeroSection demo={demo} />
        <SpatialContextSection />
        <WorkflowSection />
        <LayerComparisonSection />
        <AnalysisToolsSection />
        <CompatibilitySection />
        <DemoScenarioSection />
        <FinalCtaSection demo={demo} />
      </main>
      <SiteFooter />
    </div>
  );
}
```

Exactly one `h1`. Section order matches the spec. No forms.

- [ ] **Step 5: Run lint**

```powershell
npm run lint
```

Expected: pass. Workflow controls use `step-button`, not `demo-link`.

- [ ] **Step 6: Review checkpoint**

Grep the `src` tree:

```powershell
Select-String -Path src/**/*.tsx,src/**/*.ts,src/**/*.css -Pattern "AGENTIC|AI Core|Launch the demo|CORE ONLINE|SCROLL TO EXPLORE"
```

Expected: no matches.

---

### Task 8: Production checks and browser verification

**Files:**
- Modify only if a check fails: files from earlier tasks.

**Interfaces:**
- Consumes: the finished page on `http://localhost:9010/` (`npm run dev --port 9010`).
- Produces: passing lint, passing build, and a recorded browser pass against the spec DoD.

- [ ] **Step 1: Run lint**

```powershell
npm run lint
```

Expected: exit code 0.

- [ ] **Step 2: Run build**

```powershell
npm run build
```

Expected: exit code 0. Static export succeeds with the disabled CTA. Build must not throw about `NEXT_PUBLIC_DEMO_URL`.

- [ ] **Step 3: Confirm GLB size and request**

```powershell
Get-Item public/models/background-model.glb | Select-Object Length
```

Expected: `2292904` bytes (below 5 MB). In the browser, the document requests `/models/background-model.glb` (or `/gip-oko-landing/models/background-model.glb` in the production export). No remote font or analytics requests.

- [ ] **Step 4: Browser pass**

Use the Cursor browser against `http://localhost:9010/`.

Desktop:

- Eight sections in order, all required Russian copy present.
- Header anchors `Данные`, `Сценарий`, `Инструменты` move to `#data`, `#workflow`, `#tools`.
- Primary actions read `Запустить демонстрацию` and are not links.
- Adjacent copy: `Демонстрационная версия готовится к публикации.`
- GLB loads in the hero and does not sit on top of the CTA.
- Workflow shows one step, `Назад` / `Далее`, `Шаг N из 5`, no autoplay.
- Layer comparison is static with `Материал A`, `Материал B`, and the synthetic caption.
- Console: no runtime, hydration, or unexpected network errors.

390 px:

- Header navigation remains visible (wraps to a second row).
- No horizontal page scroll.
- Workflow is a vertical list, not a carousel.
- Copy remains readable over or above the model.

Keyboard / no-mouse:

- Skip link appears on focus and targets `main`.
- Tab order follows the page.
- Slider buttons work with Enter/Space.
- No content exists only on hover.

Reduced motion:

- Emulate `prefers-reduced-motion: reduce`.
- Model is static. Smooth scroll is off.

WebGL fallback:

- Disable WebGL or force the error boundary.
- Hero copy and disabled CTA remain. No blocking error message.

- [ ] **Step 5: Spec comparison**

Re-read `.cursor/docs/brief.md`, `.cursor/superpowers/specs/2026-10-02-landing-product-design.md`, `AGENTS.md`, and `.cursor/superpowers/specs/2026-09-29-blender-parity-design.md`. Fix any mismatch before reporting the task done.

- [ ] **Step 6: Review checkpoint**

Do not commit. Do not stamp this plan executed. Do not write the daily log until Evgeniy closes the unit of work.

---

## Self-review

**Spec coverage:**

| Spec area | Task |
| --- | --- |
| Demo URL unavailable state | 1, 3, 8 |
| Exact Russian copy / content module | 1, 7 |
| Metadata, `lang="ru"`, Golos Text | 2 |
| Palette, type scale, layout tokens | 2 |
| Skip link, header, footer | 4 |
| Hero Server Component | 5 |
| GLB, AgX, no idle orbit, demand loop | 6 |
| Sections 2–8, workflow slider | 7 |
| Lint, build, browser DoD | 8 |

**Placeholder scan:** no TBD, TODO, or “implement later”. Font download URLs are exact; if they 404, the task says to use the newest 5.x files from the same package, not to skip the font.

**Type consistency:** `DemoConfig`, `resolveDemoUrl(raw, nodeEnv)`, `DemoLink`, `SectionHeading`, `MediaPlaceholder`, `HeroModel`, `BackgroundModelCanvas`, and `landing` names are the same in every task.

**Known implementation notes encoded in tasks:**

- Do not throw on missing demo URL during `next build`.
- Do not use Signal Cyan for workflow Back/Next.
- `visibleRef` / `hiddenRef` must be read inside `useFrame`, not as a stale boolean.
- Delete `AiCoreCanvas` after the new canvas is in place.
