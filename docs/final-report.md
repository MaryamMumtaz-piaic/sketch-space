# Final report — SketchSpace

**Project:** SketchSpace — an Excalidraw-style infinite whiteboard
**Built by:** Maryam Mumtaz
**Assigned by:** Muhammad Sami
**Duration:** 1 week (Days 1–7)
**Version:** `0.6.0`
**GitHub repository:** <https://github.com/MaryamMumtaz-piaic/sketch-space>
**Live deployment:** <https://sketchspace-whiteboard.vercel.app>

## Short summary

SketchSpace is a browser whiteboard built with Next.js 15, TypeScript, Tailwind
CSS and Fabric.js v6. It runs entirely in the browser: the infinite canvas, the
drawing tools, styling, undo/redo, autosave, project files, image exports and
share links all work without a server or an account.

The result matches the brief: clean geometric shapes, a light default theme with
a violet accent, the full Excalidraw-style toolset, object and soft erasers, a
plain white / `#121212` canvas, an Excalidraw-like layout, the classic colour
palette plus white, `sketchspace-YYYY-MM-DD` export filenames, 10 %–3000 % zoom,
white strokes for new shapes in dark mode, arrow binding, and share links that
carry the whole drawing.

- **126 automated checks passed** across the dev and production builds, Chrome,
  Edge, Firefox and a touch viewport — see
  [`testing-report.md`](./testing-report.md).
- `npm run lint`, `npx tsc --noEmit` and `npm run build` are clean.
- The production bundle is 19.6 kB for the page with 135 kB First Load JS.

## What was built

### Canvas and app shell

- Full-screen responsive shell, top bar, floating toolbar, slide-in menu, style
  panel, tooltips and toasts
- Fabric.js infinite canvas on a plain white or `#121212` background
- Pan with the Hand tool, `Space` + drag, middle-drag, scroll and one-finger touch
- Zoom with buttons, `Ctrl` + scroll and pinch, always centred on the pointer
- Zoom clamped to 10 %–3000 % with a click-to-reset percentage readout
- Light and dark themes saved in `localStorage`, applied before the first paint

### Drawing and editing

- Rectangle, ellipse, diamond, line and arrow with a live preview
- Freehand pencil, multi-line text in Patrick Hand 20 px with double-click editing
- Click, `Shift` + click and drag-box selection; move, resize, rotate and delete
- Object eraser plus the soft eraser with three brush sizes and a ring cursor
- Arrows bind to both ends of a shape and follow moves, resizes and rotations

### Styling

- Stroke and fill colours from the Excalidraw classic palette plus a custom picker
- Stroke width 1 / 2 / 4 px, opacity, and solid / dashed / dotted styles
- Styles apply to the current selection and to the next shape, and the panel
  mirrors the selected object

### Files, export and sharing

- Save Project (`sketchspace-YYYY-MM-DD.json`), Open File with validation and
  friendly errors, 500 ms autosave, confirmed Reset
- PNG / JPEG / SVG export with background on or off at 1×, 2× and 3×
- Share links compress the whole drawing into the URL; oversized boards fall back
  to a JSON download, and damaged links warn instead of breaking the board
- Help dialog with the full keyboard map, `M` for the menu, `?` for help

### Not built (with reasons)

- **Real-time collaboration** — the brief asks for a local whiteboard; a server
  and a CRDT would have been a second project.
- **Image upload, libraries, frames, laser pointer** — out of scope in the brief
  and cut to keep the core tools polished.
- **Rough.js hand-drawn look** — the brief explicitly asks for clean geometric
  shapes instead.
- **A fully responsive mobile layout** — desktop-first by decision; touch pan,
  pinch and draw do work, and the phone screenshot shows the result.
- **Short share links** — would need a database or KV store; instead the drawing
  travels inside the URL with a `.json` fallback above 30,000 characters.

## Tools used and why

| Tool | Why |
| --- | --- |
| Next.js 15 (App Router) | React framework with routing, metadata and one-command Vercel deploys |
| TypeScript | Catches shape, project-file and API mistakes while the app grows |
| Tailwind CSS v4 | Fast, consistent styling and the Excalidraw-like layout |
| Fabric.js v6 | Mature canvas engine: objects, transforms, serialisation, export |
| @erase2d/fabric | The only reliable soft eraser for Fabric v6 |
| Zustand | Small, fast UI store without provider boilerplate |
| next-themes | Class-based dark mode with no flash on reload |
| lucide-react | Consistent icon set for the toolbar and menus |
| nanoid | Short unique ids stored on every object |
| lz-string | Compression for share links, with a URL-safe output |
| Playwright | Real-browser testing with downloads, pixels and touch events |
| Vercel | Hosting that matches Next.js and gives a preview/production URL |

## Problems faced and how they were solved

1. **Fabric v6 does not ship a reliable pinch gesture.** Built pinch zoom on
   native `touchstart` / `touchmove` / `touchend` handlers with clamping and a
   midpoint zoom. A second finger cancels any shape preview, so pinching never
   leaves a stray rectangle.
2. **One-finger pan was dead on touch screens.** Fabric forwards raw
   `TouchEvent`s to `mouse:down` / `mouse:move`, and the position lives on
   `changedTouches`, not on `clientX`. `clientPoint()` read only `clientX`, so
   the pan handler compared `(0, 0)` with `(0, 0)`. It now falls back to the
   active touch point (Day 6 fix).
3. **Theme changes restyled the selected shape.** A `themeRevision` token makes
   the selection effect skip theme-driven writes, so existing shapes always keep
   their colour while the panel switches to the white swatch.
4. **Undo history filling memory.** A 50-snapshot cap, a `suspendHistory` /
   `resumeHistory` pair around multi-step operations (arrow re-binding, load,
   erase) and collapsed gestures keep the stack small and predictable.
5. **Share links that are too long.** Links above 30,000 characters are refused
   before copying, and the dialog offers a project download instead.
6. **Autosave on a full disk.** `localStorage` quota errors are caught and shown
   as a warning ("Browser storage is full, so autosave paused") while Save
   Project keeps working.
7. **A Firefox font-preload warning.** Next.js preloaded the Patrick Hand font
   even though it is only needed once a text label exists. `preload: false` for
   that font removed the warning while keeping the font on demand.
8. **Test tooling limits.** The dev build exposes the Fabric canvas, but the
   production build must not, so the production suites assert through downloads
   and sampled pixels. Dev and production cannot share `.next` at the same time,
   so the suites run one after the other.

## What was learned

- Canvas apps need explicit interaction ownership: Fabric handles mouse and touch
  differently, and every extra gesture (pinch, space-drag, soft erase) needs a
  clear precedence and a preview-cancel path.
- Serialising a canvas is a product decision, not just a technical one. Keeping
  the project format small, versioned and validated makes save / open / share
  all safer and easier to test.
- Testing through the UI on a production build catches different bugs than
  state-level tests. The touch-pan bug only appeared with real touch events in a
  production bundle.
- A history cap plus collapsed gestures matters more than raw undo depth for a
  drawing tool.

## What to improve with more time

- Real-time multi-user editing with a small CRDT and presence cursors.
- Shape libraries, image upload, frames and a laser pointer.
- A mobile-first layout with a bottom sheet for styles, instead of relying on a
  desktop layout that still works on touch.
- Short share links backed by a KV store, keeping the URL fallback for offline
  use.
- A richer test suite in the repository (Playwright tests committed with CI),
  rather than the local scripts used for Day 6.

## Links and documents

- **Repository:** <https://github.com/MaryamMumtaz-piaic/sketch-space>
- **Live app:** <https://sketchspace-whiteboard.vercel.app> — final deploy on a
  new Vercel account; the old Day 1 preview URL no longer serves this build
- Plan: [`plan.md`](./plan.md)
- Task checklist: [`tasks.md`](./tasks.md)
- Testing report: [`testing-report.md`](./testing-report.md)
- Daily notes: [`day-1.md`](./day-1.md) … [`day-5.md`](./day-5.md)
