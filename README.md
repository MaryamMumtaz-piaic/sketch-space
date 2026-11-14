# SketchSpace

A fast, Excalidraw-style infinite whiteboard built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Fabric.js**, **Zustand** and **next-themes**.

SketchSpace is being built over one week. **Days 1–3 are complete:** the app shell, theme system, infinite canvas, the full drawing toolset, selection styling, soft erasing and undo/redo are live. Saving, exporting and sharing follow over the next few days.

## Live demo

**[maryam-whiteboard.vercel.app](https://maryam-whiteboard.vercel.app)**

## Features so far

### Canvas and app shell

- Full-screen, responsive app shell with no page scrollbars
- Top bar with menu, working undo/redo, zoom controls and share
- Floating Excalidraw-style toolbar at the bottom centre
- Slide-in sidebar with all six required menu options
- Style panel with the Excalidraw classic stroke and fill palettes
- Fabric.js infinite canvas with a plain white / `#121212` background
- Pan with the Hand tool, **Space + drag**, middle-drag or trackpad scroll
- Zoom with **Ctrl + scroll** centred on the pointer
- Zoom buttons plus a click-to-reset percentage readout
- Zoom clamped between **10% and 3000%**
- Light and dark themes, saved in `localStorage` with no flash on reload
- Violet accent, violet selection colour and a violet S favicon
- Help dialog with the live keyboard map
- Inter for the UI and Patrick Hand for the text tool

### Drawing tools

- Rectangle, ellipse, diamond, line and arrow drawn by dragging with a live preview
- Arrows are a shaft + filled arrowhead group, so they move and resize as one object
- Freehand pencil that follows the stroke colour and width
- Multi-line text with **Patrick Hand 20 px**, 240 px wrapping and double-click editing
- Selection: click, drag-box, Shift + click, move, resize, rotate and **Delete**
- Object eraser that removes whole shapes by clicking or dragging over them
- Every object gets a unique **nanoid**
- New shapes are selected after drawing, and the tool returns to Selection
- Dark mode flips new-shape strokes to white while keeping existing object colours

### Styling, erasing and history

- Style panel with stroke, fill, width, opacity and solid / dashed / dotted controls
- Style changes apply to the **current selection** as well as the next shape
- The panel mirrors the selected object, so reopening a shape shows its real style
- Object eraser (whole shapes) and a **soft eraser** that clips inside shapes
- Undo / redo with a 50-snapshot JSON history, **Ctrl+Z**, **Ctrl+Shift+Z** and **Ctrl+Y**
- Undo/redo buttons disable themselves when there is nothing to undo or redo
- Gestures such as dragging or erasing collapse into a single history step

## Planned features

- Project save / open and browser autosave
- PNG, JPEG and SVG export with background and 1x / 2x / 3x scale
- Share links compressed with lz-string
- Arrow binding to shapes and pinch zoom

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Canvas | Fabric.js v6 |
| Erasing | @erase2d/fabric |
| UI state | Zustand |
| Themes | next-themes |
| Icons | lucide-react |
| IDs | nanoid |
| Share links | lz-string |
| Hosting | Vercel |

## Run locally

Requirements: **Node.js 20+** and **npm**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev      # start the Turbopack dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Selection | `V` or `1` |
| Hand / pan | `H` |
| Rectangle | `R` |
| Diamond | `D` |
| Ellipse | `O` |
| Line | `L` |
| Arrow | `A` |
| Draw | `P` |
| Text | `T` |
| Eraser | `E` |
| Pan while any tool is active | `Space` + drag |
| Zoom to pointer | `Ctrl` + scroll |
| Delete selection | `Delete` / `Backspace` |
| Undo | `Ctrl` + `Z` |
| Redo | `Ctrl` + `Shift` + `Z` or `Ctrl` + `Y` |
| Edit a text label | Double-click |
| Open / close menu | `M` |
| Help | `?` |
| Close dialog / back to selection | `Esc` |

## Project structure

```text
app/                     Next.js App Router, fonts, theme provider, favicon
components/
  canvas/                Fabric canvas wrapper, stage and lifecycle hook
  topbar/                top bar, zoom controls, undo/redo
  toolbar/               floating toolbar, tool buttons, style panel
  sidebar/               slide-in menu and menu items
  dialogs/               help and confirm dialogs
  ui/                    buttons, tooltip, dialog, toast, logo
  whiteboard/            full-screen shell and theme sync
hooks/                   keyboard shortcuts (autosave arrives later)
lib/                     constants, utilities, Fabric helpers
stores/                  Zustand UI store
types/                   shared TypeScript types
docs/                    plan, tasks and reports
```

## Documentation

- [Day 1 summary](docs/day-1.md)
- [Day 2 summary](docs/day-2.md)
- [Day 3 summary](docs/day-3.md)
- [Project plan](docs/plan.md)
- [Task checklist](docs/tasks.md)
- [Study notes](docs/notes.md)

## Repository

Private GitHub repository: [MaryamMumtaz-piaic/sketch-space](https://github.com/MaryamMumtaz-piaic/sketch-space)

## License

[MIT](LICENSE)
