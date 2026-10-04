# Lifelong Athletics — UX & Aesthetics Audit

**Date:** 2026-10-03 · **Reviewed by:** Claude (Opus 4.8)
**Scope:** Full crawl of the live dev build at desktop (~1280px) and phone (375×812).
Pages surveyed: Home (every section), Education (`/blog`), Exam Prep (`/exam-prep`),
ACE Prep (`/ace-prep`), Adventure Trips (`/adventure-trips`). Global chrome: `Nav.astro`
(top nav + mobile bottom bar), `Layout.astro` (hero, WhatsApp float, shared styles), `Footer.astro`.

**Goal:** higher engagement + a more aesthetic, enjoyable experience — especially on mobile.

---

## ✅ Implemented (2026-10-04)
Shipped in this pass (verified desktop + mobile, production build clean):
- **P0.1** WhatsApp bubble lifted above the mobile bottom bar — overlap gone, site-wide.
- **P0.2 / P1.5** Mobile hero tightened (`min-height:auto`, less padding) — **CTA now above the fold**, void removed.
- **P1.3** Services grid → **1 column** on phones (≤600px).
- **P1.6** Testimonials → **3-up** at desktop (orphaned card fixed).
- **P1.4** Reduced-motion safety net — content never stuck hidden by the fade-in.
- **P2.7** Global muted-text contrast nudged `0.45 → 0.55`.
- Homepage copy/structure: hero sub → *"…enjoy exercise and build strength for life"*; **"Programs for each category" moved directly under the hero**; persona problems/solutions shortened; Momentum Seeker label → *"Seeking better performance"*.

**Still open (need your input/content):** real photography (persona cards + mobile hero), social-proof number strip, CTA-verb alignment, footer WhatsApp-link tidy (P2.9). See **P2.10** below.

---

## What's already working (keep it)
- **Strong, consistent luxe identity** — gold-on-black, Cormorant display + DM Sans, signature gold-italic `<em>`. Reads premium and cohesive across every page.
- **App-style mobile bottom bar** (Home / Education / Exam Prep / Adventure / Apply) is genuinely good — clear icons, labels, the gold "Apply" CTA tab. This is a real engagement asset.
- **Category pills** on `/blog` are nicely sized for tap.
- **Interactive embeds** (quizzes, toolkits, practice exam) work well and are a differentiator.
- Typography hierarchy and the alternating dark-surface section rhythm are tasteful.

---

## P0 — Fix now (defects actively hurting mobile UX)

### 1. WhatsApp button overlaps the mobile bottom bar *(every page)*
- **Where:** `.floating-wa` is `position:fixed; bottom:32px; right:32px; z-index:999` (`src/layouts/Layout.astro:773`). The `.mobile-bottom-bar` is `position:fixed; bottom:0; z-index:9998`, shown at ≤980px (`src/components/Nav.astro:44`). Bar height ≈ **60px + safe-area**.
- **Why it matters:** At 32px the WhatsApp bubble sits directly on the bar's right edge, colliding with the "Apply" tab on **every page**. Looks broken and blocks a tap target — the first thing a phone visitor sees.
- **Fix:** On ≤980px, lift the bubble above the bar and shrink it slightly:
  ```css
  @media (max-width: 980px) {
    .floating-wa {
      bottom: calc(76px + env(safe-area-inset-bottom));
      right: 16px;
      width: 52px; height: 52px;
    }
  }
  ```
- **Effort:** ~5 min.

### 2. Home hero is empty on mobile + the primary CTA is below the fold
- **Where:** `#hero` is `min-height:100vh` with content vertically centred (`Layout.astro`). The ECG canvas (`#hero-art`) is intentionally hidden on mobile, so the headline floats in black. "Get a Free Consultation" + its caption land **below the first screen** — a visitor must scroll to find the main action.
- **Why it matters:** The money action being off-screen on load is the single biggest conversion leak on mobile; the empty void also reads as "unfinished."
- **Fix:** On mobile, drop hero `min-height` to ~`auto`/`88vh`, tighten top padding and the `.hero-sub` `margin-bottom` so **headline + sub + CTA + caption all sit above the fold**. Optionally add a subtle static gradient/texture (or a real photo) behind the mobile hero since the animation is hidden, so it doesn't read as blank.
- **Effort:** ~20–30 min.

---

## P1 — High value

### 3. Services grid is 2-column (cramped) on phones *(Home)*
- **Where:** `.service-grid` collapses to `1fr 1fr` at ≤768px (`Layout.astro`). At 375px each card body is ~140px wide, so copy wraps into a tall cramped ladder ("movements, / and / periodisation —").
- **Fix:** add a ≤520px breakpoint → single column:
  ```css
  @media (max-width: 520px) { .service-grid { grid-template-columns: 1fr; } }
  ```
- **Effort:** ~5 min.

### 4. Hero fade-up leaves heroes blank for ~0.6–1s on load *(all pages)*
- **Where:** hero text uses `opacity:0` + `animation: fadeUp … 0.7s forwards` with delays. Verified on `/ace-prep` and `/adventure-trips`: the H1/CTA are invisible on first paint, then fade in. On mobile (no bg art) and slower devices this looks empty/broken.
- **Fix:** shorten/stagger-less the delays on mobile, and make the animation a pure enhancement — content should be legible even before/without JS (e.g. start near-visible, animate the last 10–15%). Also respect `prefers-reduced-motion` for the text (the canvas already does).
- **Effort:** ~15 min.

### 5. Mobile heroes carry heavy empty top space *(ace-prep, exam-prep, adventure)*
- **Where:** each hero reserves tall top padding/min-height; on phones the logo sits alone, then a big gap before the eyebrow/title.
- **Fix:** tighten hero top padding + min-height at ≤768px site-wide (shared pattern) so content starts higher and the page feels denser/more intentional.
- **Effort:** ~15–20 min.

### 6. Testimonials orphan the 3rd card on desktop *(Home)*
- **Where:** 3 testimonial cards in a 2-column grid → the 3rd sits alone with a dead empty cell beside it.
- **Fix:** use 3 columns at desktop (`repeat(3,1fr)`) — or centre a 2+1. 3-up also reads as stronger social proof.
- **Effort:** ~5 min.

---

## P2 — Polish & engagement boosters

### 7. Low-contrast muted copy on pure black
- `.hero-sub` and some body copy use `var(--muted)` = `rgba(245,240,232,0.45)`. On #080808 that's borderline for legibility (and WCAG). Nudge the key lines to ~0.6 opacity (or a dedicated `--muted-strong`) so the value prop actually reads.

### 8. Scroll-reveal is fragile (content starts invisible)
- Personas, service cards, diff-items start at `opacity:0` and depend on `IntersectionObserver`. On fast scroll they flash dim; if JS fails they're invisible. Make reveal a pure enhancement (visible by default, animate in).

### 9. Footer "WhatsApp" link sits under the floating bubble (desktop)
- After the P0 reposition, verify the footer link clears the bubble — or drop the redundant footer WhatsApp link since the float is always present.

### 10. Bigger engagement levers (higher effort, high payoff)
- **Real photography.** The hero and persona cards use abstract line-art/stick figures. Real coach + client/transformation photos (you already have real images in your pipeline) would lift trust and dwell time more than any CSS tweak — especially in the persona cards' empty visual boxes and behind the mobile hero.
- **Social proof near the top.** A thin strip of numbers (clients coached, years, certifications, transformations) above or just under the hero gives instant credibility.
- **Tighten the home page length.** It's long; consider merging "Services" (8 cards) into the "Who this is for" story, or making Services a compact 2-row scannable list, so visitors reach testimonials/CTA sooner.
- **One consistent primary CTA verb.** Hero now says "Get a Free Consultation"; the Apply section says "Submit Application"; nav says "Apply Now." Aligning these (all "Book a free consultation") reduces friction.

---

## Suggested execution order
1. **P0.1** WhatsApp overlap (5 min, global, visible win)
2. **P0.2** Mobile hero density + CTA above fold (biggest conversion impact)
3. **P1.3 / P1.6** Services 1-col + testimonials 3-up (quick, high polish)
4. **P1.4 / P1.5** Hero fade-up + hero spacing (site-wide feel)
5. **P2** Contrast, reveal robustness, footer link
6. **Boosters** real photos + social-proof strip (plan separately — content needed)

*P0 + the quick P1s are ~1 hour of work and cover the most visible issues.*
