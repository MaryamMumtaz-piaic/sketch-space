# SketchSpace

A fast, Excalidraw-style infinite whiteboard built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Fabric.js**, **Zustand** and **next-themes**.

SketchSpace is being built over one week. **Day 1 is complete:** the app shell, theme system and infinite canvas with pan and cursor-centred zoom are live. Shape drawing, saving, exports and sharing follow over the next few days.

## Live demo

**[maryam-whiteboard.vercel.app](https://maryam-whiteboard.vercel.app)**

## Day 1 features

- Full-screen, responsive app shell with no page scrollbars
- Top bar with menu, undo/redo placeholders, zoom controls and share
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
- Help dialog with the Day 1 keyboard map
- Inter for the UI and Patrick Hand loaded for the text tool

## Planned features

- Rectangle, diamond, ellipse, line and arrow tools
- Freehand pencil and multi-line text
- Selection, move, resize, rotate and erase
- Undo / redo history
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
| Selection | `V` |
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
- [Project plan](docs/plan.md)
- [Task checklist](docs/tasks.md)
- [Study notes](docs/notes.md)

## Repository

Private GitHub repository: [MaryamMumtaz-piaic/sketch-space](https://github.com/MaryamMumtaz-piaic/sketch-space)

## License

[MIT](LICENSE)
