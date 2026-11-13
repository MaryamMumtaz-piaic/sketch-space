# Plan — SketchSpace

**Project:** SketchSpace — Real-Time Interactive Whiteboard
**Assigned to:** Maryam Mumtaz
**Assigned by:** Muhammad Sami
**Day:** 01
**Reference:** https://excalidraw.com/
**Status:** Plan written before coding
**Working window:** 1 week (confirmed with Sami)

> The original brief asks for same-day delivery. Sami has confirmed a 1-week extension. The Vercel deployment goes live from Day 1 and is redeployed daily.

---

## 0. Locked decisions

| Area | Decision |
|---|---|
| App name | **SketchSpace** (repo: `sketch-space`) |
| Visual style | Clean geometric shapes (Fabric native), no rough.js wobble |
| Default theme | **Light** |
| Accent colour | **Violet `#6965db`** |
| UI language | **English** |
| Text tool | **Multi-line Textbox** in **Patrick Hand** (Google Fonts); UI font **Inter** |
| Fill styles | **Solid only** (no hachure / cross-hatch) |
| Eraser | **Object eraser (default) + soft eraser toggle** |
| Save / share | **Client-side only**: `localStorage`, JSON files, lz-string URL hash |
| Bonus features | **Arrow binding (both ends + resize-follow), soft eraser, pinch zoom** |
| Mobile | **Desktop-first**, with touch pan / zoom / draw |
| Default export | **PNG, background ON, 2x**; JPEG and SVG options |
| Canvas background | **Plain** (light `#ffffff`, dark `#121212`) |
| Default drawing style | **Excalidraw-like**: dark stroke, transparent fill, 2px medium width, 100% opacity, solid line |
| Zoom limits | **10% – 3000%** |
| Dark mode default | New shapes use **white stroke** on `#121212`; light uses black; existing shapes keep their colour |
| Text default size | **20px** |
| Layout | Toolbar **bottom-centre**, style panel **left**, sidebar **left** |
| Palette | **Excalidraw classic** (black, red, green, blue, orange, violet) + custom picker |
| Export filename | `sketchspace-YYYY-MM-DD` |
| Export background | Matches the **current theme** when ON |
| Favicon | **Violet S monogram** (`app/icon.svg`) |
| Package manager | **npm** |
| Touch testing | **Real phone** on the live link |
| Docs location | **`docs/`** folder |
| Accounts | GitHub + Vercel ready |

---

## 1. What are we building?

**SketchSpace** is a full-screen, Excalidraw-style whiteboard web app.

The user gets an infinite canvas where they can draw and arrange:

- Rectangles, ellipses, diamonds, lines and arrows
- Freehand pencil strokes
- Text in a handwritten font
- Any of the above with custom stroke colour, fill colour, stroke width, opacity and stroke style

They can select one or many objects, move, resize, rotate and delete them, undo and redo, pan and zoom freely, save the drawing, reopen it later, export it as an image, share it with a link, and switch between light and dark mode.

The app is built with Next.js (App Router), TypeScript and Tailwind CSS, and is deployed on Vercel from a private GitHub repository.

### Definition of done

The task is complete when:

- The app runs with no errors and every feature in the brief works
- Code is in a **private** GitHub repository with README, LICENSE and docs
- The app is **live on Vercel** and tested on the live link
- `plan.md`, `tasks.md`, `testing-report.md` and `final-report.md` are written
- Muhammad Sami has repo access and has received both links

---

## 2. Tools chosen and why

| Part | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Complex canvas state; types catch mistakes before runtime and make refactoring safe |
| Package manager | **npm** | Comes with Node; Vercel default; simplest setup |
| Framework | **Next.js 15 (App Router)** | Required by the brief; simple deployment to Vercel |
| Styling | **Tailwind CSS** | Required; fast to build a clean, consistent UI with dark mode |
| Canvas | **Fabric.js v6** | Built-in selection, resize, rotate, JSON save/load, PNG and SVG export |
| State | **Zustand** | Small and fast; holds UI state without re-rendering the whole app |
| Theme | **next-themes** | Light/dark toggle that persists after refresh |
| Icons | **lucide-react** | Clean, consistent icon set close to Excalidraw's feel |
| IDs | **nanoid** | Short unique IDs for shapes |
| Share compression | **lz-string** | Keeps shareable URLs short enough to be practical |
| Hosting | **Vercel** | Required by the brief |

### 2.1 Language: TypeScript

We will use **TypeScript**, not plain JavaScript.

1. The canvas state is complex (shapes, selection, zoom, history). Types catch mistakes before runtime.
2. Next.js has first-class TypeScript support.
3. Fabric.js, Zustand and Next.js all ship their own type definitions.
4. Safer refactoring and cleaner components — the brief asks for "organised components, clear names, small files".
5. The brief itself says: *"Use TypeScript if you can."*

### 2.2 Canvas: Fabric.js v6

**Why Fabric:**

- **Selection & transforms are built in** — drag-box multi-select, Shift + click, move, resize and rotate handles. The hardest part of the checklist comes for free.
- **Save / Open** — `canvas.toJSON()` and `canvas.loadFromJSON()` serialize every object; no custom serializer needed.
- **Export** — `toDataURL()` for PNG and `toSVG()` for SVG.
- **Text** — `Textbox` supports multi-line typing, text wrapping and double-click editing; font set to Patrick Hand.
- **Freehand** — `PencilBrush` handles pen strokes with smoothing.
- **Performance** — the object model plus canvas renderer handles hundreds of shapes smoothly.

**Arrow note:** Fabric has no built-in arrow class. We build a small helper that combines a line with an arrowhead and groups them, so arrows can still be selected, moved and styled.

**Alternatives considered:**

| Option | Why not chosen |
|---|---|
| Konva / react-konva | Nice React integration, but SVG export and JSON save/load must be written by hand |
| Raw HTML Canvas API | Closest to real Excalidraw, but hit-testing, resize, rotate and text editing would all be custom — too risky |
| Raw Canvas + rough.js | Wobble style was declined; much more work than Fabric |

### 2.3 State: Zustand

Fabric keeps the drawing objects inside its own canvas model. Zustand only stores **UI state**:

- Active tool
- Stroke colour, fill colour (including "no fill")
- Stroke width, opacity, stroke style
- Zoom percentage
- Sidebar and dialog open/closed
- Undo/redo availability

Theme is handled by `next-themes`, not by Zustand.

**Why not Redux Toolkit:** too much boilerplate for this size of app.
**Why not React Context:** every change would re-render the tree, which is expensive next to a canvas that redraws on mouse move.

---

## 3. Folder structure

```
sketch-space/
├── app/
│   ├── layout.tsx                 # fonts, theme provider, metadata
│   ├── page.tsx                   # app shell
│   ├── icon.svg                   # violet S favicon
│   └── globals.css                # Tailwind + theme tokens
├── components/
│   ├── canvas/
│   │   ├── WhiteboardCanvas.tsx   # client-only canvas wrapper
│   │   ├── CanvasStage.tsx        # <canvas> element + Fabric events
│   │   └── useFabricCanvas.ts     # create, resize, dispose the Fabric canvas
│   ├── topbar/
│   │   ├── TopBar.tsx             # hamburger, undo/redo, zoom controls, share
│   │   ├── ZoomControls.tsx       # -, percentage, +, reset
│   │   └── UndoRedoButtons.tsx
│   ├── toolbar/
│   │   ├── Toolbar.tsx            # floating tool bar
│   │   ├── ToolButton.tsx
│   │   ├── ShapesPicker.tsx       # rectangle, ellipse, diamond, line, arrow
│   │   └── StylePanel.tsx         # colours, width, opacity, stroke style
│   ├── sidebar/
│   │   ├── Sidebar.tsx            # slide-in main menu
│   │   └── SidebarItem.tsx
│   ├── dialogs/
│   │   ├── HelpDialog.tsx         # instructions + shortcuts
│   │   ├── ConfirmDialog.tsx      # "Are you sure?" for reset
│   │   └── ExportDialog.tsx       # PNG/SVG, background, scale
│   └── ui/                        # Button, IconButton, Tooltip, ColorSwatch
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useAutosave.ts
├── lib/
│   ├── fabric/
│   │   ├── createCanvas.ts        # Fabric setup and defaults
│   │   ├── tools.ts               # tool switching, drawing mode
│   │   ├── shapes.ts              # shape and arrow factories
│   │   ├── history.ts             # undo/redo snapshots
│   │   ├── serialize.ts           # project file to/from canvas
│   │   └── export.ts              # PNG and SVG export
│   ├── storage.ts                 # localStorage helpers
│   ├── share.ts                   # lz-string encode/decode
│   ├── download.ts                # blob download helper
│   └── constants.ts               # colours, widths, storage keys
├── stores/
│   └── useWhiteboardStore.ts      # Zustand store
├── types/
│   └── whiteboard.ts              # Tool, ProjectFile, StyleSettings
├── docs/
│   ├── plan.md
│   ├── tasks.md
│   ├── testing-report.md
│   └── final-report.md
├── public/
├── README.md
├── LICENSE
└── package.json
```

The aim is small files with one clear job each — the brief asks for "organised components, clear names, small files".

---

## 4. Main parts of the app

```
React UI (Tailwind, lucide icons)
        │ reads/writes UI state
        ▼
  Zustand store  ──────────────┐
  tool, styles, zoom           │
        │                      │
        ▼                      │
  Fabric.js canvas  ◄──────────┘
  (objects live here)
        ├── autosave  → localStorage (debounced)
        ├── save/open → .json project file
        ├── export    → PNG / SVG
        └── share     → compressed URL hash
```

### Brief coverage map

| Brief requirement | Where it is handled |
|---|---|
| Infinite canvas, pan, zoom, zoom % | §4.1 |
| Top bar, hamburger, sidebar | §4.3 |
| Stroke, fill, width, opacity, stroke style | §4.4 |
| Hand, selection, shapes, pen, arrows, text, eraser | §4.2 |
| Undo / redo and shortcuts | §4.9, §4.10 |
| Open, Save, Export, Reset, Help, Theme | §4.3, §4.5–§4.7 |
| Share option | §4.8, §6 |
| Quality bar | §12 |
| Save format and data | §5 |
| Risks | §7 |

### 4.1 Canvas

- Fabric canvas fills the whole window and resizes with the browser.
- **Plain background** — light `#ffffff`, dark `#121212`; no dot grid.
- **Pan** with the Hand tool, Space + drag, or two-finger trackpad scroll.
- **Zoom** with Ctrl + scroll, pinch, and on-screen +/− buttons; zoom is centred on the mouse pointer using `zoomToPoint`.
- Zoom is clamped between **10% and 3000%**.
- Zoom percentage is shown in the top bar.
- The "infinite" feeling comes from moving the Fabric viewport transform (`viewportTransform`) instead of the canvas element — objects can sit anywhere on the plane.
- Selection colour and active tool highlight use the violet accent `#6965db`.

### 4.2 Toolbar and tools

A floating toolbar at the bottom-centre of the screen (Excalidraw style) with:

| Tool | Behaviour |
|---|---|
| Hand | Drag to pan the canvas |
| Selection | Drag-box or Shift + click to select many; move, resize, rotate; Delete removes |
| Shapes | Rectangle, Ellipse, Diamond, Line, Arrow (arrow = line + arrowhead helper) |
| Pencil | Freehand with `PencilBrush` |
| Text | Click to type with multi-line `Textbox`; Enter adds a line; double-click to edit; Patrick Hand 20px |
| Eraser | Object eraser by default; soft eraser mode via a toggle |
| Undo / Redo | On-screen buttons, synced with history stack |

Each button shows a tooltip with its keyboard shortcut. Arrows can bind to shapes at both ends; bound arrows follow shape moves and resizes (Day 5 bonus).

### 4.3 Top bar and sidebar

- **Top bar:** hamburger button, SketchSpace name, undo/redo, zoom controls (`− 100% +`), share button.
- **Layout:** floating toolbar bottom-centre, style panel on the left, sidebar slides in from the left.
- **Hamburger** opens a smooth slide-in sidebar with all six required options:

| Option | What it must do |
|---|---|
| Open File | Load a saved `.json` drawing back into the canvas |
| Save Project | Download the canvas as a file **and** auto-save to `localStorage` so refresh does not lose work |
| Export as Image | Export PNG, JPEG or SVG with background on/off and 1x / 2x / 3x scale |
| Reset Canvas | Clear everything, always with an "Are you sure?" confirmation |
| Help / Guide | Small window with short instructions and the keyboard shortcut list |
| Theme Switcher | Toggle light/dark and remember the choice after refresh |

### 4.4 Style panel

Shown when a drawing tool is active or an object is selected:

- Stroke colour — Excalidraw classic palette (black, red, green, blue, orange, violet) + custom colour input
- Fill colour — same palette, including a transparent / "no fill" option — **solid fills only**
- Stroke width: thin, medium, thick (1 / 2 / 4 px)
- Opacity slider
- Stroke style: solid, dashed, dotted
- Eraser mode toggle: Object / Soft (bonus)
- Default for new shapes: dark stroke, transparent fill, 2px medium width, 100% opacity, solid line
- Dark mode: new shapes default to white stroke; existing shapes keep their colour

Changes apply to the next shape, and to the current selection when objects are selected.

### 4.5 Theme

- `next-themes` with class-based dark mode in Tailwind.
- **Default: light.**
- The choice is saved and applied before paint to avoid a flash (`suppressHydrationWarning` on `<html>`).
- The canvas background follows the theme: light `#ffffff`, dark `#121212`.
- Accent stays violet in both themes.

### 4.6 Save, open and autosave

- **Save Project** downloads a `.json` project file and writes a copy to `localStorage`.
- **Autosave** writes to `localStorage` after changes (debounced ~500 ms), so a refresh restores the drawing.
- **Open File** reads a `.json` file, validates `type` and `version`, then loads it into the canvas.
- Invalid files show a friendly error and are not loaded.

### 4.7 Export

- **PNG** via `canvas.toDataURL({ format: 'png', multiplier })`
- **JPEG** via `canvas.toDataURL({ format: 'jpeg', multiplier, quality: 0.95 })`
- **SVG** via `canvas.toSVG()`
- Options: background on/off, scale 1x / 2x / 3x
- **Defaults: PNG, background ON, 2x**
- Export filenames: `sketchspace-YYYY-MM-DD.png` / `.jpg` / `.svg`
- Background ON uses the current theme's canvas colour (light `#ffffff`, dark `#121212`)
- Export ignores selection handles, the toolbar and all UI — only the drawing is exported.

### 4.8 Share

- The drawing JSON is compressed with **lz-string** and placed in the URL hash: `/#data=...`
- Opening that link decodes the data and rebuilds the canvas.
- Large drawings fall back to sending the `.json` project file, because URLs have length limits.
- No backend and no database — this is the chosen "full-stack-lite" approach.

### 4.9 Undo and redo

Fabric has no built-in history, so we keep a capped stack of JSON snapshots:

- Push after `object:added`, `object:modified`, `object:removed` and `path:created`
- Debounce rapid changes (for example while dragging)
- Skip history while loading a file or a shared link
- Cap at ~50 snapshots to control memory
- Buttons and Ctrl+Z / Ctrl+Y read availability from the store

### 4.10 Keyboard shortcuts and help

`useKeyboardShortcuts` listens on the window, ignores inputs and text editing, and maps keys to tools and actions. The Help dialog lists every shortcut.

| Key | Action | Key | Action |
|---|---|---|---|
| V or 1 | Selection | H | Hand |
| R | Rectangle | O | Ellipse |
| D | Diamond | A | Arrow |
| L | Line | P | Pencil |
| T | Text | E | Eraser |
| Ctrl+Z | Undo | Ctrl+Y / Ctrl+Shift+Z | Redo |
| Delete | Delete selection | Space + drag | Pan |

---

## 5. Data: saving, opening and exporting

### Project file format

```json
{
  "type": "whiteboard",
  "version": 1,
  "source": "sketch-space",
  "savedAt": "2026-11-13T10:00:00.000Z",
  "canvas": {
    "objects": [],
    "background": "#ffffff"
  }
}
```

- The `type` and `version` fields let the app check a file before loading it and stay compatible with future changes.
- `canvas` is the Fabric JSON output, stored as-is.
- Unknown or invalid files show a friendly error and are not loaded.

### Storage keys

| Key | Contents |
|---|---|
| `sketchspace:drawing:v1` | Last autosaved project JSON |
| `theme` | Managed by `next-themes` |

Autosave is debounced (~500 ms). Writes are wrapped in `try/catch` so a full `localStorage` shows a warning instead of breaking the app.

### Loading order

1. If the URL has a `#data=` share payload, load that.
2. Otherwise, load the autosaved drawing from `localStorage`.
3. Otherwise, start with an empty canvas.

---

## 6. Sharing approach

1. Serialize the drawing with the same project format.
2. Compress with `LZString.compressToEncodedURIComponent`.
3. Build `https://<app-url>/#data=<payload>` and copy it to the clipboard.
4. On load, decode, validate, and render.

If the encoded URL is too long (roughly over ~30,000 characters), show a message and offer the `.json` file instead.

A short-link service (Vercel KV) was considered but **not chosen** — it adds backend setup without being required by the brief.

---

## 7. Risks and how we will handle them

| Risk | Impact | Mitigation |
|---|---|---|
| Slow canvas with many shapes | Laggy drawing and panning | Keep objects inside Fabric, not React state; batch renders with `renderOnAddRemove = false` and `requestRenderAll`; debounce autosave; avoid React updates on every mouse move |
| Hard resize/rotate logic | Broken selection handles | Use Fabric's built-in transform controls; no custom transform math |
| Fabric touching `window` during SSR | Build or page crash | `"use client"` + `dynamic(..., { ssr: false })` for the canvas component; clean up on unmount |
| Undo/redo memory growth | Browser slows down | Cap history at ~50 snapshots; debounce pushes |
| `localStorage` quota (~5 MB) | Autosave failures | Save only the JSON snapshot, debounce, catch quota errors and warn the user |
| Share URL too long | Link fails to open | Compress with lz-string; fall back to `.json` download |
| Theme flash on reload | White flash in dark mode | `next-themes` with `suppressHydrationWarning` on `<html>` |
| Saved files breaking after updates | Old files cannot open | `version` field and a validation step before loading |
| Touch gestures behave differently | Broken pinch/pan on phones | Pointer events + Fabric touch support; test on one phone; desktop is the priority |
| Arrow binding gets complex | Arrows detach or behave oddly | Both ends bind when dropped near a shape; follow moves and resizes; clear the binding when an endpoint is moved away; test with multiple shapes |
| Daily plan slips | Incomplete features | Follow the roadmap; core first, bonuses on Day 5; deploy from Day 1 to catch issues early |

---

## 8. One-week roadmap

| Day | Goal |
|---|---|
| **Day 1** | Scaffold Next.js + TypeScript + Tailwind with npm; app shell, top bar, floating toolbar; Fabric canvas with pan, zoom (10%–3000%) and zoom-to-cursor; first Vercel deploy |
| **Day 2** | Tools: hand, selection (multi-select, move, resize, rotate), shapes, pencil, text; object eraser |
| **Day 3** | Style panel (stroke, fill, width, opacity, stroke style); soft eraser toggle; undo/redo; keyboard shortcuts |
| **Day 4** | Save / Open / autosave / reset confirmation; export dialog (PNG + SVG, background, scale) |
| **Day 5** | Share link, theme switcher, Help dialog; bonus features: arrow binding (both ends + resize-follow), pinch zoom, soft eraser polish |
| **Day 6** | Full manual testing on localhost and the live Vercel link; fix bugs; write `testing-report.md` |
| **Day 7** | README, LICENSE, Discussions, docs complete; `final-report.md`; invite Sami; send both links |

Vercel redeploys automatically after each push, so the live link stays current.

---

## 9. Required workflow order

1. **Study** — read the brief, explore excalidraw.com → `notes.md`
2. **Plan** — this file → `docs/plan.md`
3. **Tasks** — small checklist → `docs/tasks.md`
4. **Implement** — build task by task, tick boxes
5. **Test** — test every feature by hand, fix bugs
6. **Test report** — what was tested and the result → `docs/testing-report.md`
7. **GitHub** — push to a private repository
8. **Deploy** — Vercel, then re-test the live link
9. **Access** — invite Muhammad Sami as collaborator
10. **Final report** — summary + both links → `docs/final-report.md`

The plan and task list come **before** the code. Without them, the task counts as incomplete even if the app works.

---

## 10. GitHub and submission checklist

### Repository

- [ ] Private repository named `sketch-space`
- [ ] `README.md` — name, description, screenshots, live demo link, features, tech stack, how to run locally, folder structure
- [ ] `LICENSE` — MIT
- [ ] Discussions enabled + one welcome discussion posted
- [ ] Repo top page complete: description, topics (tags), website link = Vercel URL
- [ ] `docs/plan.md`, `docs/tasks.md`, `docs/testing-report.md`, `docs/final-report.md`
- [ ] Clean, small commits with clear messages (e.g. "add pan and zoom")

### Access

- [ ] Invite `muhammadsami987123` as a collaborator (Settings → Collaborators → Add people)
- [ ] Tell Sami the invite is sent

### Submission

- [ ] Private repo link
- [ ] Live Vercel link
- [ ] All four documents
- [ ] Website source code in the repo
- [ ] README and LICENSE present
- [ ] Discussions enabled

---

## 11. Out of scope

- Real-time multi-user collaboration over WebSockets
- User accounts, cloud storage, database
- Hachure / cross-hatch fills (solid only, by decision)
- Rough.js hand-drawn wobble (clean geometric, by decision)
- Image upload, libraries, frames, laser pointer
- Fully responsive mobile layout (desktop-first; touch pan/zoom/draw is included)
- Short share links via Vercel KV (hash links + JSON fallback instead)

The word "real-time" here means the canvas responds instantly to input — not multi-user sync, which the brief does not require.

---

## 12. Success criteria

- Open the live Vercel link in a fresh browser: draw, style, select, move, resize, rotate, erase, undo, redo
- Pan and zoom smoothly, including zoom centred on the cursor and clamp limits of 10%–3000%
- New shapes use the Excalidraw-like default style
- Dark mode new shapes use white stroke; existing shapes keep their colour
- Exports use `sketchspace-YYYY-MM-DD` filenames and the current theme background
- Save a file, refresh, and get the drawing back from autosave
- Open the saved file and see the same drawing
- Export PNG, JPEG and SVG with and without background at different scales
- Copy a share link, open it in a new tab, and see the same drawing
- Toggle dark mode, refresh, and stay in dark mode
- Reset asks for confirmation first
- Help shows the full shortcut list
- Touch device: pan, pinch zoom and draw work
- No console errors
