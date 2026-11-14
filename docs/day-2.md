# Day 2 — Drawing tools

**Date:** 14 November 2026
**Status:** Complete

## What shipped

- **Selection tool** — click to select, drag-box to select many, Shift + click to
  add, move, resize with corner/edge handles, rotate with the rotation handle,
  `Delete` / `Backspace` to remove, click on empty canvas to clear.
- **Shapes** — rectangle, ellipse, diamond, line and arrow, all drawn by dragging
  with a live preview and committed on mouse-up.
- **Arrow helper** — a `Line` shaft plus a filled `Triangle` head inside one
  `Group`, so an arrow moves, resizes and deletes as a single object.
- **Pencil** — `PencilBrush` freehand strokes that respect the current stroke
  colour and width, with `strokeUniform` so the line keeps its width when zoomed.
- **Text** — click to place a multi-line `Textbox` (`Patrick Hand`, 20 px,
  240 px wrap width), `Enter` for a new line, double-click to edit, commits on
  `Escape` / outside click / toolbar click, and empty text is discarded.
- **Object eraser** — click or drag to remove whole objects under the pointer.
- **Object IDs** — every shape, line, arrow, path and text label gets a `nanoid`.
- **Cursor per tool** — select `default`, hand `grab`, text `text`, pencil and
  shapes `crosshair`; `grabbing` while panning.
- After drawing, the tool returns to **Selection** and the new object is
  selected, matching Excalidraw.
- Dark mode draws new shapes with a light `#e8e8ec` stroke; switching to light
  makes new shapes dark while existing objects keep their colour.
- Excalidraw-style selection chrome — violet `#6965db` border, white circular
  corner handles with a violet ring.

## Verified

- `npm run lint`, `npx tsc --noEmit` and `npm run build` pass.
- Playwright against real Chrome, no console or page errors:
  - all five shapes draw, get unique IDs, and become the active selection;
  - pencil path is created with the chosen colour and width;
  - text is created, edited by double-click, wrapped to 4 lines, and removed
    when left empty;
  - click select, drag-box select, Shift + click multi-select, move, resize and
    rotate all work; `Delete` removes the selection and an empty click clears it;
  - object eraser deletes exactly one object per click;
  - `Escape` cancels an in-progress shape without leaving leftovers;
  - right-click, Hand tool and Space + drag never draw;
  - styles (red stroke, blue fill, bold, dashed, 50 % opacity, no fill) apply to
    new shapes;
  - cursors match the tool table above.
- Production build served with `next start` and smoke-tested in Chrome:
  shape, arrow, pencil and text drawing, deleting a selected object and the
  dark-mode switch all work with no console errors, and the dev-only
  `window.__sketchspace` handle is absent from production.

## Fixes made during Day 2

- Space-to-pan was re-checked against drawing tools: `skipTargetFind`,
  `selection` and `isDrawingMode` are all driven from one shared mode function so
  panning always wins over drawing.
- Diamond preview rebuilds the polygon on each move instead of mutating its point
  list, which kept the bounding box correct.
- Preview objects are marked `selectable: false` / `evented: false` so a
  half-drawn shape can never be picked up by the selection tool.
- Native image drag from the upper canvas is blocked (`draggable = false` plus a
  `dragstart` guard) and the canvas gets `user-select: none`.
- Text commits when any UI outside the canvas is clicked, not only when the
  canvas is clicked.
- Starting a new drawing drops the previous selection first.
- Arrowhead enlarged (14 px base, 0.88 aspect) so short arrows stay readable.
- Text selection highlight inside an editing textbox uses the violet accent.

## Notes

- The soft eraser is intentionally disabled in the style panel with a "Day 3"
  tag; object erasing is the Day 2 mode.
- Styling the current selection, undo / redo, saving, export and sharing are
  Day 3+ work.
- No Vercel deploy was made — the live link still serves the Day 1 build until
  the final release (see [`AGENTS.md`](../AGENTS.md)).
