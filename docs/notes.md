# Day 01 — Study Notes

**Project:** Real-Time Interactive Whiteboard (Excalidraw-style)
**Assigned to:** Maryam Mumtaz
**Assigned by:** Muhammad Sami
**Deadline:** Today (Day 1)
**Reference:** https://excalidraw.com/

---

## 1. What are we building?

A full-stack, Excalidraw-style whiteboard web app written from scratch:

- Infinite canvas with smooth pan and zoom
- Drawing tools: hand, selection, shapes, pen, arrows, text, eraser
- Styling: stroke colour, fill colour, stroke width, opacity, stroke style
- Save / Open (JSON), Export (PNG / SVG), Share
- Light and dark theme
- Docs: `plan.md`, `tasks.md`, `testing-report.md`, `final-report.md`
- Private GitHub repo + live Vercel link

**"Complete" means:** the app builds and runs without errors, the code is in a private GitHub repo with all required files, the app is live on Vercel, the plan/tasks/testing report are included, and Muhammad Sami has repo access and both links.

---

## 2. Fixed requirements (cannot change)

| Part | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Required |
| Styling | Tailwind CSS | Required; must support light + dark mode |
| Hosting | Vercel | Required |
| Code hosting | GitHub (private) | Required |
| Language | TypeScript | Recommended by the brief |

**Open choices** (we must explain our pick in `plan.md`):

- Canvas drawing approach
- State management

---

## 3. Language decision: TypeScript

We will use **TypeScript**, not plain JavaScript.

**Why:**

- The canvas state is complex (shapes, selection, zoom, undo/redo). Types catch mistakes before runtime.
- Next.js has first-class TypeScript support.
- Fabric.js, Zustand and Next.js all ship their own type definitions.
- Safer refactoring and cleaner components — the brief explicitly asks for "organised components, clear names, small files".
- The brief itself says: *"Use TypeScript if you can."*

---

## 4. Stack decision

| Part | Choice | Why |
|---|---|---|
| Language | TypeScript | Safer canvas state, better autocomplete |
| Framework | Next.js 15 (App Router) | Required by the brief |
| Styling | Tailwind CSS | Required; fast, consistent UI |
| Canvas | Fabric.js v6 | Built-in selection, resize, rotate, JSON save/load, PNG + SVG export |
| State management | Zustand | Small, fast, minimal boilerplate; no re-render storms like Context |
| Icons | lucide-react | Clean icon set, close to Excalidraw's feel |
| Theme | next-themes | Light/dark toggle that survives refresh |
| IDs | nanoid | Short unique IDs for shapes |
| Share compression | lz-string | Keeps share links short |
| Hosting | Vercel | Required |

---

## 5. Why Fabric.js for the canvas?

- **Selection & transforms are built in:** drag-box multi-select, Shift+click, move, resize and rotate handles — the hardest part of the checklist comes for free.
- **Save / Open:** `canvas.toJSON()` and `canvas.loadFromJSON()` give us a project file without writing custom serialization.
- **Export:** native PNG (`toDataURL`) and SVG (`toSVG`) output, with background and scale options.
- **Text:** in-place editing with `IText` (click to type, double-click to edit).
- **Performance:** object model + canvas renderer handles hundreds of shapes smoothly.

### Alternatives considered

| Option | Verdict |
|---|---|
| Konva + react-konva | Great React integration, but SVG export and JSON save/load need custom code |
| Raw HTML Canvas API | Most control and closest to real Excalidraw, but resize/rotate/hit-testing all hand-written — too risky for a one-day deadline |
| Raw Canvas + rough.js | Only worth it if the exact hand-drawn (wobbly) look is required; much more work |
| Fabric.js (chosen) | Fastest path to every required feature with good quality |

---

## 6. Why Zustand for state?

Fabric keeps the drawing objects inside its own canvas model. Zustand only needs to hold **app-level UI state**:

- Current tool (`select`, `hand`, `rect`, `ellipse`, `diamond`, `line`, `arrow`, `pen`, `text`, `eraser`)
- Stroke colour, fill colour (including "no fill")
- Stroke width (thin / medium / thick)
- Opacity
- Stroke style (solid / dashed / dotted)
- Zoom percentage
- Theme (handled by `next-themes`)
- History (undo/redo)

Redux Toolkit would be overkill; React Context re-renders too much for a canvas app.

---

## 7. Feature inventory (from the brief)

### Infinite canvas
- Full-screen drawing area, light or dark
- Free movement up, down, left, right with no limit
- Pan: Hand tool, Space + drag, scroll / trackpad
- Zoom: Ctrl + scroll, pinch, on-screen buttons
- Show current zoom percentage
- Zoom centred on the mouse position
- Smooth and fast with many shapes

### Top bar and main menu
- Clean top bar for core controls
- Hamburger button opens a collapsible sidebar
- Sidebar opens/closes smoothly
- Sidebar contains: Open File, Save Project, Export as Image, Reset Canvas, Help / Guide, Theme Switcher

### Styling palette
- Stroke (outline) colour
- Fill colour, including no fill
- Stroke width: thin, medium, thick
- Opacity (transparency)
- Stroke style: solid, dashed, dotted

### Tools
- Hand tool — drag to pan
- Selection tool — select, move, resize, rotate; drag box or Shift + click for multi-select; Delete key removes
- Shapes picker — Rectangle, Circle (ellipse), Diamond, Line, Arrow
- Freehand pen
- Arrows and connectors (bonus: arrows that stick to shapes)
- Text tool — click to type, double-click to edit
- Eraser (recommended)
- Undo / Redo with Ctrl+Z / Ctrl+Y and on-screen buttons

### Sharing and export
- Download as PNG/JPEG image or a project file that can be reopened
- Share option — a shareable link or an export format others can open (explain the approach in `plan.md`)

### Quality bar
- Clean, professional look, close to Excalidraw in feel
- Works on desktop browsers; touch is a bonus
- No console errors or broken buttons
- Organised components, clear names, small files

---

## 8. Sidebar options

| Option | What it must do |
|---|---|
| Open File | Load a saved `.json` drawing back into the canvas |
| Save Project | Download the canvas as a file **and** auto-save to `localStorage` so refresh does not lose work |
| Export as Image | Export PNG or SVG with options such as background on/off and export scale |
| Reset Canvas | Clear everything, always with an "Are you sure?" confirmation |
| Help / Guide | Small window with short instructions and the keyboard shortcut list |
| Theme Switcher | Toggle light/dark and remember the choice after refresh |

---

## 9. Keyboard shortcuts (show inside Help / Guide)

| Key | Action | Key | Action |
|---|---|---|---|
| V or 1 | Selection tool | H | Hand tool |
| R | Rectangle | O | Circle / ellipse |
| D | Diamond | A | Arrow |
| L | Line | P | Pencil |
| T | Text | E | Eraser |
| Ctrl+Z / Ctrl+Y | Undo / Redo | Delete | Delete selection |

---

## 10. Data, saving and sharing plan

### Project file format

```json
{
  "type": "whiteboard",
  "version": 1,
  "source": "maryam-whiteboard",
  "canvas": { "...": "Fabric.js JSON" }
}
```

A `version` field keeps old files loadable after future changes.

### Save (three layers)

1. **Auto-save** to `localStorage` after each change (debounced), so refresh never loses work.
2. **Download project** as `.json` via `canvas.toJSON()`.
3. **Export image** as PNG or SVG, with background on/off and 1x / 2x / 3x scale.

### Share

- Compress the drawing JSON with **lz-string** and put it in the URL hash: `/#data=...`
- On load, if `#data` exists, decode and restore the canvas.
- Fallback for large drawings (URL too long): download and send the `.json` project file.
- Optional upgrade if time allows: a Next.js API route + Vercel KV store for short share IDs.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Canvas library breaks during server-side rendering | `"use client"` components + `dynamic(..., { ssr: false })` for the canvas |
| Slow canvas with many shapes | Keep drawing state inside Fabric, avoid React state updates per frame; debounce saves; optional viewport culling |
| Hard resize/rotate logic | Use Fabric's built-in transform controls instead of custom math |
| `localStorage` quota (~5 MB) | Store only the JSON snapshot, debounce writes, catch quota errors and warn the user |
| Share link too long | Compress with lz-string, fall back to JSON file download |
| Theme flash on reload | `next-themes` with `suppressHydrationWarning` on `<html>` |
| Broken saved files after updates | Version the project file format |
| Touch support | Use pointer events; Fabric supports touch — treat as bonus, desktop first |

---

## 12. Required documents and order

1. `plan.md` — what we build, tools + why, folder structure, parts, save/share, risks
2. `tasks.md` — small checklist, tick as we go
3. `testing-report.md` — every feature tested by hand, plus the live Vercel link and browsers used
4. `final-report.md` — summary, completed/missing features, tools, problems + fixes, lessons, both links

**Workflow:** Study → Plan → Tasks → Implement → Test → Test report → GitHub → Vercel → Access → Final report.

---

## 13. GitHub and submission checklist

- [ ] Private repository created
- [ ] `README.md` — name, description, screenshots, live demo link, features, stack, how to run, folder structure
- [ ] `LICENSE` (MIT)
- [ ] Discussions enabled + one welcome discussion posted
- [ ] Repo description, topics (tags), website link = Vercel URL
- [ ] `plan.md`, `tasks.md`, `testing-report.md`, `final-report.md` in the repo (e.g. `/docs`)
- [ ] Clean, small commits with clear messages
- [ ] Muhammad Sami (`muhammadsami987123`) invited as collaborator
- [ ] Vercel deployment live and re-tested on the live link
- [ ] Both links + all reports sent to Sami

---

## 14. Planned folder structure (draft)

```
maryam-whiteboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── canvas/
│   │   ├── WhiteboardCanvas.tsx
│   │   └── useFabricCanvas.ts
│   ├── toolbar/
│   │   ├── Toolbar.tsx
│   │   ├── ToolButton.tsx
│   │   └── StylePanel.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   └── MenuItem.tsx
│   ├── dialogs/
│   │   ├── HelpDialog.tsx
│   │   └── ConfirmResetDialog.tsx
│   └── ui/            (buttons, inputs, tooltips)
├── lib/
│   ├── fabric/
│   │   ├── setup.ts
│   │   ├── serialize.ts
│   │   └── export.ts
│   ├── share.ts
│   └── shortcuts.ts
├── stores/
│   └── useWhiteboardStore.ts
├── types/
│   └── whiteboard.ts
├── docs/              (the four reports)
└── public/
```

---

## 15. Next steps

1. Write `plan.md` using these decisions
2. Write `tasks.md` as a small, tickable checklist
3. Scaffold the Next.js + TypeScript + Tailwind project
4. Build the canvas shell: full-screen, pan, zoom, zoom-to-cursor
5. Add tools and the style palette
6. Add sidebar actions: Open, Save, Export, Reset, Help, Theme
7. Add undo/redo, keyboard shortcuts, share
8. Test every feature, write both reports
9. Push to private GitHub, deploy to Vercel, invite Sami, send links
