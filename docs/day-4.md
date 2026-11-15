# Day 4 — Save, open, autosave and export

**Date:** 14–15 November 2026
**Status:** Complete

## What shipped

- **Project format.** `ProjectFile` now stores `type`, `version`, `source`,
  `savedAt` and `canvas`, matching the plan:
  `type: "whiteboard"`, `version: 1`, `source: "sketch-space"`. The Fabric scene
  is stored as-is, but half-drawn preview objects and the theme background are
  stripped so the same file opens cleanly in light or dark mode.
- **`serialize.ts`.** `toProjectFile()` turns a canvas into a project file;
  `parseProjectFile()` accepts raw JSON text or an object, validates `type`,
  `version` and the `canvas.objects` array, and throws a friendly
  `ProjectFileError` for every bad-file case (not JSON, wrong app, newer
  version, damaged payload).
- **Save Project.** The sidebar action downloads
  `sketchspace-YYYY-MM-DD.json` and writes the same project to `localStorage`.
- **Autosave.** A 500 ms debounced copy is written after each history snapshot,
  which covers drawing, styling, erasing, undo and redo through one hook. The
  last session loads on startup after the history baseline is created, without
  becoming an undo step.
- **Loading order.** Startup checks a `#data=` share payload first, then the
  autosave, then starts empty. The share decoder itself arrives on Day 5; the
  guard already stops autosave from overwriting an incoming payload.
- **Quota handling.** `localStorage` writes are wrapped in `try/catch`. A full
  or unavailable store shows a warning and pauses autosave instead of breaking
  the app, and the warning is not repeated on every edit.
- **Open File.** A hidden `.json` file input is triggered from the sidebar. The
  file is read, validated and loaded through `runWithoutHistory()`, so opening a
  project clears the undo stack and starts a fresh history baseline. Invalid and
  corrupted files show a specific error and never touch the canvas.
- **Reset.** Confirming the existing dialog clears every object, drops the
  history and removes the autosave key. An empty board also clears the autosave
  on later edits, so a reset cannot come back after a refresh. Cancel leaves the
  drawing untouched.
- **Export dialog.** PNG, JPEG and SVG; background on/off; 1x / 2x / 3x scale.
  Defaults are PNG, background ON and 2x on every open. Scale is disabled for
  SVG because vectors already stay sharp. Filenames are
  `sketchspace-YYYY-MM-DD.png` / `.jpg` / `.svg`.
- **Export rendering.** PNG and JPEG use `toDataURL` with `multiplier` and
  quality `0.95`; SVG uses `toSVG()`. Background ON uses the current theme's
  canvas colour (`#ffffff` or `#121212`); OFF clears the background for a
  transparent PNG. JPEG cannot store transparency, so background OFF falls back
  to white instead of black. Fabric's export path skips controls, so selection
  handles, toolbars and all other UI are never included.

## Verified

- `npm run lint`, `npx tsc --noEmit` and `npm run build` pass.
- Playwright against real Chrome, no console or page errors:
  - drawing a rectangle and ellipse writes a valid autosave
    (`type: "whiteboard"`, `version: 1`, no background, two objects);
  - a refresh restores both objects and shows the restore toast;
  - Save Project downloads `sketchspace-2026-11-14.json` with the same two
    objects and re-writes `localStorage`;
  - cancelling Reset keeps both objects; confirming it leaves zero objects and
    removes the autosave key; a refresh stays empty;
  - a wrong-type file, broken JSON and a newer-version file each show their own
    friendly error and leave the canvas empty;
  - opening the saved project restores both objects;
  - export defaults are PNG, background ON and 2x;
  - the 2x PNG is `2880 × 1800` for a `1440 × 900` canvas, starts with the PNG
    signature, and samples white at the corner;
  - a background-OFF PNG samples `rgba(0, 0, 0, 0)` at the corner;
  - JPEG exports as `.jpg` with the correct signature and a white corner;
  - SVG exports as `.svg` with the background rect and both shapes, and the
    scale buttons disable themselves;
  - dark mode exports a `#121212` background;
  - overriding `localStorage.setItem` to throw `QuotaExceededError` shows the
    storage warning after the next autosave.

## Fixes made during Day 4

- Reset previously left an empty history step and could be undone. It now runs
  through `runWithoutHistory()` and clears the history entirely.
- Autosave listens to history snapshots instead of canvas events, so style-panel
  edits and undo/redo also persist (plain `object:modified` misses them).
- An empty canvas removes the autosave key rather than storing an empty project,
  which makes "Reset clears the autosave" true even after the debounce fires.
- JPEG with background OFF uses white, since the format has no alpha channel.
- Export temporarily swaps the canvas background and always restores it in a
  `finally` block, so the live board never loses its theme colour.

## Notes

- Exports cover the visible canvas at the current zoom, as specified by the
  `toDataURL` approach in the plan. Panning or zooming first changes the framing.
- Project files deliberately exclude the theme background and viewport; the app
  reapplies the current theme and keeps the user's view when opening a file.
- No Vercel deploy was made — the live link still serves the Day 1 build until
  the final release (see [`AGENTS.md`](../AGENTS.md)).
