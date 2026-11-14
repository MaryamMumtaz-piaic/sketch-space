# Day 3 — Styling, undo/redo and shortcuts

**Date:** 14 November 2026
**Status:** Complete

## What shipped

- **Style panel applies to the selection.** Stroke colour, fill, stroke width,
  opacity and solid / dashed / dotted now update every selected object, and
  still apply to the next shape drawn.
- **Panel mirrors the selection.** Selecting an object copies its stroke, fill,
  width, opacity and dash pattern into the panel, so the controls show the real
  state instead of the last used style. Multi-selection follows the first
  object. Arrows report the shaft's colour through their line child, and text
  reports its fill as the text colour.
- **Panel visibility.** The panel appears while a drawing tool is active or
  something is selected, and hides on an empty canvas with the Selection tool.
- **Soft eraser.** New `@erase2d/fabric` dependency powers a `EraserBrush`
  toggle next to the object eraser. Soft erasing clips inside shapes instead of
  deleting them; object erasing stays the default.
- **Undo / redo.** A 50-snapshot JSON history with:
  - snapshots on `object:added`, `object:modified`, `object:removed` and
    `path:created`, plus explicit captures when a shape, text label, style
    change or erasing gesture finishes;
  - a 300 ms debounce so a drag or erase gesture is one step;
  - redone history dropped when you draw after undoing;
  - theme background and viewport preserved when a snapshot is restored;
  - top-bar buttons that disable themselves, `Ctrl+Z`, `Ctrl+Shift+Z` and
    `Ctrl+Y`;
  - `runWithoutHistory()` so a future file/share load re-baselines the stack.
- **Keyboard shortcuts.** `1` is an alias for Selection, and undo / redo are
  ignored while typing inside a text object.

## Verified

- `npm run lint`, `npx tsc --noEmit` and `npm run build` pass.
- Playwright against real Chrome, no console or page errors:
  - three rectangles undo one at a time back to an empty canvas, then redo one
    at a time, with the buttons reporting the right disabled state;
  - moving a shape is a single undo step and restores the exact position;
  - soft erasing adds a `ClippingGroup` clip path without removing the object,
    and undo/redo toggles the clip path;
  - object erasing still removes exactly one shape per click;
  - recolouring an arrow updates both the shaft and the arrowhead;
  - multi-select restyling changes both objects;
  - selecting a text label and picking violet changes its text colour;
  - the panel syncs black / no fill / medium / solid when a default shape is
    selected;
  - the panel disappears when the selection is cleared;
  - `1` returns to the Selection tool;
  - `Ctrl+Z` while a text object is being edited leaves the object on the canvas;
  - a style change is its own undo/redo step, and undoing a soft erase keeps the
    earlier restyle intact.

## Fixes made during Day 3

- The preview shapes added on Day 2 were briefly entering the history. They are
  now flagged and filtered out of every snapshot.
- A finished shape did not fire another canvas event, so its history entry could
  depend on timer luck. Completion now captures immediately.
- Half-typed text is never snapshotted; the textbox exit event captures the
  final label, so one undo removes the whole label.
- The soft eraser commits manually so the snapshot is taken after the clip paths
  exist, not before.
- Soft eraser strokes restore the pencil brush when the mode is switched back.

## Notes

- Panel edits on a selection are debounced into one history step, so a slider
  drag does not flood the stack. Style changes made with no selection only
  affect the next shape and are not history steps.
- `runWithoutHistory()` is ready but unused until Day 4 (open file) and Day 5
  (share link).
- No Vercel deploy was made — the live link still serves the Day 1 build until
  the final release (see [`AGENTS.md`](../AGENTS.md)).
