# ACE Chapter — Content Extraction Prompt

This is the prompt to give a **fresh, context-free task** (any model) together with a scanned
chapter PDF. Its job is ONLY to extract + author the content/question bank. The structured output
it returns is then dropped into the Astro templates by the build agent (see `PROJECT_BRIEF.md` §3).

Paste everything in the box below into the new task, then attach the chapter PDF.

---

```
You extract and author ACE-CPT personal-trainer study content from a scanned textbook
chapter. I'm attaching a scanned PDF of ONE chapter. Read it carefully (it's scanned —
OCR it page by page) and return ONE structured document I can hand to a developer.

Base EVERYTHING strictly on the chapter's actual content. Do not invent facts. Keep all
real numbers (percentages, thresholds, ranges, mg/dose values, etc.) exact.

Output these 8 parts, in this order, using the EXACT JSON field names shown:

━━━ 1. META ━━━
- Chapter number and full title (read from the PDF)
- Hero subtitle: one sentence (~25 words) summarizing the chapter
- Accent phrase: the 1–2 words from the title to highlight

━━━ 2. GUIDE SECTIONS (the MOST important part — make it LONG and COMPLETE) ━━━
This becomes a full long-form study guide, so REPRODUCE THE CHAPTER IN FULL — do NOT
summarize, compress, or paraphrase tightly. This is the actual teaching text, not an
outline. **Target 4,000–7,000 words.** Err on the side of MORE detail, always.

Go section by section through the ENTIRE chapter and, for each section, write SEVERAL full
paragraphs that keep ALL of: every definition, every mechanism and "how/why it works"
explanation, every example and analogy, every number/range/threshold, every cited study
and statistic, every table, and every list. Explain each concept the way the textbook
explains it — in complete sentences and full paragraphs, not bullets-only. If the chapter
spends a page on a topic, your section should reflect that depth (a sentence or two is NOT
enough). Do not drop sub-sections, sidebars, "do the math" boxes, figures' captions, or
clinical/safety notes — fold them in.

For each section give: a short SECTION TAG label (2–3 words), an H2 heading, the FULL body
content as multiple paragraphs, plus any tables (as markdown tables), bullet lists, and
"callout" notes. Use markdown. Quality bar: a student who reads ONLY your GUIDE SECTIONS
should learn essentially everything the chapter teaches. (For reference, a good chapter
guide runs ~8,000 words — match that scale, not a 1,500-word summary.)

━━━ 3. MINDMAP (JSON) ━━━
About 8 branches covering the whole chapter:
[
  { "name": "BRANCH NAME IN CAPS", "subs": [
      { "name": "Sub-topic", "points": ["point 1","point 2","point 3","point 4"] },
      ... ~4 subs ...
  ]},
  ... ~8 branches ...
]

━━━ 4. THEORY_MCQ (JSON) — exactly 20 ━━━
Conceptual recall questions. Field "c" is the correct option's index (0–3).
[ { "q": "...", "opts": ["...","...","...","..."], "c": 2, "exp": "why it's correct" }, ... ]

━━━ 5. FILLIN (JSON) — exactly 5 ━━━
Use "________" for the blank. Keep the answer SHORT (one token/number when possible);
put any longer readable form in the hint.
[ { "q": "... ________ ...", "a": "shortAnswer", "hint": "readable hint" }, ... ]

━━━ 6. TRUEF (JSON) — exactly 5 ━━━
"a" is a boolean (true/false).
[ { "q": "statement", "a": false, "exp": "why" }, ... ]

━━━ 7. CASES (JSON) — exactly 7 scenarios, 5 questions each (35 total) ━━━
Applied/clinical scenarios with a named client. Field "ans" is the correct index (0–3).
Do NOT put "A." / "B." prefixes inside the options text.
[
  { "num": 1, "topic": "Topic — ClientName", "scenario": "2–4 sentence scenario",
    "qs": [ { "q": "...", "opts": ["...","...","...","..."], "ans": 1, "exp": "..." }, ... 5 ... ] },
  ... 7 cases ...
]

━━━ 8. QUICK REFERENCE ━━━
The chapter's most testable tables and key facts (so a student can cram from it).
Present as compact markdown tables + bullet "key term: definition" lines.

RULES:
- THEORY_MCQ = pure recall/definitions; CASES = applied decision-making. Make them
  COMPLEMENT each other, not repeat the same facts.
- Every MCQ/case question has exactly 4 options.
- Output valid, copy-pasteable JSON for parts 3–7 (double quotes, no trailing commas).
- Start by telling me the chapter number and title you detected, then give all 8 parts.
```

---

## Then, in a repo-connected agent
Paste that output and say: **"Build chapter N — here's the content:"** + paste. The build agent
follows `PROJECT_BRIEF.md` §3 (copy the chapter-13 templates, swap the data, register in
`STATIC_OVERRIDES`, build, commit, push).
