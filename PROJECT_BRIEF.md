# Lifelong Athletics — Project Brief & Handoff

> **Read this first.** This file is the single source of truth for what this project is,
> what's been done, how it's built, and how to continue. It is written so that ANY coding
> agent (Claude Code, Kimi, Codex, etc.) — with no prior chat memory — can read it and
> proceed. The website lives in this git repo, not in any chat: losing a conversation
> never loses the work.

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

### Brand CSS tokens (dark theme, defined in `Layout.astro`)
`--black:#080808` · `--gold:#c9a84c` · `--white:#f5f0e8` · fonts: Cormorant Garamond (display) + DM Sans (body).
The **ACE chapter pages use a different palette** (see §3): lime accent `--accent:#c5f135` on near-black.

### Homepage section order (current)
hero → **Services** ("We don't just train you." eyebrow / "We design your behavior for *longevity*") →
**Methodology** ("How we transform *you*" + 3 pillars) → **Programs for each category** (`#who`) →
pull-quote → Testimonials → About → Apply.
The 3 methodology pillars, in order: **01 Behavior Change · 02 Physical Training · 03 Education**
(each card keeps its own SVG icon; the `.method-num` numerals are large italic gold with an underline accent).

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

---

## 7. How to continue (quick start for a fresh agent)
1. Read this file + skim `src/pages/ace-prep/chapter-13.astro` and `chapter-13-guide.astro`.
2. To add a chapter: get the structured content (see §3e / `ACE_EXTRACTION_PROMPT.md`), then follow §3f.
3. To edit the site/brand voice: use the positioning in §1. Homepage is `src/pages/index.astro`;
   global styles are in `src/layouts/Layout.astro`.
4. Always `npx astro build` before committing. Push to `main` to ship.
