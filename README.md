# Khaksar Pashto Typing

A lightweight, multi-page Pashto typing practice website built with semantic HTML, CSS, and vanilla JavaScript. No build step or third-party JavaScript dependency is required.

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


## Data and privacy

The application stores preferences, completed lesson IDs, and session statistics in LocalStorage. Clearing browser storage removes these records. No text or result is intentionally transmitted to a remote service.

