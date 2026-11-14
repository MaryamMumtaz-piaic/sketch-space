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

## Day 1 — Setup and canvas shell

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

## Day 2 — Drawing tools

### State and types

- [ ] Create Zustand store with tool, styles, zoom and dialog state
- [ ] Add shared types in `types/whiteboard.ts` (`Tool`, `StyleSettings`, `ProjectFile`)
- [ ] Generate unique object IDs with `nanoid`
- [ ] Tool switching from the toolbar
- [ ] Disable browser text selection/drag while drawing
- [ ] Show the correct cursor for each tool

### Selection tool

- [ ] Click to select an object
- [ ] Drag box to select many objects
- [ ] Shift + click to add to selection
- [ ] Move selected objects
- [ ] Resize with corner/edge handles
- [ ] Rotate with the rotation handle
- [ ] Delete key removes the selection
- [ ] Click empty canvas clears the selection

### Shapes and lines

- [ ] Rectangle tool
- [ ] Ellipse tool
- [ ] Diamond tool
- [ ] Line tool
- [ ] Arrow helper (line + arrowhead group)
- [ ] Shapes picker panel with all five shapes
- [ ] Shape preview while dragging
- [ ] Cancel drawing with Escape

### Pencil, text and eraser

- [ ] Freehand pencil with `PencilBrush`
- [ ] Pencil respects stroke colour and width
- [ ] Text tool creates multi-line `Textbox` with Patrick Hand, default size 20px
- [ ] Enter adds a new line and long text wraps
- [ ] Click to type, double-click to edit
- [ ] Text commits on outside click / Escape
- [ ] Object eraser removes touched objects
- [ ] Tooltips with shortcuts on every toolbar button

### Ship Day 2

- [ ] Commit: `feat: add selection, shapes, pencil, text and eraser`
- [ ] Push and confirm Vercel redeploy works

---

## Day 3 — Styling, undo/redo, shortcuts

### Style panel

- [ ] Style panel layout with labelled sections
- [ ] Excalidraw classic stroke palette (black, red, green, blue, orange, violet) + custom colour input
- [ ] Excalidraw classic fill palette + "No fill" option
- [ ] Stroke width: thin / medium / thick (1 / 2 / 4 px)
- [ ] Opacity slider (0–100%)
- [ ] Stroke style: solid / dashed / dotted (via `strokeDashArray`)
- [ ] Changes apply to the next shape drawn
- [ ] Changes apply to the current selection
- [ ] Panel syncs when an existing object is selected
- [ ] Default for new shapes: dark stroke, transparent fill, 2px medium width, 100% opacity, solid line
- [ ] Panel hides when nothing is selected and no drawing tool is active

### Eraser modes

- [ ] Object / Soft eraser toggle in the style panel
- [ ] Object eraser mode works as default
- [ ] Soft eraser implementation (Fabric eraser brush)
- [ ] Soft-erased drawing still saves, loads and exports correctly

### Undo and redo

- [ ] History service with JSON snapshots
- [ ] Push snapshot on `object:added`
- [ ] Push snapshot on `object:modified`
- [ ] Push snapshot on `object:removed`
- [ ] Push snapshot on `path:created`
- [ ] Debounce rapid history pushes while dragging
- [ ] Undo button + Ctrl+Z
- [ ] Redo button + Ctrl+Y / Ctrl+Shift+Z
- [ ] Disable buttons when no history is available
- [ ] Cap history at ~50 snapshots
- [ ] Skip history while loading a file or share link

### Keyboard shortcuts

- [ ] V / 1 — Selection
- [ ] H — Hand
- [ ] R — Rectangle
- [ ] O — Ellipse
- [ ] D — Diamond
- [ ] A — Arrow
- [ ] L — Line
- [ ] P — Pencil
- [ ] T — Text
- [ ] E — Eraser
- [ ] Delete — delete selection
- [ ] Space + drag — temporary pan
- [ ] Shortcuts are ignored while typing in an input or editing text

### Ship Day 3

- [ ] Commit: `feat: add style panel, eraser modes, history and shortcuts`
- [ ] Push and test on the live link

---

## Day 4 — Save, open, export, reset

### Project format

- [ ] Add `ProjectFile` type with `type`, `version`, `source`, `savedAt`, `canvas`
- [ ] `serialize.ts` — canvas → project file
- [ ] `serialize.ts` — project file → canvas
- [ ] Validate `type` and `version` before loading
- [ ] Friendly error for invalid files

### Save and autosave

- [ ] Save Project downloads a `.json` file
- [ ] Save Project also writes to `localStorage`
- [ ] Autosave to `localStorage` with ~500 ms debounce
- [ ] Load autosaved drawing on startup
- [ ] Loading order: share link → autosave → empty canvas
- [ ] Catch `localStorage` quota errors and warn the user
- [ ] Refresh the page and confirm the drawing is restored

### Open file

- [ ] Open File button and hidden file input
- [ ] Accept `.json` files only
- [ ] Load valid file into the canvas
- [ ] Show error for invalid or corrupted files

### Reset

- [x] Reset Canvas opens an "Are you sure?" confirm dialog
- [x] Confirm clears all objects
- [ ] Confirm clears the autosave
- [ ] Cancel leaves the drawing untouched

### Export

- [ ] Export dialog UI
- [ ] Format selector: PNG / JPEG / SVG
- [ ] Background toggle (on / off)
- [ ] Scale selector: 1x / 2x / 3x
- [ ] Defaults: PNG, background ON, 2x
- [ ] Export filenames `sketchspace-YYYY-MM-DD.png` / `.jpg` / `.svg`
- [ ] Background ON matches the current theme colour
- [ ] PNG export works
- [ ] JPEG export works
- [ ] SVG export works
- [ ] Export excludes selection handles, toolbar and all UI
- [ ] Open each exported file and confirm it is correct
- [ ] Export a transparent PNG with background OFF

### Ship Day 4

- [ ] Commit: `feat: add save, open, autosave, reset and export`
- [ ] Push and test download/open on the live link

---

## Day 5 — Share, theme, help, bonuses

### Share

- [ ] Serialize the drawing for sharing
- [ ] Compress with `LZString.compressToEncodedURIComponent`
- [ ] Build `/#data=...` link
- [ ] Copy link button + "Copied" toast
- [ ] Decode `#data` on page load and rebuild the canvas
- [ ] Validate share payload before loading
- [ ] Fallback message + JSON download when the URL is too long (~30,000 chars)
- [ ] Share link round trip: open in a new tab and compare drawings

### Theme

- [x] `next-themes` provider with `defaultTheme="light"`
- [x] `suppressHydrationWarning` on `<html>`
- [x] Theme toggle in the sidebar
- [x] Theme choice persists after refresh
- [x] Canvas background follows the theme
- [ ] New shapes use white stroke in dark mode and black in light mode
- [ ] Existing shapes keep their colour when the theme changes
- [x] Accent stays violet in both themes
- [x] Check there is no white flash on reload in dark mode

### Help

- [x] Help / Guide dialog with short instructions
- [x] Full keyboard shortcut table inside Help
- [x] Dialog opens from the sidebar and closes with Escape

### Bonuses

- [ ] Arrow binding: both endpoints can attach to shapes
- [ ] Bound arrows follow the shape when it moves
- [ ] Bound arrows update when the shape is resized
- [ ] Arrow unbinds when an endpoint is moved away
- [ ] Test arrow binding with multiple shapes and mixed resize
- [ ] Pinch zoom on touch devices
- [ ] Soft eraser polish (brush size, cursor, no artifacts)

### Polish

- [ ] Check desktop layouts at 1280px, 1440px and 1920px
- [ ] Hover, focus and active states on all controls
- [ ] Empty-canvas hint ("Pick a tool and start drawing")
- [ ] App title, favicon and metadata complete

### Ship Day 5

- [ ] Commit: `feat: add share, theme, help and bonus features`
- [ ] Push and test share + theme on the live link

---

## Day 6 — Testing and bug fixes

### Browsers

- [ ] Test on Chrome (localhost)
- [ ] Test on Edge (localhost)
- [ ] Test on Firefox (localhost, if available)
- [ ] Test the live Vercel link on Chrome
- [ ] Test the live link in a fresh / incognito browser profile
- [ ] Test the live Vercel link on a second browser
- [ ] Test touch on a real phone (pan, pinch zoom, draw)

### Canvas and navigation

- [ ] Pan in all four directions with no limit
- [ ] Pan with Hand tool, Space + drag and scroll
- [ ] Zoom in/out with Ctrl + scroll and buttons
- [ ] Zoom is centred on the cursor
- [ ] Zoom percentage is accurate
- [ ] Zoom stops at 10% and 3000%

### Tools

- [ ] Hand tool
- [ ] Single selection
- [ ] Drag-box multi-select
- [ ] Shift + click multi-select
- [ ] Move, resize and rotate
- [ ] Delete selection
- [ ] Rectangle, ellipse, diamond, line and arrow
- [ ] Pencil freehand
- [ ] Text create and edit
- [ ] Object eraser
- [ ] Soft eraser
- [ ] Arrow binding follows shape moves
- [ ] Arrow updates when the bound shape is resized

### Styling

- [ ] Stroke colour on new shapes
- [ ] Stroke colour on selected shapes
- [ ] Fill colour and "No fill"
- [ ] Stroke width thin / medium / thick
- [ ] Opacity
- [ ] Stroke style solid / dashed / dotted
- [ ] Excalidraw classic palette on stroke and fill
- [ ] New shapes use the Excalidraw-like defaults

### History

- [ ] Undo a sequence of actions
- [ ] Redo a sequence of actions
- [ ] Undo/redo buttons enable and disable correctly
- [ ] History cap does not crash with many actions

### Persistence and export

- [ ] Save JSON and reopen it
- [ ] Autosave survives refresh
- [x] Reset asks for confirmation
- [x] Reset cancel does nothing
- [ ] Export PNG with background ON
- [ ] Export PNG with background OFF
- [ ] Export JPEG
- [ ] Export SVG
- [ ] Export at 1x, 2x and 3x
- [ ] Export filenames follow `sketchspace-YYYY-MM-DD`
- [ ] Dark-mode export background matches the theme

### Sharing, help and theme

- [ ] Share link opens the same drawing
- [ ] Long share link fallback works
- [ ] Help dialog content and shortcuts
- [ ] Theme toggle and persistence
- [ ] Dark mode: new shapes get white stroke; existing shapes keep colour

### Quality

- [ ] No console errors or warnings
- [ ] No broken buttons
- [ ] Fix every bug found above
- [ ] Write `docs/testing-report.md` (Feature / How I tested it / Result / Notes or fix)
- [ ] Include the live Vercel link and browser names in the report

### Ship Day 6

- [ ] Commit: `test: complete manual testing and fix bugs`
- [ ] Push and re-test the live link

---

## Day 7 — Documentation and submission

### Repository files

- [ ] `README.md` with name, description, screenshots, live demo link, features, tech stack, how to run locally and folder structure
- [x] `LICENSE` — MIT
- [x] Enable Discussions and post one welcome discussion
- [ ] Repo description, topics (tags) and website link = Vercel URL
- [x] Confirm the repository is **private**
- [ ] Confirm `docs/` has `plan.md`, `tasks.md`, `testing-report.md`, `final-report.md`
- [ ] Review commit history for small, clear messages

### Deployment and access

- [ ] Final Vercel deployment is live
- [ ] Test the live link one last time
- [x] Invite `muhammadsami987123` as a collaborator
- [ ] Tell Sami the invite has been sent

### Final report

- [ ] Write `docs/final-report.md`:
  - [ ] Short summary of what was built
  - [ ] Completed features and anything not completed (with reasons)
  - [ ] Tools used and why
  - [ ] Problems faced and how they were solved
  - [ ] What was learned and what to improve with more time
  - [ ] Both links: GitHub repo and Vercel deployment
- [ ] Send both links and all reports to Sami

---

## Risk checks (from plan.md §7)

- [ ] SSR: production build and live page load without `window is not defined`
- [ ] Performance: 200+ objects stay smooth while panning and zooming
- [ ] History memory: 100+ actions keep the app responsive and the stack capped
- [ ] `localStorage` quota: full storage is handled with a warning, not a crash
- [ ] Share URL too long: fallback message and JSON download work
- [ ] Theme flash: hard reload in dark mode shows no white flash
- [ ] Old or invalid project version: friendly error, no crash
- [ ] Arrow binding: move, resize and unbind all behave correctly
- [ ] Touch: real phone pinch, pan and draw work
- [ ] Daily deploy: the live link is current after each push

---

## Acceptance criteria (from plan.md §12)

- [ ] Fresh browser on the live link: draw, style, select, move, resize, rotate, erase, undo, redo
- [ ] Pan and zoom are smooth; zoom is centred on the cursor and clamped to 10%–3000%
- [ ] New shapes use the Excalidraw-like default style
- [ ] Palette includes Excalidraw classic colours + custom picker
- [ ] Dark mode new shapes use white stroke; existing shapes keep colour
- [ ] Export filenames follow `sketchspace-YYYY-MM-DD` and theme background
- [ ] Save the file, refresh, and autosave restores the drawing
- [ ] Open the saved file and see the same drawing
- [ ] Export PNG, JPEG and SVG with and without background at 1x / 2x / 3x
- [ ] Share link opens the same drawing in a new tab
- [ ] Dark mode persists after refresh with no flash
- [x] Reset asks for confirmation first
- [x] Help lists all keyboard shortcuts
- [ ] Real phone: pan, pinch zoom and draw work
- [ ] No console errors
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

- No blockers yet.
