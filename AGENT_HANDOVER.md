# Lifelong Athletics — Agent Handover & Site Guide

> **Read this to operate the site from zero.** It explains the architecture, the design system,
> the data structures, and step-by-step playbooks for every kind of change (blog posts, embedded
> interactive pages, exam-prep cards, ACE chapters, SEO). It assumes **no prior chat memory** — the
> website lives in this git repo, not in any conversation.
>
> **Companion docs:**
> - [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) — brand positioning/voice, the ACE-CPT chapter build
>   system in depth, and older session history. (Written 2026-06; ACE-focused. Where the two docs
>   overlap, trust **this** file for current architecture/design and file inventory.)
> - [`CLAUDE.md`](./CLAUDE.md) — one-screen TL;DR that points here.
> - [`ACE_EXTRACTION_PROMPT.md`](./ACE_EXTRACTION_PROMPT.md) — the prompt used to turn a chapter PDF
>   into structured quiz/guide data.
>
> **Last refreshed:** August 2026.

---

## 0. TL;DR

- **What:** a fitness-education brand + static website. Free content that teaches people *how to
  train for life* (Education/blog) and *how to pass the ACE-CPT exam* (Exam Prep). Positioning is a
  "not-for-profit school," not a personal-trainer-for-hire. Voice/brand detail → `PROJECT_BRIEF.md §1`.
- **Stack:** [**Astro 6**](https://astro.build) static site. **No UI framework, no Tailwind** — plain
  `.astro` components + plain CSS with CSS custom properties. One integration: `@astrojs/sitemap`.
- **Repo:** GitHub `Misfit-Manu/lifelongathletics`, branch **`main`**. Local path:
  `C:\Users\Manu\claude lcal work\lifelongathletics`.
- **Run / build / ship:**
  ```bash
  npm run dev        # local dev server (http://localhost:4321)
  npx astro build    # production build to dist/  — ALWAYS run before committing
  ```
  **Deploy = commit + push to `main`** (host auto-deploys from the repo, ~1 min).
- **Node:** ≥ 22.12. **Owner:** Manu Sehgal (`manusehgal1995@gmail.com`); WhatsApp `+91 7696483445`
  (floating button in `Layout.astro`).

---

## 1. Folder map (current)

```
lifelongathletics/
  astro.config.mjs          ← site URL + sitemap integration
  package.json              ← deps: astro ^6.1.6, @astrojs/sitemap ^3.7.3 (that's all)
  tsconfig.json
  PROJECT_BRIEF.md  CLAUDE.md  AGENT_HANDOVER.md  ACE_EXTRACTION_PROMPT.md  README.md
  setup_ace.py              ← one-off helper script (not part of the build)
  public/
    favicon.png             ← site favicon (LA monogram)
    blog/*.png|jpg          ← blog + interactive-page images, served at /blog/<name>
    …other static assets served at site root
  src/
    layouts/Layout.astro    ← THE global shell: <head>, nav, footer, floating WhatsApp,
                              all global CSS + design tokens, SEO schema. Every page wraps in it.
    components/
      Nav.astro             ← top nav + the mobile bottom tab bar
      Footer.astro          ← site footer
      AceQuiz.astro         ← legacy quiz component (see §6; mostly superseded)
    content.config.ts       ← Zod schemas for the 3 content collections (blog, exam, ace)
    content/
      blog/*.md             ← 10 blog posts (Education articles)
      ace/chapter-N.md      ← 17 ACE chapter source markdowns (only render when NOT a static page)
      exam/*.md             ← exam-prep markdown guides (bioenergetics, metabolic-fuel)
    data/
      ace-quizzes.json      ← legacy quiz data for AceQuiz.astro; effectively vestigial (see §6)
    toolkit-content/        ← raw <body> HTML of embedded toolkit pages, imported with ?raw (see §5)
      toolkit-1..4-body.html          (trainer toolkits)
      beginner-exercise-body.html     beginner-nutrition-body.html
    pages/                  ← file-based routes (58 .astro files)
      index.astro           ← homepage (/)
      ace-prep/
        index.astro         ← /ace-prep landing (chapter hub + ACE banner)
        [id].astro          ← renders any ace/chapter-N.md NOT in STATIC_OVERRIDES
        chapter-N.astro     ← static 4-tab hub  (exist for 1–15, 17)
        chapter-N-guide.astro ← static long-form guide (exist for 1–15, 17)
      exam-prep/
        index.astro         ← /exam-prep landing (topic sections + static cards + ACE banner)
        [id].astro          ← renders exam/*.md guides
        <many>.astro        ← standalone interactive/reference pages (see §4 inventory)
      blog/
        index.astro         ← /blog "Education" landing (article cards + Useful Tools section)
        [id].astro          ← renders blog/*.md articles (URL slug = filename)
        hormones-obesity.astro
        beginner-exercise-toolkit.astro
        beginner-nutrition-toolkit.astro   ← standalone embedded pages living under /blog
```

**Routing model:** Astro is file-based. `pages/foo/bar.astro` → `/foo/bar`. `[id].astro` is a dynamic
route driven by `getStaticPaths()`. **Static `.astro` files take precedence** over a `[id]` route for
the same path, and the `[id]` routes explicitly exclude the ones that have static pages (see §6, §3).

---

## 2. The four sections of the site (routes + audience)

| Route | What it is | Audience | Source |
|---|---|---|---|
| `/` | Homepage — positioning, methodology, programs, testimonials, apply form | Everyone | `pages/index.astro` |
| `/blog` | **Education** — free articles + "Useful Tools" | General public (coaching funnel) | `pages/blog/` |
| `/exam-prep` | **Exam Prep** — study guides, visual references, calculators, the Trainer Toolkits | Aspiring trainers | `pages/exam-prep/` |
| `/ace-prep` | **ACE-CPT** chapterwise prep — 17 chapters, each a quiz hub + theory guide | ACE candidates | `pages/ace-prep/` |
| `/adventure-trips` | (nav link exists) | — | — |

The nav is in `components/Nav.astro`: desktop links **Services · Education · Exam Prep · Adventure
Trips · Apply Now**, and a **mobile bottom tab bar** (Home · Education · Exam Prep · Adventure · Apply).
"Education" → `/blog`; "Exam Prep" → `/exam-prep`.

---

## 3. Data structures

### 3a. Content collections (`src/content.config.ts`)
Three collections, each loaded from markdown via the Astro glob loader, each with a **Zod schema**:

```ts
blog:  { title, description, category, pubDate:date, image?, imageAlt? }   // src/content/blog/*.md
exam:  { title, description, topic, exams, duration }                       // src/content/exam/*.md
ace:   { title, chapter:number, description }                              // src/content/ace/chapter-N.md
```
> ⚠ **Zod strips unknown keys.** If you add a frontmatter field that isn't in the schema, it is
> silently dropped from `entry.data`. The blog schema now declares every field the code reads —
> including `author` (article bylines) and `heroImage` (`blog/[id].astro` prefers
> `entry.data.heroImage || entry.data.image`). **Rule: if the code reads a frontmatter field, the
> schema must declare it**, or it silently vanishes.

Fetch with `getCollection('blog' | 'exam' | 'ace')`; render markdown body with `render(entry)`.

### 3b. Exam-prep static cards (`pages/exam-prep/index.astro`)
The exam-prep landing is data-driven from two structures in its frontmatter:
- `topics[]` — the section list (id + gold-italic `title` + `desc`). Current ids:
  `anatomy, biomechanics, programming, behaviour, assessment, nutrition, education, muscle, tables`.
- `staticCards{}` — a map of **topic id → card[]** for the hand-built pages (each card:
  `{ title, description, href, duration, exams }`). Sections without static cards (biomechanics,
  programming, behaviour, muscle) show only the "coming soon" placeholder.
- Dynamically, each section also lists any `exam` collection markdown whose `topic` matches.
- The `tables` topic is titled **"Trainer Toolkits & Tables"** and holds Toolkit I–IV then the
  Flexibility card. A top filter bar filters sections by topic (client-side JS).

### 3c. ACE chapter quiz data (inside each `chapter-N.astro`)
Each static chapter hub embeds its quiz as **JS arrays in a `<script is:inline>`** (NOT the content
collection). Field names are load-bearing — the render/grade code depends on them:
```js
THEORY = [ { q, opts:[4], c:<correctIdx 0-3>, exp } ]        // ~20 MCQ (some chapters name it MCQ)
FILLIN = [ { q("____"), a, hint } ]                          // ~5
TRUEF  = [ { q, a:true|false, exp } ]                        // ~5
CASES  = [ { num, topic, scenario, qs:[ {q, opts:[4], ans:<0-3>, exp} ] } ]  // ~7 scenarios × 5
```
- **Theory correct field = `c`; Case correct field = `ans`.** Both 0-indexed (A=0, B=1, C=2, D=3).
- Options carry **no** "A./B." prefixes — the renderer adds letters by position.
- Scoring is dynamic: it compares the picked index to `c`/`ans` and reveals `opts[c]`/`opts[ans]`.
  This is why you can safely **reorder options** as long as you update the index (see §8e).
- Format varies by chapter: some use spaced keys `c: 2`, some compact `c:1`, chapter-10 uses **JSON
  with quoted keys** (`"opts":[…], "c":2`). Any automated pass over quiz data must handle all three.

---

## 4. Page types — an inventory

**Markdown-driven (author by adding a `.md` file):**
- Blog articles → `content/blog/*.md` (10 posts). Rendered by `blog/[id].astro`.
- Exam guides → `content/exam/*.md` (bioenergetics, metabolic-fuel). Rendered by `exam-prep/[id].astro`.
- ACE chapter 16 → `content/ace/chapter-16.md` (the only chapter still rendered from markdown).

**Static hand-built `.astro` pages** (interactive visual guides / references, each self-styled):
- Exam-prep: `muscle-structure`, `muscular-training-variables`, `protein-synthesis`, `muscle-quiz`,
  `fibre-fuel-activity`, `inflammation-guide`, `gut-barrier`, `gut-barrier-timeline`, `food-reactions`,
  `flexibility-assessments`, `pt-field-guide`, and **`trainer-toolkit-1..4`**.
- Blog: `hormones-obesity`, `beginner-exercise-toolkit`, `beginner-nutrition-toolkit`.
- ACE: `chapter-1..15` + `chapter-17` (each a `chapter-N.astro` hub **and** a `chapter-N-guide.astro`).

Most of the recent interactive pages were built by the **embed-a-standalone-HTML pattern** in §5.

---

## 5. ⭐ The core technique: embedding a standalone HTML page

The owner frequently supplies a **complete, self-contained HTML file** (its own `<style>`, fonts,
SVGs, and sometimes JS calculators). These get turned into on-site pages. Because such a file uses
**generic selectors** (`body`, `table`, `.nav`, `.footer`, `h1`, `.card`…) that would collide with the
site's global CSS — and vice-versa — the rule is: **keep the original design exactly, scope every
selector under one wrapper class, wrap in `<Layout>`, add a back link.** Never redesign it; only
embed + scope. (Design-preservation rule confirmed repeatedly by the owner.)

### The recipe
1. **Pick a unique wrapper class** for the page, e.g. `.tk-wrap` (toolkits), `.ho-wrap` (hormones),
   `.gb-wrap` (gut barrier), `.fr-wrap` (food reactions). All CSS + content scope under it.
2. **Wrap the body** content in `<div class="WRAP">…</div>`.
3. **Scope the CSS** into a single `<style is:global>` block, prefixing **every** selector:
   - `body { … }` → `.WRAP { … }` (this is where the page's background/base font goes)
   - `:root { … }` (theme-var definitions) → `.WRAP { … }`; keep `[data-theme]` /
     `prefers-color-scheme` dark variants scoped to the wrapper (e.g.
     `:root[data-theme="dark"]` → `.WRAP[data-theme="dark"]`). For a theme-aware page you can set
     `data-theme="dark"` on the wrapper `<div>` to force its dark palette so it matches the site
     (that's how `/exam-prep/cpt-practice-exam` is embedded).
   - `* { … }` → `.WRAP * { … }`
   - `html { … }` → **drop it** (don't touch global html)
   - `.foo`, `table`, `h2`, `.foo .bar` → `.WRAP .foo`, `.WRAP table`, `.WRAP h2`, `.WRAP .foo .bar`
   - `@media (…) { … }` → keep the `@media`, prefix the selectors **inside** it
   - `@keyframes name` → rename to `WRAP-name` (namespace) and update references
   - This specificity (`.WRAP x` = 0,1,1+) reliably beats the site's bare-element globals (0,0,1).
4. **Clear the fixed nav.** The site nav is `position:fixed`, so page content starts under it. Add a
   back-bar with top padding, e.g. `padding: 92–110px 36–60px 0`, containing
   `<a href="/exam-prep">← Back to Study Hub</a>` or `<a href="/blog">← Back to Education</a>`.
5. **Fonts:** if the page needs Google Fonts / an icon CDN, add the `<link>` tags in the template
   (they load fine from `<body>`); the site already loads external fonts so a CDN link is acceptable.
6. **Scripts (calculators):** move any `<script>` out to `<script is:inline>` so Astro runs it
   verbatim. Inline `oninput`/`onchange`/`onclick` handlers work because the functions become global.
7. **Injecting the body:** two ways —
   - **Small/authored inline:** paste the wrapped HTML straight into the `.astro` template.
   - **Large files:** write the `<body>` inner HTML to `src/toolkit-content/<name>-body.html`, then in
     the page `import body from '../../toolkit-content/<name>-body.html?raw'` and render
     `<div class="WRAP" set:html={body}></div>`. **`set:html` does not execute `<script>`** — so pull
     scripts out first and emit them separately as `<script is:inline>`. This keeps the big HTML out of
     the `.astro` file (and out of an agent's token budget when a generator does the file I/O).
8. **Verify** (see §9): dark/light theme preserved, no page-level horizontal overflow on desktop
   **and** mobile (wide tables/SVGs must scroll inside their own `overflow-x:auto` box, not the page),
   calculators compute, no console errors.

> The four trainer toolkits + two beginner toolkits were generated by a small Node script that does
> exactly steps 1–7 (read source HTML → extract style/body/scripts → prefix CSS under `.tk-wrap` →
> write the `-body.html` + the `.astro`). If you're adding more toolkits, reproduce that script from
> this recipe (it lived in the session scratchpad, not the repo). The dark toolkit theme (`#111110`
> bg, cream text) already matches the site, so those needed no color changes.

### Adding the card that links to an embedded page
- **Exam-prep:** add a `{ title, description, href, duration, exams }` object to the right topic in
  `staticCards` in `exam-prep/index.astro`. Descriptions are **detailed** — enumerate what the page
  contains (match the Flexibility / toolkit cards).
- **Blog/Education:** interactive pages are added as **hardcoded `<a class="post-card">`** blocks in
  `blog/index.astro` (the article grid only auto-lists markdown). The "Useful Tools" section at the
  bottom of `blog/index.astro` (class `.tools-section`, reuses `.posts-grid`/`.post-card`) is where the
  beginner toolkits live.

---

## 6. The ACE chapter system (summary)

Full detail is in `PROJECT_BRIEF.md §3`. Current-state deltas:
- **Static hub + guide exist for chapters 1–15 and 17.** **Chapter 16** is the only one still
  rendered from `content/ace/chapter-16.md` via `ace-prep/[id].astro`.
- `ace-prep/[id].astro` has a **`STATIC_OVERRIDES` Set** = `chapter-1 … chapter-15, chapter-17`. Any
  chapter with a static `chapter-N.astro` **must** be in this set, or `[id].astro` generates a
  duplicate route and the build fails. (So if you build chapter-16 as a static page, add `'chapter-16'`.)
- Canonical templates to copy for a new chapter: **`chapter-13.astro`** (hub) + **`chapter-13-guide.astro`**
  (guide). Copy their CSS/JS verbatim; change only data + prose.
- `data/ace-quizzes.json` + `components/AceQuiz.astro` are the **old** quiz mechanism (only a
  chapter-1 sample remains in the JSON). The current chapters embed their own quiz arrays inline
  (§3c); AceQuiz is effectively legacy. Chapter 16 (markdown route) shows the AceQuiz "coming soon"
  fallback because the JSON has no chapter-16 entry.

---

## 7. The design system

### 7a. Main site theme — gold on near-black (`Layout.astro`, `<style is:global>`)
```
--black:#080808   --surface:#111111   --surface2:#181818
--border:rgba(255,255,255,0.08)   --muted:rgba(245,240,232,0.45)
--gold:#c9a84c    --gold-dim:rgba(201,168,76,0.15)   --white:#f5f0e8
--font-display:'Cormorant Garamond', Georgia, serif   (headings)
--font-body:'DM Sans', sans-serif                     (body)
```
- **Signature move:** a **gold italic `<em>` accent word** inside display headings
  (`h1 em { font-style:italic; color:var(--gold) }`). Use it for emphasis in titles everywhere.
- Body is dark (`--black`), text `--white` (a warm off-white), muted text `--muted`.
- There is a subtle **film-grain overlay** (`body::before`, fixed, low opacity) and a **floating gold
  WhatsApp button** bottom-right.
- **`nav { position: fixed }` is global** — content must clear it (this is the #1 gotcha, §8).
- Fonts load from Google Fonts in the `<head>` (Cormorant Garamond + DM Sans). Adding a font = add a
  `<link>` there or in the page.

### 7b. Reusable component patterns (main theme)
- **Section:** `<section>` with `padding:120px 60px`, an inner `.container{max-width:1100px;margin:0 auto}`,
  a `.section-eyebrow` (gold, letter-spaced, uppercase), an `h2` with a gold `<em>`.
- **Card grid:** `.posts-grid`/`.cards-grid` are `display:grid; grid-template-columns:repeat(3,1fr); gap:1px;
  background:var(--border)` (the 1px gap + border bg creates hairline dividers). Cards are
  `.post-card`/`.article-card` on `--surface`, with a gold top-border reveal on hover and a `→` arrow
  that slides on hover. On mobile they collapse to 1 column.
- **Blog article body** (`blog/[id].astro`) styles markdown via `:global()` and supports these custom
  blocks you can drop into a post's markdown: `.chart-box`/`.chart-title`/`.chart-sub` (with inline
  `<svg>`), `.callout`, `.takeaway`+`.takeaway-label`, `.article-cta`+`.btn-gold` (CTA → `/#apply`), and
  a `.read-next`+`.read-next-btn` "Keep Reading" internal-link button. In-article `<img>` and markdown
  `<table>` are styled (tables scroll on mobile).

### 7c. Other palettes
- **ACE chapter hubs** (`chapter-N.astro`): a **lime-on-near-black** theme, `--accent:#c5f135`, fonts
  Playfair Display + DM Sans. Self-contained per file.
- **ACE guides** (`chapter-N-guide.astro`): dark-native, `bg:#0e0e0e`, accent lime. `.toc-bar` MUST be
  `position:static` (gotcha §8). Copy `chapter-13-guide.astro` for new guides.
- **Embedded toolkit pages** (`.tk-wrap`): dark `#111110`/cream — the toolkit author's own palette,
  preserved as-is.
Full palette values for the ACE themes are in `PROJECT_BRIEF.md §2`.

### 7d. Responsive / mobile
- Global breakpoints ~`@media (max-width:1024px)` (tablet) and `768px` (mobile); grids collapse to
  1–2 columns; section padding shrinks to `…24px`.
- The mobile bottom tab bar (`Nav.astro`) uses `flex:1; min-width:0` tabs so it can never overflow.
- **Rule:** any wide element (data table, big SVG) must live in a container with `overflow-x:auto` so
  it scrolls **inside its box** — the page body must never scroll horizontally. Verify at 375px.

---

## 8. Gotchas (read before editing)

1. **Fixed-nav clearance.** `Layout.astro`'s global `nav{position:fixed}` overlays the top of every
   page. New top-level content needs top padding (~90–110px) or it hides under the nav. Embedded pages
   use a back-bar with that padding; ACE guides need `.toc-bar{position:static}` or the TOC sticks and
   overlaps the hero.
2. **Mobile horizontal overflow.** A single wide table/SVG without an `overflow-x:auto` wrapper pushes
   the whole page wide, which then also drags the fixed bottom nav. Always wrap wide content; verify
   `document.documentElement.scrollWidth === clientWidth` at 375px.
3. **Zod strips unknown frontmatter** (see §3a) — add fields to the schema or they vanish (`author`).
4. **Scope embedded CSS** (see §5). An unscoped `body{}`/`.nav{}`/`table{}` in a `<style is:global>`
   will break the whole site.
5. **`set:html` won't run `<script>`** — extract calculator JS to a separate `<script is:inline>`.
6. **STATIC_OVERRIDES** must list every ACE chapter that has a static `.astro` (currently 1–15, 17).
7. **Answer-position balance.** Historic ACE quizzes were heavily skewed to B/C (some 100% B/C, ch10
   was 84% B). All were rebalanced to ~25% each A/B/C/D. If you author new questions, spread the
   correct answer across positions, or run the rebalancer (§8e).
8. **Commits:** end messages with `Co-Authored-By: <model> <noreply@anthropic.com>`. Build clean
   before pushing. `LF will be replaced by CRLF` warnings are harmless. The owner expects finished
   work to be **built → verified → committed → pushed** in one go.

### 8e. Rebalancing quiz answer positions (reference)
A shape-agnostic approach used to fix the B/C skew: scan each `opts:[…]` array and its following
`c:`/`ans:` index (handles spaced, compact, and JSON-quoted forms), reorder the options so the
correct answer lands on a balanced target slot, and rewrite only the option array + the index digit
(everything else byte-identical). Verify against the original that every question keeps the same 4
option strings and the correct-answer **text** is unchanged, then build. Scoring is index-based so it
stays correct automatically.

---

## 9. Verify-before-ship workflow

1. `npx astro build` — must complete with **no errors and no duplicate-route warning**.
2. Preview in the browser (`npm run dev`, or the harness preview tools) and check the changed pages:
   - correct theme/colors, no layout break;
   - **no horizontal overflow** at desktop **and** mobile (375px) — inspect
     `document.documentElement.scrollWidth`;
   - any calculators/interactions compute; **no console errors**.
3. Commit the changed files + push to `main`. Deploy is automatic.

---

## 10. Content workflows (quick playbooks)

**New blog article (markdown):** copy an existing post in `content/blog/`, write **original** copy
(never paraphrase a source), set frontmatter (`title`, `description`, `category`, `pubDate`,
`image?`, `imageAlt?`); filename = URL slug (keyword-rich). Optionally add a `.read-next` button and
an `.article-cta`. Build → commit → push. (SEO detail: `PROJECT_BRIEF.md §8`.)

**New interactive/embedded page:** follow §5 (scope under a wrapper, wrap in Layout, back link,
calculators as `is:inline`), then add its card (§5 "Adding the card"). Put exam-prep tools under
`/exam-prep/…`; client-facing tools under `/blog/…`.

**New ACE chapter:** get structured data (`ACE_EXTRACTION_PROMPT.md`), copy `chapter-13*.astro`,
fill the arrays (§3c), add the id to `STATIC_OVERRIDES`, build (no dup-route), push. (`PROJECT_BRIEF.md §3`.)

**Images:** an agent can't save a chat-pasted image. The **owner drops files into a staging folder**
(`G:\Content making ideas\conent\blog-inputs\raw images\`); the agent reads them, copies to
`public/blog/<name>.png`, wires them into the page/frontmatter, and commits. When the owner says
"placed there," check that folder.

**SEO already in place:** `Layout.astro` sets the meta description + Organization JSON-LD + favicon;
`blog/[id].astro` emits BlogPosting + BreadcrumbList JSON-LD; `ace-prep/[id].astro` emits
BreadcrumbList; `@astrojs/sitemap` generates `/sitemap-index.xml` (needs `site` in `astro.config.mjs`,
which is set). Keep titles/descriptions keyword-rich; internal-link posts with `.read-next`.

---

## 11. Current state (August 2026)

- **Homepage:** on the locked not-for-profit positioning.
- **Education (`/blog`):** 10 articles + 3 interactive cards (gut-barrier-timeline, food-reactions,
  hormones-obesity) in the "All Articles" grid (newest first, with `inflammation-types` pinned to grid
  slot [3,2]); plus a **"Useful Tools"** section with the 2 beginner toolkits.
- **Exam Prep (`/exam-prep`):** a **"Full Practice Exam"** section at the top (a timed 100-question,
  90-minute, domain-based mock at `/exam-prep/cpt-practice-exam` with flag/review, resume, and a
  per-domain score breakdown — embedded from a self-contained HTML file, forced to its dark theme);
  topic sections with visual guides + `pt-field-guide`; the **"Trainer Toolkits & Tables"** section
  holds Trainer Toolkit **I–IV** then the Flexibility table.
- **ACE Prep (`/ace-prep`):** chapters **1–15 and 17** are full static hub+guide; **chapter 16** still
  renders from markdown. A lime **capstone bar** below the chapter grid links to the full practice
  exam. All quiz answer positions rebalanced to ~25% each; chapter-1's rote-number questions were
  rewritten as conceptual ones.
- **Open items:** build chapter-16 as a static hub+guide (then add to STATIC_OVERRIDES); deepen the
  older/thin ACE guides (`PROJECT_BRIEF.md §5–9`).

---

*This file is version-controlled — losing a chat never loses the knowledge. Keep it current when the
architecture or a workflow changes.*
