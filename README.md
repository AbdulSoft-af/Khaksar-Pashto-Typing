# Khaksar Pashto Typing

A lightweight, multi-page Pashto typing practice website built with semantic HTML, CSS, and vanilla JavaScript. No build step or third-party JavaScript dependency is required.

## Pages

- `index.html` — dashboard, daily goal, and personal summary.
- `pages/practice.html` — timed typing exercises, character-level feedback, metrics, and a virtual Pashto keyboard.
- `pages/lessons.html` — nine guided lessons with level filtering and completion state.
- `pages/results.html` — session history, summary statistics, individual removal, and CSV export.
- `pages/about.html` — usage guide and local-storage privacy note.

## Run locally

Open `index.html` in a modern browser, or serve the folder over HTTP for a more realistic deployment test. This project uses relative paths and does not need a bundler, npm packages, or a database.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/Khaksar-Pashto-Typing/` if the folder is served from its parent directory, or `http://localhost:8000/` if the server is started inside this folder.

## Features

- Pashto RTL layout with responsive desktop, tablet, and mobile styles.
- Bundled Noto Sans Arabic fonts (Regular, Medium, SemiBold, Bold) cover the essential Pashto letters and are loaded via local @font-face rules; no Google Fonts connection is needed.
- Local keyboard SVG icon used in typing-related navigation, headings, buttons, and branding; no icon CDN is required.
- Timed sessions of 30 seconds, 1 minute, 3 minutes, and 5 minutes.
- Correct/incorrect character feedback based on normalized Unicode graphemes (uses `Intl.Segmenter` when available); paste and drag/drop are blocked during a test to protect score fairness.
- Live WPM, CPM, accuracy, timer, and passage progress.
- Virtual keys for commonly used Pashto characters; the displayed grouping is a practice aid, not a claim that all operating-system keyboard layouts are identical.
- Lesson completion, best WPM, average accuracy, daily practice count, dark mode, local session history, and CSV export.
- All saved exercise data remains in the browser's LocalStorage; no backend or account is used.

## Measurement notes

WPM is estimated as correctly matched characters divided by five, per elapsed minute. CPM counts correctly matched characters per elapsed minute. Accuracy is the number of correctly matched typed graphemes divided by all typed graphemes. The results are useful for tracking progress, but they are estimates rather than a universal certification metric.

## Data and privacy

The application stores preferences, completed lesson IDs, and session statistics in LocalStorage. Clearing browser storage removes these records. No text or result is intentionally transmitted to a remote service.

## Smoke tests

Run the included dependency-free checks with Node.js:

```bash
node tests/smoke-test.js
```

The smoke test validates page metadata, local asset references, bundled fonts and keyboard icon, JavaScript syntax, lesson data, Unicode grapheme handling, and typing-stat calculations. In-browser interaction and responsive-layout checks were also run with browser automation during development.

## Suggested production checks

Test on the actual Pashto keyboard layout used by the audience, check Unicode edge cases on target browsers, run accessibility checks with a screen reader, and serve over HTTPS when deployed publicly.

## Offline assets and licenses

The app ships its Arabic-script fonts inside `assets/fonts/` and references them locally in `assets/css/style.css`. The font files are Noto Sans Arabic family files, with the SIL Open Font License included beside them. The required Pashto-specific letters (including پ، ټ، ډ، ړ، ږ، ښ، څ، ځ، ګ، ڼ، ئ، ۍ، ې) were checked for font glyph coverage. The keyboard SVG is stored at `assets/icons/keyboard.svg` and is referenced using relative paths, so it does not need an internet connection.

Upstream font source: https://github.com/google/fonts/tree/main/ofl/notosansarabic
Keyboard icon design reference: https://github.com/tabler/tabler-icons

The bundled static font files are self-contained and the app does not request them from the upstream site at runtime.
