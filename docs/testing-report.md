# Day 6 — Testing report

**Dates:** 15–16 November 2026
**Status:** Complete (live-link checks run after the final deploy)
**Build under test:** `0.6.0`, local production build (`next start`) plus the dev
build for state-level checks
**Live link:** <https://maryam-whiteboard.vercel.app>

## How the testing was done

Testing was automated with **Playwright 1.62.1** driving the real browsers, plus
manual checks in the browser for visual details (spacing, colours, cursors). Two
suites were used because the app exposes its Fabric canvas as
`window.__sketchspace` only in development:

- **Dev build suite** — reads exact canvas state (object types, coordinates,
  bindings, zoom transform) for the deep functional checks.
- **Production build suite** — asserts only through what a user can see: the DOM,
  downloads (project JSON, PNG/JPEG/SVG) and rendered pixels, so it proves the
  shipped bundle works.

Nothing in the repository depends on the test scripts; exports were verified by
reading PNG/JPEG headers and sampled pixels, and project files by parsing the
downloaded JSON.

**Total: 126 checks, all passing.**

| Suite | Build | Checks | Result |
| --- | --- | --- | --- |
| Deep functional | dev (`:3000`) | 42 | 42 / 42 pass |
| Persistence, export, share, theme, help | production (`:3100`) | 24 | 24 / 24 pass |
| Risk, keyboard, performance, edge cases | production | 17 | 17 / 17 pass |
| Chrome / Edge / Firefox matrix | production | 33 | 33 / 33 pass |
| Touch (phone viewport) | production | 10 | 10 / 10 pass |

**Browsers:** Chrome (stable, Playwright's `chrome` channel), Microsoft Edge
(stable), Firefox 159.0 on Windows 11. Phone checks used Chromium with a
390 × 844 viewport, `hasTouch`, device scale 2 and real touch events
(including two-finger events through CDP).

## Results

### Canvas and navigation

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Pan in all four directions, no limit | Hand tool, four 100 px drags, then six full-width drags; read `viewportTransform` on dev | Pass | Translation reached 4,800 px with no clamp |
| Pan with Hand tool, Space + drag and scroll | Hand-tool drag, Space held while dragging, wheel scroll | Pass | All three move the canvas; scroll pans vertically |
| Zoom with Ctrl + scroll and buttons | Ctrl + wheel at a fixed point; zoom-in/zoom-out buttons | Pass | Buttons step by 20 % (1 → 1.2 → 1.44) |
| Zoom centred on the cursor | Compared the scene point under the pointer before and after the wheel zoom | Pass | Drift < 1.5 px |
| Zoom percentage accurate | Read the zoom label after each action | Pass | 120 % shown for 1.2 exactly |
| Zoom stops at 10 % and 3000 % | 30 zoom-ins then 60 zoom-outs | Pass | Clamps at 30× and 0.1×; buttons disable at both ends |

### Tools

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Hand tool | Drag across the canvas in all directions | Pass | Cursor switches to grab/grabbing |
| Single selection | Click a shape; read active object count | Pass | 1 object selected |
| Shift + click multi-select | Shift-click a second shape | Pass | 2 objects selected |
| Drag-box multi-select | Drag an empty box around both shapes | Pass | 2 objects selected |
| Move, resize, rotate | Drag the shape body, the `br` handle and the `mtr` handle | Pass | Position moves, scale > 1.1, rotation > 5° |
| Delete selection | Press Delete with a shape selected | Pass | Board empties |
| Rectangle, ellipse, diamond, line, arrow | Draw one of each; read object types | Pass | Types `Rect`, `Ellipse`, `Polygon`, `Line`, arrow `Group` |
| Pencil freehand | Drag with the Draw tool | Pass | Creates an erasable `Path` |
| Text create and edit | Click with the Text tool, type, Escape; then double-click the label and append text | Pass | Patrick Hand, 20 px; edited text persists |
| Object eraser | Click a shape with the Eraser tool | Pass | Whole shape removed |
| Soft eraser | Brush sizes and ring cursor (Day 5 regression) | Pass | Ring matches the 12/24/40 px brush |
| Arrow binding | Draw an arrow between two rectangles; read `bindStart` / `bindEnd` | Pass | Both ends bound to the correct shape ids |
| Arrow follows a move | Drag the bound rectangle, read the arrow start point | Pass | Endpoint moved with the shape |
| Arrow follows a resize | Resize a bound shape | Pass | Arrow rebuilt against the new edge |

### Styling

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Default shape style | Draw a rectangle with no styling | Pass | `#1e1e1e`, 2 px, no fill, opacity 1, solid |
| Stroke colour on new shapes | Pick red, then draw | Pass | New shape is `#e03131` |
| Stroke colour on selected shapes | Select a green shape, apply green | Pass | Selected shape recoloured |
| Fill colour and "No fill" | Apply orange fill, then "No fill" | Pass | `#ffec99`, then empty fill |
| Stroke width thin / medium / bold | Apply all three | Pass | 1 / 2 / 4 px |
| Opacity | Slider to 40 % then 100 % | Pass | 0.4 then 1 |
| Stroke style solid / dashed / dotted | Apply all three | Pass | Dash arrays appear and clear |
| Excalidraw classic palette | Count swatches | Pass | 7 strokes (incl. white), 6 fills + "No fill" |
| Styling persists | Save the project and reopen it | Pass | Colours, widths and opacity round-trip |

### History

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Undo a sequence | Three shapes → undo three times | Pass | 3 → 2 → 0 objects |
| Redo a sequence | Three redos | Pass | 0 → 3 objects |
| Buttons enable/disable | Check `disabled` at both ends of the stack | Pass | Undo disabled after the first draw is undone |
| History cap with many actions | 60 rectangles, then undo until disabled | Pass | 45–50 undos available, no crash or slowdown |
| Keyboard undo/redo | Ctrl + Z, Ctrl + Shift + Z, Ctrl + Y | Pass | Object counts change as expected |

### Persistence and export

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Save JSON and reopen | Save Project, then load the file with Open File | Pass | 2 objects before and after; toast "Drawing loaded." |
| Project file shape | Parse the download | Pass | `type: whiteboard`, `version: 1`, `source: sketch-space`, ISO `savedAt` |
| Autosave survives refresh | Reload after drawing | Pass | Toast "Restored your last drawing." |
| Reset asks for confirmation | Open Reset from the menu | Pass | Dialog appears with Cancel / Reset canvas |
| Reset cancel does nothing | Cancel, then save and count objects | Pass | Drawing untouched |
| All invalid files fail softly | Broken JSON, wrong `type`, future `version: 99` | Pass | Friendly toast each time, current drawing kept |
| PNG with background ON | Default export checks | Pass | 2× = 2880 × 1800, corner pixel `255,255,255,255` |
| PNG with background OFF | 1× export, transparent | Pass | 1440 × 900, corner alpha 0 |
| PNG at 3× | 3× export | Pass | 4320 × 2700 |
| JPEG | Export JPEG with background off | Pass | Real JPEG (`ffd8`), white background fallback |
| SVG | Export SVG | Pass | Vector document with `<rect>` / `<ellipse>`, no UI text |
| Filenames | Inspect `suggestedFilename` | Pass | `sketchspace-2026-11-15.png` / `.jpg` / `.svg` / `.json` |
| Dark-mode export background | Toggle dark, export 1× with background | Pass | Corner pixel `18,18,18` (`#121212`) |
| Save with a full disk | Fill `localStorage` to the quota, then draw | Pass | Warning "Browser storage is full, so autosave paused."; Save Project still downloads |
| Big board save | 250-object project, Save Project | Pass | 250 objects round-trip |

### Sharing, help and theme

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Share link opens the same drawing | Copy the link, open it in a new tab, save the project there | Pass | Same object count; `#data=` hash removed after load |
| Long share link fallback | 1,200-object board (URL > 30,000 chars) | Pass | Link replaced by the size warning and a JSON download |
| Damaged share link | Open `#data=this-is-not-compressed` | Pass | Friendly toast, canvas still usable after the error |
| Help dialog content | Open Help from the menu and from `?` | Pass | Tools, canvas shortcuts, pinch, "Good to know" and share notes present |
| Escape closes Help | Press Escape while Help is open | Pass | Dialog closes |
| Theme toggle and persistence | Toggle dark, reload | Pass | `html.dark` survives the reload; canvas is `#121212` |
| No light flash on reload | Record `documentElement.className` at `DOMContentLoaded` with the dark theme stored | Pass | Class is already `dark` before first paint |
| Dark mode strokes | Draw in dark mode | Pass | New shape stroke is `#ffffff`; existing shapes keep their colour |
| Menu shortcuts | `M` toggles the menu, `?` opens Help | Pass | Both work, and no shortcuts fire while a dialog is open |

### Quality

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| No console errors | Collected `console` errors and `pageerror` in every suite and browser | Pass | Zero errors; one known Firefox font-preload warning, explained below |
| No broken buttons | Click every toolbar tool and every menu item; check `aria-pressed` / dialog titles | Pass | 10 tools and 6 menu actions respond |
| Accessible names | Scan all visible buttons for an empty name | Pass | Every button has text or an `aria-label` |
| Rapid interaction | 54 tool clicks with no waiting, then draw | Pass | Toolbar never gets stuck |
| Narrow window | 900 × 700 and a 390 × 844 phone viewport | Pass | Style panel hides below `md`, canvas still draws |
| Busy board performance | 250 objects: import, 4 zoom-ins, 2 pans, save | Pass | Load < 20 s, zoom/pan under 6 s including automation overhead |
| Server render | Fetch `/`, `/manifest.webmanifest`, `/icon.svg` | Pass | 200s, no `window is not defined` |
| Escape cancels a shape | Start a rectangle, press Escape mid-drag | Pass | No stray object is created |

### Browsers and touch

| Feature | How I tested it | Result | Notes / fix |
| --- | --- | --- | --- |
| Chrome | Full journey: shortcuts, all shapes, text, zoom, undo/redo, theme, help, PNG, reload | Pass | 11 / 11 checks |
| Edge | Same journey | Pass | 11 / 11 checks |
| Firefox | Same journey | Pass | 11 / 11 checks |
| Phone layout | 390 × 844, touch enabled | Pass | No horizontal scroll, no style panel, toolbar reachable |
| Touch draw | One-finger drag with the Rectangle tool | Pass | Rectangle appears in the export |
| Touch pan | One-finger drag with the Hand tool | Pass | **Bug found and fixed** (see below) |
| Pinch zoom | Two-finger pinch via CDP touch events | Pass | 100 % → > 100 %, label in sync |
| Pinch cancels a preview | Start a one-finger shape, add a second finger | Pass | No stray shape, zoom still changes |
| Draw after a pinch | Ellipse after pinch + reset | Pass | Shape created normally |
| Console on touch | Collect errors during the whole phone run | Pass | Zero errors |

## Bugs found and fixed

1. **One-finger pan did nothing on touch screens.** Fabric forwards raw
   `TouchEvent`s to `mouse:down` / `mouse:move`, and those events carry their
   position on `changedTouches`, not on `clientX` / `clientY`. `clientPoint()` in
   `components/canvas/useFabricCanvas.ts` read only `clientX` / `clientY`, so the
   pan handler always compared `(0, 0)` with `(0, 0)` and the canvas never moved.
   The helper now falls back to the active touch point, which fixes one-finger
   panning with the Hand tool (and Space + drag) on phones and tablets.
   Verified by sampling the live canvas before and after a touch pan: the stroke
   leaves its old pixel and appears 200 px higher.
2. **Firefox console warning about the Patrick Hand preload.** `next/font`
   preloaded the handwriting font on every page even though it is only needed
   once a text label exists, so Firefox warned that the preloaded resource was
   unused. The font is now configured with `preload: false`
   (`app/layout.tsx`); it still loads on first use, and the warning is gone.

Both fixes were re-tested with the affected suites (dev, production, browser and
touch) before this report was written.

## Notes and deferrals

- The Day 1 deployment is still what <https://maryam-whiteboard.vercel.app>
  serves. Deploys are intentionally held until the whole project is finished
  (see [`AGENTS.md`](../AGENTS.md)), so the live-link checks in
  [`tasks.md`](./tasks.md) are the last step before release; they are repeated
  after the final deploy.
- Firefox occasionally prints a font-preload warning in headless automation even
  though the font is loaded (`document.fonts` reports it as `loaded`). It is a
  browser heuristic, not an app warning; the browser suite ignores only that
  exact message and still fails on any other warning.
- Fonts, icons and the manifest are served from the same origin; there are no
  third-party requests, which is why CSP and offline behaviour were out of scope
  for Day 6.
- `window.__sketchspace` exists only in development, by design. Production tests
  never depend on it; that is why they assert through downloads and pixels.
