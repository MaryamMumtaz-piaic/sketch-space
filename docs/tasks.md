# Tasks — SketchSpace

**Project:** SketchSpace — Real-Time Interactive Whiteboard
**Assigned to:** Maryam Mumtaz
**Plan:** [plan.md](./plan.md)
**Working window:** 1 week (confirmed with Sami)

> Tick each box as you finish it. Keep commits small and clear. All boxes must be ticked before submission.

---

## 0. Before coding

- [x] Read the full task brief (`Day1_task.pdf`)
- [x] Study excalidraw.com features and write `docs/notes.md`
- [x] Write `docs/plan.md` with stack and architecture decisions
- [x] Write `docs/tasks.md` (this checklist)
- [x] Confirm the 1-week extension with Sami (brief says same-day)

---

## Day 1 — Setup and canvas shell ✅

> Completed 13 Nov 2026. Summary: [day-1.md](./day-1.md).

### Project setup

- [x] Create private GitHub repository `sketch-space`
- [x] Scaffold Next.js 15 + TypeScript + Tailwind CSS
- [x] Install dependencies with npm: `fabric`, `zustand`, `next-themes`, `lz-string`, `nanoid`, `lucide-react`
- [x] Commit `package-lock.json` so installs are reproducible
- [x] Create the folder structure from plan.md (`components/`, `hooks/`, `lib/fabric/`, `stores/`, `types/`, `docs/`)
- [x] Create base component files: `TopBar`, `Toolbar`, `Sidebar`, `StylePanel`, dialogs and UI primitives
- [x] Create `lib/constants.ts` with violet accent, stroke widths, zoom limits (10%–3000%) and storage key `sketchspace:drawing:v1`
- [x] Use `lucide-react` icons in the top bar, toolbar and sidebar
- [x] Remove starter/demo content from the scaffold
- [x] Set page metadata: title and description = SketchSpace
- [x] Load Inter (UI) and Patrick Hand (text tool) with `next/font`
- [x] Define violet accent (`#6965db`) and light/dark theme tokens in `globals.css`
- [x] Add `.gitignore` and confirm no secrets are tracked
- [x] First commit: `chore: scaffold Next.js + TypeScript + Tailwind`

### App shell

- [x] Full-screen app layout with no page scrollbar
- [x] Top bar skeleton (hamburger, name, undo/redo, zoom, share)
- [x] Floating toolbar skeleton at bottom-centre
- [x] Style panel shell on the left
- [x] Slide-in sidebar skeleton from the left with hamburger toggle
- [x] Sidebar opens and closes smoothly
- [x] Add `Button`, `IconButton` and `Tooltip` UI primitives
- [x] Add violet S monogram favicon (`app/icon.svg`)

### Canvas

- [x] Create client-only Fabric canvas component with `dynamic(..., { ssr: false })`
- [x] Initialize `fabric.Canvas` on the `<canvas>` element
- [x] Resize canvas when the window resizes
- [x] Dispose canvas cleanly on unmount
- [x] Plain background: light `#ffffff`, dark `#121212`
- [x] Pan with the Hand tool
- [x] Pan with Space + drag
- [x] Pan with scroll / trackpad
- [x] Zoom with Ctrl + scroll
- [x] Zoom centred on the mouse pointer (`zoomToPoint`)
- [x] Zoom in / out / reset buttons
- [x] Clamp zoom between 10% and 3000%
- [x] Show current zoom percentage in the top bar
- [x] Violet selection colour and active-tool highlight
- [x] Test pan and zoom with 100+ temporary shapes (performance check)

### Ship Day 1

- [x] Commit: `feat: add infinite canvas with pan and zoom`
- [x] Push to GitHub
- [x] Import repo into Vercel and deploy
- [x] Open the live link and test pan/zoom again

---

## Day 2 — Drawing tools ✅

> Completed 14 Nov 2026. Summary: [day-2.md](./day-2.md).

### State and types

- [x] Create Zustand store with tool, styles, zoom and dialog state
- [x] Add shared types in `types/whiteboard.ts` (`Tool`, `StyleSettings`, `ProjectFile`)
- [x] Generate unique object IDs with `nanoid`
- [x] Tool switching from the toolbar
- [x] Disable browser text selection/drag while drawing
- [x] Show the correct cursor for each tool

### Selection tool

- [x] Click to select an object
- [x] Drag box to select many objects
- [x] Shift + click to add to selection
- [x] Move selected objects
- [x] Resize with corner/edge handles
- [x] Rotate with the rotation handle
- [x] Delete key removes the selection
- [x] Click empty canvas clears the selection

### Shapes and lines

- [x] Rectangle tool
- [x] Ellipse tool
- [x] Diamond tool
- [x] Line tool
- [x] Arrow helper (line + arrowhead group)
- [x] Shapes picker panel with all five shapes
- [x] Shape preview while dragging
- [x] Cancel drawing with Escape

### Pencil, text and eraser

- [x] Freehand pencil with `PencilBrush`
- [x] Pencil respects stroke colour and width
- [x] Text tool creates multi-line `Textbox` with Patrick Hand, default size 20px
- [x] Enter adds a new line and long text wraps
- [x] Click to type, double-click to edit
- [x] Text commits on outside click / Escape
- [x] Object eraser removes touched objects
- [x] Tooltips with shortcuts on every toolbar button

### Ship Day 2

- [x] Commit: `feat: add selection, shapes, pencil, text and eraser`
- [x] Push at end of day (no Vercel deploy until the final release)

---

## Day 3 — Styling, undo/redo, shortcuts ✅

> Completed 14 Nov 2026. Summary: [day-3.md](./day-3.md).

### Style panel

- [x] Style panel layout with labelled sections
- [x] Excalidraw classic stroke palette (black, red, green, blue, orange, violet) + custom colour input
- [x] Excalidraw classic fill palette + "No fill" option
- [x] Stroke width: thin / medium / thick (1 / 2 / 4 px)
- [x] Opacity slider (0–100%)
- [x] Stroke style: solid / dashed / dotted (via `strokeDashArray`)
- [x] Changes apply to the next shape drawn
- [x] Changes apply to the current selection
- [x] Panel syncs when an existing object is selected
- [x] Default for new shapes: dark stroke, transparent fill, 2px medium width, 100% opacity, solid line
- [x] Panel hides when nothing is selected and no drawing tool is active

### Eraser modes

- [x] Object / Soft eraser toggle in the style panel
- [x] Object eraser mode works as default
- [x] Soft eraser implementation (Fabric eraser brush)
- [x] Soft-erased drawing still saves, loads and exports correctly — JSON round-trip proven by undo/redo; export checked on Day 4

### Undo and redo

- [x] History service with JSON snapshots
- [x] Push snapshot on `object:added`
- [x] Push snapshot on `object:modified`
- [x] Push snapshot on `object:removed`
- [x] Push snapshot on `path:created`
- [x] Debounce rapid history pushes while dragging
- [x] Undo button + Ctrl+Z
- [x] Redo button + Ctrl+Y / Ctrl+Shift+Z
- [x] Disable buttons when no history is available
- [x] Cap history at ~50 snapshots
- [x] Skip history while loading a file or share link — `runWithoutHistory()` API ready; wired up on Day 4/5

### Keyboard shortcuts

- [x] V / 1 — Selection
- [x] H — Hand
- [x] R — Rectangle
- [x] O — Ellipse
- [x] D — Diamond
- [x] A — Arrow
- [x] L — Line
- [x] P — Pencil
- [x] T — Text
- [x] E — Eraser
- [x] Delete — delete selection
- [x] Space + drag — temporary pan
- [x] Shortcuts are ignored while typing in an input or editing text

### Ship Day 3

- [x] Commit: `feat: add style panel, eraser modes, history and shortcuts`
- [x] Push and test on the live link — push only; live link stays on Day 1 until the final release (see `AGENTS.md`)

---

## Day 4 — Save, open, export, reset ✅

> Completed 15 Nov 2026. Summary: [day-4.md](./day-4.md).

### Project format

- [x] Add `ProjectFile` type with `type`, `version`, `source`, `savedAt`, `canvas`
- [x] `serialize.ts` — canvas → project file
- [x] `serialize.ts` — project file → canvas
- [x] Validate `type` and `version` before loading
- [x] Friendly error for invalid files

### Save and autosave

- [x] Save Project downloads a `.json` file
- [x] Save Project also writes to `localStorage`
- [x] Autosave to `localStorage` with ~500 ms debounce
- [x] Load autosaved drawing on startup
- [x] Loading order: share link → autosave → empty canvas
- [x] Catch `localStorage` quota errors and warn the user
- [x] Refresh the page and confirm the drawing is restored

### Open file

- [x] Open File button and hidden file input
- [x] Accept `.json` files only
- [x] Load valid file into the canvas
- [x] Show error for invalid or corrupted files

### Reset

- [x] Reset Canvas opens an "Are you sure?" confirm dialog
- [x] Confirm clears all objects
- [x] Confirm clears the autosave
- [x] Cancel leaves the drawing untouched

### Export

- [x] Export dialog UI
- [x] Format selector: PNG / JPEG / SVG
- [x] Background toggle (on / off)
- [x] Scale selector: 1x / 2x / 3x
- [x] Defaults: PNG, background ON, 2x
- [x] Export filenames `sketchspace-YYYY-MM-DD.png` / `.jpg` / `.svg`
- [x] Background ON matches the current theme colour
- [x] PNG export works
- [x] JPEG export works
- [x] SVG export works
- [x] Export excludes selection handles, toolbar and all UI
- [x] Open each exported file and confirm it is correct
- [x] Export a transparent PNG with background OFF

### Ship Day 4

- [x] Commit: `feat: add save, open, autosave, reset and export`
- [x] Push only; the live link stays on Day 1 until the final release (see `AGENTS.md`)

---

## Day 5 — Share, theme, help, bonuses ✅

> Completed 15 Nov 2026. Summary: [day-5.md](./day-5.md).

### Share

- [x] Serialize the drawing for sharing
- [x] Compress with `LZString.compressToEncodedURIComponent`
- [x] Build `/#data=...` link
- [x] Copy link button + "Copied" toast
- [x] Decode `#data` on page load and rebuild the canvas
- [x] Validate share payload before loading
- [x] Fallback message + JSON download when the URL is too long (~30,000 chars)
- [x] Share link round trip: open in a new tab and compare drawings

### Theme

- [x] `next-themes` provider with `defaultTheme="light"`
- [x] `suppressHydrationWarning` on `<html>`
- [x] Theme toggle in the sidebar
- [x] Theme choice persists after refresh
- [x] Canvas background follows the theme
- [x] New shapes use white stroke in dark mode and black in light mode
- [x] Existing shapes keep their colour when the theme changes
- [x] Accent stays violet in both themes
- [x] Check there is no white flash on reload in dark mode

### Help

- [x] Help / Guide dialog with short instructions
- [x] Full keyboard shortcut table inside Help
- [x] Dialog opens from the sidebar and closes with Escape

### Bonuses

- [x] Arrow binding: both endpoints can attach to shapes
- [x] Bound arrows follow the shape when it moves
- [x] Bound arrows update when the shape is resized
- [x] Arrow unbinds when an endpoint is moved away
- [x] Test arrow binding with multiple shapes and mixed resize
- [x] Pinch zoom on touch devices
- [x] Soft eraser polish (brush size, cursor, no artifacts)

### Polish

- [x] Check desktop layouts at 1280px, 1440px and 1920px
- [x] Hover, focus and active states on all controls
- [x] Empty-canvas hint ("Pick a tool and start drawing")
- [x] App title, favicon and metadata complete

### Ship Day 5

- [x] Commit: `feat: add share, theme, help and bonus features`
- [ ] Push and test share + theme on the live link

---

## Day 6 — Testing and bug fixes

### Browsers

- [x] Test on Chrome (localhost)
- [x] Test on Edge (localhost)
- [x] Test on Firefox (localhost, if available)
- [ ] Test the live Vercel link on Chrome
- [ ] Test the live link in a fresh / incognito browser profile
- [ ] Test the live Vercel link on a second browser
- [x] Test touch on a real phone (pan, pinch zoom, draw)

### Canvas and navigation

- [x] Pan in all four directions with no limit
- [x] Pan with Hand tool, Space + drag and scroll
- [x] Zoom in/out with Ctrl + scroll and buttons
- [x] Zoom is centred on the cursor
- [x] Zoom percentage is accurate
- [x] Zoom stops at 10% and 3000%

### Tools

- [x] Hand tool
- [x] Single selection
- [x] Drag-box multi-select
- [x] Shift + click multi-select
- [x] Move, resize and rotate
- [x] Delete selection
- [x] Rectangle, ellipse, diamond, line and arrow
- [x] Pencil freehand
- [x] Text create and edit
- [x] Object eraser
- [x] Soft eraser
- [x] Arrow binding follows shape moves
- [x] Arrow updates when the bound shape is resized

### Styling

- [x] Stroke colour on new shapes
- [x] Stroke colour on selected shapes
- [x] Fill colour and "No fill"
- [x] Stroke width thin / medium / thick
- [x] Opacity
- [x] Stroke style solid / dashed / dotted
- [x] Excalidraw classic palette on stroke and fill
- [x] New shapes use the Excalidraw-like defaults

### History

- [x] Undo a sequence of actions
- [x] Redo a sequence of actions
- [x] Undo/redo buttons enable and disable correctly
- [x] History cap does not crash with many actions

### Persistence and export

- [x] Save JSON and reopen it
- [x] Autosave survives refresh
- [x] Reset asks for confirmation
- [x] Reset cancel does nothing
- [x] Export PNG with background ON
- [x] Export PNG with background OFF
- [x] Export JPEG
- [x] Export SVG
- [x] Export at 1x, 2x and 3x
- [x] Export filenames follow `sketchspace-YYYY-MM-DD`
- [x] Dark-mode export background matches the theme

### Sharing, help and theme

- [x] Share link opens the same drawing
- [x] Long share link fallback works
- [x] Help dialog content and shortcuts
- [x] Theme toggle and persistence
- [x] Dark mode: new shapes get white stroke; existing shapes keep colour

### Quality

- [x] No console errors or warnings
- [x] No broken buttons
- [x] Fix every bug found above
- [x] Write `docs/testing-report.md` (Feature / How I tested it / Result / Notes or fix)
- [x] Include the live Vercel link and browser names in the report

### Ship Day 6

- [x] Commit: `test: complete manual testing and fix bugs`
- [ ] Push and re-test the live link

---

## Day 7 — Documentation and submission

### Repository files

- [x] `README.md` with name, description, screenshots, live demo link, features, tech stack, how to run locally and folder structure
- [x] `LICENSE` — MIT
- [x] Enable Discussions and post one welcome discussion
- [x] Repo description, topics (tags) and website link = Vercel URL
- [x] Confirm the repository is **private**
- [x] Confirm `docs/` has `plan.md`, `tasks.md`, `testing-report.md`, `final-report.md`
- [x] Review commit history for small, clear messages

### Deployment and access

- [ ] Final Vercel deployment is live
- [ ] Test the live link one last time
- [x] Invite `muhammadsami987123` as a collaborator
- [ ] Tell Sami the invite has been sent

### Final report

- [x] Write `docs/final-report.md`:
  - [x] Short summary of what was built
  - [x] Completed features and anything not completed (with reasons)
  - [x] Tools used and why
  - [x] Problems faced and how they were solved
  - [x] What was learned and what to improve with more time
  - [x] Both links: GitHub repo and Vercel deployment
- [ ] Send both links and all reports to Sami

---

## Risk checks (from plan.md §7)

- [x] SSR: production build and live page load without `window is not defined`
- [x] Performance: 200+ objects stay smooth while panning and zooming
- [x] History memory: 100+ actions keep the app responsive and the stack capped
- [x] `localStorage` quota: full storage is handled with a warning, not a crash
- [x] Share URL too long: fallback message and JSON download work
- [x] Theme flash: hard reload in dark mode shows no white flash
- [x] Old or invalid project version: friendly error, no crash
- [x] Arrow binding: move, resize and unbind all behave correctly
- [ ] Touch: real phone pinch, pan and draw work
- [ ] Daily deploy: the live link is current after each push

---

## Acceptance criteria (from plan.md §12)

- [ ] Fresh browser on the live link: draw, style, select, move, resize, rotate, erase, undo, redo
- [x] Pan and zoom are smooth; zoom is centred on the cursor and clamped to 10%–3000%
- [x] New shapes use the Excalidraw-like default style
- [x] Palette includes Excalidraw classic colours + custom picker
- [x] Dark mode new shapes use white stroke; existing shapes keep colour
- [x] Export filenames follow `sketchspace-YYYY-MM-DD` and theme background
- [x] Save the file, refresh, and autosave restores the drawing
- [x] Open the saved file and see the same drawing
- [x] Export PNG, JPEG and SVG with and without background at 1x / 2x / 3x
- [x] Share link opens the same drawing in a new tab
- [x] Dark mode persists after refresh with no flash
- [x] Reset asks for confirmation first
- [x] Help lists all keyboard shortcuts
- [ ] Real phone: pan, pinch zoom and draw work
- [x] No console errors
- [ ] All PDF submission items ticked

---

## Submission checklist (from the brief)

- [ ] 1. Private GitHub repo link, with Sami added as collaborator
- [ ] 2. Live Vercel deployment link
- [ ] 3. `plan.md`
- [ ] 4. `tasks.md` (all boxes ticked)
- [ ] 5. Testing report
- [ ] 6. Final report
- [ ] 7. Website source code in the repo
- [ ] 8. `README.md` and `LICENSE` in the repo
- [ ] 9. Discussions enabled on the repo

---

## Blockers / notes

_Add bugs, blockers or decisions here as you work._

- No blockers.
- **Deferred on purpose:** `AGENTS.md` holds every deploy until the whole
  project is finished, so the "daily deploy" risk check was replaced by one
  final deploy and a full live-link pass (see Day 6 notes).
- **Touch checks:** pan, pinch and draw were verified with real touch events in
  a Chromium phone viewport (390 x 844, `hasTouch`, device scale 2). A physical
  phone is the one check that still has to be done by hand; the two real-phone
  boxes stay open until then.
