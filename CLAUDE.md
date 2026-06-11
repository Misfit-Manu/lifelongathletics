# Lifelong Athletics

**Start here:** read [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) for full project context — what this
site is, the brand positioning, the ACE-CPT chapter build system, conventions, gotchas, and what's
done vs. remaining. For adding a new chapter, also see [`ACE_EXTRACTION_PROMPT.md`](./ACE_EXTRACTION_PROMPT.md).

## TL;DR
- Astro static site for **Lifelong Athletics** — a not-for-profit-style initiative that teaches
  people *how to train for life* and *designs behavior for longevity*.
- Repo: `Misfit-Manu/lifelongathletics` (branch `main`). Build: `npx astro build`. Ship: push to `main`.
- Main workstream: 17 ACE-CPT chapter pages, each a 4-tab hub (`chapter-N.astro`) + a theory guide
  (`chapter-N-guide.astro`). Templates to copy: `src/pages/ace-prep/chapter-13*.astro`.
- Done: chapters 1–15. **Remaining: 16, 17.**
- Critical gotcha: a new chapter id must be added to `STATIC_OVERRIDES` in
  `src/pages/ace-prep/[id].astro`, and guide `.toc-bar` must be `position:static` (see brief §4).
