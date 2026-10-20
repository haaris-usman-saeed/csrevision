# COSC 3 midterm study site

An interactive study site for Dartmouth COSC 3 (Lectures 2 to 9), built from the eight lecture PDFs.

## Open it

1. Unzip the folder.
2. Double-click `index.html`.

That is all. It runs from the filesystem with no server, login or internet. Your progress is saved in this browser.

If your browser blocks local storage for files (some Safari setups do), use a local server instead:

```
cd cosc3-study
python3 -m http.server 8000
```

Then open http://localhost:8000. Progress is stored per address, so the double-click version and the localhost version keep separate progress. Use Progress and data → Export / Import to move it between them.

Fonts: Instrument Sans and IBM Plex Mono load from Google Fonts when you are online; offline, the site falls back to system fonts. Math is rendered with the bundled Latin Modern Math font and works offline.

## What is inside

- 50 lessons across the eight lectures, each with three layers: Understand in 60 seconds, Learn it properly, Midterm revision.
- 20 interactive labs, each with a reset to the lecture example and a live calculation "receipt".
- 196 questions in six modes (concept, numerical, formula selection, spot the mistake, prediction, worked exam problems with progressive hints). 55 use constructed numbers and are labeled "Extra practice".
- 66 formulas with plain English, variables, when to use, an example, the common mistake and the source page; 12 side-by-side comparisons of easily confused pairs.
- Midterm mode (by lecture, concept, type, difficulty, weakest topics, spaced review; optional timer), a 20-minute revision page, Weak areas, coverage map and search.

## Conventions

- "Lecture N" means the lecture number on the PDF (2 to 9). The sidebar numbers the sections 01 to 08.
- Page references are PDF pages, which differ from the slide numbers printed on some decks.
- Blue-edged blocks are "From the lecture". Grey-edged blocks are "Extra intuition" or extra worked numbers. Amber blocks flag slide inconsistencies (for example, L3 p. 29's variance does not match its own data).

## How mastery works

Only answers count, never reading. Needs review: last answer wrong with recent accuracy under 60%, or a spaced review is due. Confident: at least 3 answers and 70% recent accuracy. Mastered: at least 5 answers, 85% recent accuracy, last 3 correct, including at least one correct numerical, worked or harder question. Correct answers push the next review out (10 minutes, then 1, 3, 7, 14 days); a wrong answer brings it back in 10 minutes.

## Checks

`node tests/integrity.js` re-verifies the content: every referenced lab, question and formula exists; each multiple-choice question has exactly one correct option; every numeric answer is computed, finite and shown in its worked solution; no "common wrong answer" falls within the answer tolerance; all TeX commands are supported; no en or em dashes.

What was tested: the whole site in headless Chromium from file://, at 1440, 820 and 390 pixel widths: every lesson in all three layers, every lab's sliders and reset, answering and persistence across reload, a full timed session to the results page, every tool page, and horizontal overflow on phone width.

What was not tested: Safari, Firefox, a real phone or touch input, a screen reader, and the Google-hosted fonts (the test machine was offline, so screenshots used fallback fonts).
