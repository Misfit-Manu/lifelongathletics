# Lifelong Athletics — Project Brief & Handoff

> **Read this first.** This file is the single source of truth for what this project is,
> what's been done, how it's built, and how to continue. It is written so that ANY coding
> agent (Claude Code, Kimi, Codex, etc.) — with no prior chat memory — can read it and
> proceed. The website lives in this git repo, not in any chat: losing a conversation
> never loses the work.
>
> **Status:** current through **Chapter 15** + the blog/SEO system + the homepage repositioning
> (see §5, §6, §8, §9). Last refreshed 2026-06.

---

## 1. What this is

**Lifelong Athletics** is a fitness education brand + website.

- **Repo:** GitHub `Misfit-Manu/lifelongathletics`, branch `main`.
- **Stack:** [Astro](https://astro.build) static site, TypeScript/`.astro` components, plain CSS (no Tailwind).
- **Local path:** `C:\Users\Manu\claude lcal work\lifelongathletics`
- **Build:** `npx astro build` (output to `dist/`). Dev server: `npm run dev`.
  - `npx astro check` may prompt to install `@astrojs/check` — skip it; use `astro build` to validate.
- **Deploy:** pushing to `main` on GitHub. (Hosting provider is connected to the repo — confirm exact host with the owner; treat "commit + push to main" as "ship".)
- **Owner contact in code:** WhatsApp `+91 7696483445` (floating button in `Layout.astro`).

### Positioning / mission (locked — use this voice everywhere)
> **Lifelong Athletics is a not-for-profit initiative that teaches you how to train for life
> and designs the behavior to make it last.**

- **Problem we solve:** people don't know how to exercise — how much, how often, what actually
  works — or how to make the change *stick*.
- **Two things we do:**
  1. **Make behavior change sustainable** — habits that outlast motivation (behavioral science, not willpower).
  2. **Teach exercise at a deep level** — the *why*: anatomy, cardio zones (VT1/VT2), specific
     muscle targeting, the real effect of HIIT, and lifestyle levers that extend healthspan.
- **Mission/destination:** longevity & healthspan — stay strong, capable, independent into old age.
- **Differentiator (the "revolution"):** *most trainers want you dependent on them; we want you
  to never need us again.* Model is closer to a **school** (think NOLS / Isha Foundation —
  mission-driven orgs that charge fees and reinvest) than a personal-trainer-for-hire.
- **Note on "not-for-profit":** used as the brand ethos/agenda. Formal registration
  (Section 8 / trust / society) is a later to-do, not a blocker. Keep the label honest with
  whatever the legal structure becomes.

---

## 2. Site structure

Pages live in `src/pages/`. Shared shell is `src/layouts/Layout.astro` (global CSS, nav, footer,
floating WhatsApp). Key routes:

- `/` — `src/pages/index.astro` (homepage)
- `/exam-prep` — `src/pages/exam-prep/index.astro` (study hub landing + the ACE banner)
- `/ace-prep` — `src/pages/ace-prep/index.astro` (ACE chapter hub landing)
- `/ace-prep/chapter-N` — per-chapter interactive hub (the big workstream, see §3)
- `/ace-prep/chapter-N-guide` — per-chapter long-form theory guide
- `src/pages/ace-prep/[id].astro` — fallback that renders any chapter from markdown
  (`src/content/ace/chapter-N.md`) **unless** that chapter is in `STATIC_OVERRIDES` (see §3).
- `/blog` — `src/pages/blog/index.astro` (the "Education" hub: post cards)
- `/blog/<slug>` — `src/pages/blog/[id].astro` (article renderer; slug = markdown filename). See §8.

### Website styles — three palettes (important for matching the look)

**1) Main site — gold-on-dark (defined in `src/layouts/Layout.astro` `<style is:global>`):**
`--black:#080808`, dark `--surface`/`--surface2` greys, `--border`, `--muted`, **`--gold:#c9a84c`**, `--white:#f5f0e8`.
Fonts: **Cormorant Garamond** (display, `--font-display`) + **DM Sans** (body). Signature look = a gold
*italic* `<em>` accent word inside headings. Floating gold WhatsApp button, bottom-right. ⚠ Global
`nav { position: fixed }` lives here (the gotcha in §4).

**2) ACE chapter hubs — lime-on-near-black (inline in each `chapter-N.astro`):**
`--bg:#080808; --bg2:#111; --bg3:#181818; --border:#222; --border2:#2e2e2e; --text:#ededec; --muted:#777;`
**`--accent:#c5f135`** (lime) `--accent-dim:#9bbf28`; status colors `--correct:#4ade80 --incorrect:#f87171
--warn:#fbbf24 --blue:#60a5fa --purple:#a78bfa --teal:#22d3ee --orange:#fb923c --red:#f87171`.
Fonts: **Playfair Display** (head) + **DM Sans** (body). Includes a "breathing" guide-link button and a
pulsing glow on the Quiz tab.

**3) Guide pages — dark-native (inline in each `chapter-N-guide.astro`):**
bg `#0e0e0e`, body text `#c4c2bc`, headings `#f4f2ee`/`#e2e0db`, accent `#c5f135`/`#9bbf28`, cards `#171717`,
borders `#2a2828`. Building blocks: `.section` + `.section-tag` (color variants teal/blue/purple/orange/green/red),
`.callout` (+ `.c-label`), `.data-table`, `.body-list`, `.takeaways` (green box). `.toc-bar` MUST be
`position:static` (see §4). This is the canonical guide skin — copy it for new guides.

### Homepage section order (current)
hero → **Services** ("We don't just train you." eyebrow / "We design your behavior for *longevity*") →
**Methodology** ("How we transform *you*" + 3 pillars) → **Programs for each category** (`#who`) →
pull-quote → Testimonials → About → Apply.
The 3 methodology pillars, in order: **01 Behavior Change · 02 Physical Training · 03 Education**
(each card keeps its own SVG icon; the `.method-num` numerals are large italic gold with an underline accent).

### Where files live (folder map — repo root is `C:\Users\Manu\claude lcal work\lifelongathletics`)
```
src/
  layouts/Layout.astro            ← global shell: nav, footer, WhatsApp, global CSS (main gold theme)
  pages/
    index.astro                   ← homepage
    ace-prep/
      index.astro                 ← ACE chapter hub landing
      [id].astro                  ← markdown fallback + STATIC_OVERRIDES set
      chapter-N.astro             ← per-chapter 4-tab HUB (N = 1..17)
      chapter-N-guide.astro       ← per-chapter long-form GUIDE
    exam-prep/index.astro         ← study-hub landing + the ACE banner
    blog/
      index.astro                 ← "Education" blog list (cards)
      [id].astro                  ← blog article renderer (slug = filename)
  content/
    ace/chapter-N.md              ← chapter markdown (only renders when NOT overridden)
    blog/*.md                     ← blog posts; _template.md is the starter
    exam/*.md
  content.config.ts               ← content-collection schemas (ace, blog, exam)
public/                           ← static assets served at site root
  blog/<name>.jpg                 ← blog poster images (referenced as /blog/<name>.jpg)
PROJECT_BRIEF.md  CLAUDE.md  ACE_EXTRACTION_PROMPT.md   ← these handoff files (repo root)
```

---

## 3. THE ACE-CPT CHAPTER SYSTEM (the main workstream)

The ACE Personal Trainer manual has **17 chapters**. Each gets TWO pages built to one fixed pattern.

### 3a. The two files per chapter
- **`src/pages/ace-prep/chapter-N.astro`** — the interactive HUB, a 4-tab page:
  1. **📑 Contents** — an expandable mind map + a link to the theory guide
  2. **📝 Quiz (Theory)** — 20 MCQ + 5 fill-in-the-blank + 5 true/false = **30 Q**, inline scoring
  3. **🩺 Case Studies** — 7 scenarios × 5 MCQ = **35 Q**, modal score overlay (A/B/C/D grade ring)
  4. **📋 Quick Reference** — the chapter's most testable tables/numbers
  - Hero stats are ALWAYS: `30 Theory Quiz | 35 Case Studies | 65 Total Q's`.
- **`src/pages/ace-prep/chapter-N-guide.astro`** — long-form study guide ("Theory Guide"),
  dark-themed, section-by-section reproduction of the chapter + a Key Takeaways block.

### 3b. Canonical templates — COPY THESE
When building a new chapter, **read these two files and copy their CSS + JS verbatim**, changing
only the data and prose:
- Hub template: **`src/pages/ace-prep/chapter-13.astro`**
- Guide template: **`src/pages/ace-prep/chapter-13-guide.astro`** (dark-native)
(`chapter-2`, `chapter-6`, `chapter-12` are equally valid reference copies.)

### 3c. The 5 JS data arrays in every hub (`<script is:inline>`)
Field names matter — the render/grade functions depend on them exactly:
```js
THEORY_MCQ = [ { q, opts:[4 strings], c:<correctIndex 0-3>, exp } ]   // exactly 20
FILLIN     = [ { q (use "________" for blank), a:<short answer>, hint } ]  // exactly 5
TRUEF      = [ { q, a:<true|false>, exp } ]                            // exactly 5
CASES      = [ { num, topic:"Topic — Name", scenario, qs:[ 5 × { q, opts:[4], ans:<0-3>, exp } ] } ] // 7 cases
MINDMAP    = { branches:[ { id, name, color, subs:[ { name, points:[strings] } ] } ] } // ~8 branches
```
- Theory correct-answer field is **`c`**; Case correct-answer field is **`ans`**. Do not mix them.
- Case `opts` have **NO** "A."/"B." letter prefixes — the renderer adds letters.
- MINDMAP branch `color`s rotate through: `#f87171 #fb923c #22d3ee #a78bfa #3b82f6 #10b981 #fbbf24 #94a3b8`.

### 3d. Register the static override (REQUIRED, or build collides)
In `src/pages/ace-prep/[id].astro` add the chapter id to the `STATIC_OVERRIDES` Set, e.g.
`'chapter-7'`. This stops `[id].astro` from also generating that route from markdown.

### 3e. Content pipeline (how chapter content is produced)
The chapter's source content comes from a **separate, context-free "extraction" task**: the owner
gives that task a scanned chapter PDF and a prompt; it returns ONE structured markdown doc with
JSON blocks (META, GUIDE SECTIONS, MINDMAP, THEORY_MCQ, FILLIN, TRUEF, CASES, QUICK REFERENCE).
That JSON drops almost verbatim into the arrays above. The extraction prompt is saved in
**`ACE_EXTRACTION_PROMPT.md`** (repo root). If only a blog (no quiz) is provided, the build agent
authors the full 35-case + 20-theory + 5 FIB + 5 TF bank from the chapter content itself.

⚠ **Guide depth:** the `chapter-N-guide.astro` page is only as rich as the extraction's
**GUIDE SECTIONS** text. Early extractions summarized chapters down to ~1,500 words, producing
thin guides (ch 7/12/13/14 ≈ 1,500–2,100 words) vs. the full-source guides (ch 10 ≈ 8,000 words).
The extraction prompt was upgraded (2026-06) to demand a **full 4,000–7,000-word reproduction** of
the chapter, not a summary. When building a guide, render that full prose faithfully — but NEVER
invent textbook facts/numbers not in the source. To retrofit a thin guide, re-run extraction with
the upgraded prompt OR work from the chapter PDF/OCR directly.

### 3f. Build → verify → ship
1. Create `chapter-N.astro` and `chapter-N-guide.astro` from the templates with the new data.
2. Add `'chapter-N'` to `STATIC_OVERRIDES` in `[id].astro`.
3. `npx astro build` — confirm `/ace-prep/chapter-N/` and `/ace-prep/chapter-N-guide/` render with
   **no errors and no duplicate-route warning**.
4. Commit all three files + push to `main`.

---

## 4. Hard-won gotchas (read before editing)

- **Guide TOC bar floats unless fixed.** `Layout.astro` has a GLOBAL `nav { position: fixed }`
  rule that leaks onto the guide's `<nav class="toc-bar">`. Every guide's `.toc-bar` MUST start
  with `position:static; display:block; padding:0;` plus `scrollbar-width:none;
  -ms-overflow-style:none;` and a `.toc-bar::-webkit-scrollbar{display:none}` rule. (Otherwise the
  TOC sticks to the top and overlaps the hero, and shows an ugly horizontal scrollbar.)
- **FIB grading is lenient:** `val===ans || ans.includes(val) || val.includes(ans.split(' ')[0])`.
  Keep fill-in answers SHORT and single-token-friendly (e.g. `"2300"` not `"2,300 mg"`; put the
  readable form in `hint`).
- **Guides are dark-native now.** Earlier guides (ch 1,3,4,5) were light-theme then forced dark via
  an `!important` override block; newer guides (2,6,12,13) are authored dark from the start
  (bg `#0e0e0e`, text `#c4c2bc`, headings `#f4f2ee`, accent `#c5f135`). Prefer dark-native for new ones.
- **Theory MCQ vs Case MCQ should COMPLEMENT, not duplicate** — theory = recall/definitions,
  cases = applied decision-making. Some factual overlap is fine.
- **Commits:** end commit messages with `Co-Authored-By: <model> <noreply@anthropic.com>`. Only
  commit/push when the build is clean. The `LF will be replaced by CRLF` git warnings are harmless.
- **Do not commit/push unless asked** is the general rule — but for this project the owner expects
  each finished chapter to be built, verified, committed, and pushed in one go.

---

## 5. Progress tracker

**ACE chapters with full hub + guide (DONE):** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
(8–11 pre-existed; 1/3/4/5 were restructured to the 4-tab pattern; 2/6/7/12/13/14/15 built fresh.)

**REMAINING to build:** **16, 17** (currently render from markdown via `[id].astro`).

**Chapter titles for reference:**
- Ch 1 Role & Scope of Practice · Ch 2 ACE Integrated Fitness Training (IFT) Model
- Ch 3 Basics of Behavior Change · Ch 4 Communication, Goal Setting & Teaching Techniques
- Ch 5 Preparticipation Health Screening · Ch 6 Nutrition for Health & Fitness
- Ch 12 Considerations for Clients with Obesity · Ch 13 Considerations for Clients with Chronic Disease

---

## 6. Recent homepage/site polish (already shipped)
- Services section: eyebrow `WE DON'T JUST TRAIN YOU.` + heading "We design your behavior for *longevity*".
- Methodology heading: "How we transform *you*" (you in gold).
- Pillars reordered to Behavior Change → Physical Training → Education; `.method-num` restyled
  (large italic gold + underline accent).
- Methodology section moved ABOVE "Programs for each category".
- Exam-prep page (`/exam-prep`) has a revamped lime-accented "Chapterwise ACE Preparation" banner
  with feature chips + stat strip + "100% Free" badge (stats are aspirational with `+`).
- All 4 guide TOC bars un-stuck + scrollbar hidden; guides on warm→dark palette history (now dark).
- **Guide retrofits to full depth** from upgraded "v2" extractions: ch14 (1,634→3,683 words), ch7
  (1,521→2,803), ch12 (2,144→3,101). Ch15 was built full-depth from the start. (Ch13 guide ≈ 1,909
  words is the last remaining thin one; ch1/3/4/5 guides are the older restyled ones.)
- **Blog/SEO system shipped** — see §8. Added `image`/`imageAlt` to the blog schema, a poster image
  above the article heading + as the card thumbnail, markdown-table styling, and the first SEO post.

---

## 7. How to continue (quick start for a fresh agent)
1. Read this file + skim `src/pages/ace-prep/chapter-13.astro` and `chapter-13-guide.astro`.
2. To add a chapter: get the structured content (see §3e / `ACE_EXTRACTION_PROMPT.md`), then follow §3f.
3. To edit the site/brand voice: use the positioning in §1. Homepage is `src/pages/index.astro`;
   global styles are in `src/layouts/Layout.astro`.
4. Always `npx astro build` before committing. Push to `main` to ship.

---

## 8. Blog / Education (SEO) system
The `/blog` ("Education") section is the **client-acquisition channel** for online coaching — free,
value-first content that pulls in everyday people (a different audience from the ACE exam-prep, which
targets aspiring trainers).

- **Posts:** `src/content/blog/*.md`. Frontmatter schema (in `src/content.config.ts`): `title`,
  `description`, `category`, `pubDate`, optional `image`, optional `imageAlt`. `title` + `description`
  auto-fill the SEO `<title>` and meta description.
- **Render:** `src/pages/blog/[id].astro` (article; URL slug = the markdown filename) and
  `src/pages/blog/index.astro` (cards). In the markdown you can use these custom HTML blocks (already
  styled): `.chart-box` / `.chart-title` / `.chart-sub` (with inline `<svg>`), `.callout`,
  `.takeaway` + `.takeaway-label`, and `.article-cta` + `.btn-gold` (CTA links to `/#apply`). Markdown
  tables are styled; if a post has an `image`, it renders as a poster above the H1 and as the card thumbnail.
- **Images:** save the file to `public/blog/<name>.jpg` and set `image: "/blog/<name>.jpg"` in frontmatter.
  (An agent CANNOT save a chat-pasted image to disk — the owner drops the file in; then the agent commits it.)
- **Existing posts:** `cardio-decoded`, `fat-myth`, `how-muscles-grow`, `movement-assessment-explained`,
  `smart-program-design`, and the first SEO post `high-protein-indian-vegetarian-meals`
  (poster `public/blog/high-protein-indian-meal.jpg`).
- **SEO rules:** ORIGINAL copy only — never copy or closely paraphrase a source article (Google buries
  near-duplicates and it isn't ours to republish); take the topic, write it better. Target India
  long-tail keywords — informational top-of-funnel ("high protein indian vegetarian diet", "home workout
  for beginners") plus a few commercial ("online fitness coach india"). Add an **author byline +
  credentials** (E-E-A-T) — NOT yet added, a good quick win. Internal-link posts to each other and to
  coaching. One clearly-answered question per post. SEO is a slow 3–6 month compounding play.
- **Next ideas:** a "how to stay consistent with exercise" post (the behavior-change USP, low competition),
  and a dedicated "Online Coaching — how it works" money page targeting the commercial keywords.

---

## 9. Session history — what we did & how it went
Roughly chronological (oldest → newest):
1. **Guide readability fix (ch 1/3/4/5):** text was invisible due to a light-then-dark CSS cascade
   conflict; fixed with a dark `!important` override block, then un-stuck the floating TOC bars
   (`position:static` + hidden scrollbar).
2. **Exam-prep banner rebuild:** lime-accented "Chapterwise ACE Preparation" card — pain-point copy,
   feature chips, stat strip, "100% Free" badge, pulse-glow animation.
3. **Built the 4-tab system for chapters 6 → 2 → 13 → 12 → 7 → 14 → 15** from extraction MDs (8–11
   pre-existed; 1/3/4/5 were restructured). Ch13 had no quiz file, so the full 35-case + 30-theory bank
   was authored from the blog content.
4. **Homepage repositioning/polish:** Services eyebrow `WE DON'T JUST TRAIN YOU.` + heading "We design
   your behavior for *longevity*"; methodology heading "How we transform *you*"; pillars reordered to
   Behavior Change / Physical Training / Education with restyled 01/02/03 numerals; Methodology section
   moved above "Programs for each category".
5. **Locked the not-for-profit positioning** (§1) and wrote these handoff docs.
6. **Blog/SEO workstream:** added blog image support + table styling; shipped the first SEO post
   (high-protein Indian vegetarian meals) with a poster image.
7. **Guide-depth fix:** realized the new guides were too thin (~1,500–2,100 words vs ch10 ≈ 8,000).
   Upgraded `ACE_EXTRACTION_PROMPT.md` to demand a full 4,000–7,000-word reproduction, then re-extracted
   and rebuilt the **ch14, ch7, ch12** guides to full depth. Ch15 was built full-depth from the start.

**State now:** chapters **1–15 complete** (hubs + guides; guides full-depth except the slightly-thin
ch13 and the older ch1/3/4/5). Blog system live with 1 SEO post. Homepage on the new positioning.

**Remaining / next moves:**
- Build **chapters 16 & 17** (owner sends the v2 extraction MD per chapter → follow §3f).
- Optional: retrofit the **ch13** guide (re-extract v2) and deepen ch1/3/4/5 guides.
- Blog: add **author bylines**, publish the next SEO posts, build the **coaching money page**.
- Optional: register the not-for-profit legal entity to make the "not-for-profit" label literal.
