# Day 5 — Share, theme, help and bonuses

**Date:** 15 November 2026
**Status:** Complete

## What shipped

- **Share links.** `lib/share.ts` compresses the project with
  `LZString.compressToEncodedURIComponent` and builds
  `https://…/#data=<payload>`. Nothing is uploaded: the whole drawing travels
  inside the URL. `ShareDialog` opens from the top bar and from the sidebar
  menu, shows the link, a live character count and a **Copy link** button that
  confirms with "Share link copied to your clipboard."
- **Share validation.** `decodeSharePayload()` decompresses, then runs the same
  `parseProjectFile()` validation used by Open File. An empty, damaged or
  wrong-format payload throws a `ShareError` with a message that is safe to show
  in a toast, and the app falls back to the browser autosave instead of showing
  a broken board.
- **Oversize fallback.** Links above `MAX_SHARE_URL_LENGTH` (30,000 characters)
  are refused before they are copied. The dialog explains the size, offers a
  `sketchspace-YYYY-MM-DD.json` download and points to **Open File** on the
  other side.
- **Startup order.** A share payload wins over the autosave. Once it loads, the
  `#data=` hash is removed with `history.replaceState`, so a refresh behaves
  like a normal session and the shared drawing autosaves locally.
- **Theme stroking.** New shapes follow the theme: `#1e1e1e` in light mode and
  pure `#ffffff` in dark mode. `applyThemeStroke()` only rewrites the panel
  stroke while `strokeAuto` is on, and every `themeRevision` bump tells the
  drawing hook to skip re-styling the current selection, so **existing shapes
  always keep their own colour**. Picking a custom stroke turns `strokeAuto`
  off; re-selecting a shape whose stroke matches either default turns it back
  on.
- **Arrow binding.** Arrows are Fabric `Group`s that store `arrow`, `bindStart`,
  `bindEnd` and the last endpoint coordinates as custom properties, so bindings
  survive save / reload. `lib/fabric/arrows.ts` snaps an endpoint to the nearest
  shape edge (rect box, ellipse curve, diamond edges) within a constant
  on-screen tolerance at any zoom. Bound arrows are rebuilt on
  `object:moving`, `object:scaling` and `object:rotating`, with history paused
  during the swap; dragging or resizing the arrow itself detaches both ends, and
  deleting a shape detaches its arrows without deleting them.
- **Pinch zoom.** Two-finger zoom runs on native `touchstart` / `touchmove` /
  `touchend` handlers on the upper canvas, zooming around the finger midpoint
  and clamped to 10%–3000%. A second finger cancels an in-progress shape
  preview, so a pinch never leaves a stray rectangle behind.
- **Soft eraser polish.** `eraserWidth` (12 / 24 / 40 scene pixels) lives in the
  style settings and the style panel adds a brush-size picker. The brush uses
  `decimate = 2`, the ring cursor is drawn at the exact on-screen size, and the
  native cursor is hidden while the ring is visible.
- **Empty-canvas hint.** "Pick a tool and start drawing" plus the pan/zoom
  reminder renders over an empty board and comes back after Reset.
- **Help.** The guide now covers arrow binding, the soft eraser, share links and
  pinch zoom, and the "Good to know" list replaces the old Day 4 preview note.
- **Metadata.** `metadataBase`, canonical URL, icon (violet S), apple icon,
  manifest, Open Graph and Twitter cards, robots, apple web app settings and
  light / dark `theme-color` entries. `app/manifest.ts` and `app/apple-icon.svg`
  were added.
- **Version.** `0.5.0`; the sidebar footer reads "Day 5 preview".

## Verified

- `npm run lint`, `npx tsc --noEmit` and `npm run build` pass.
- Playwright against real Chrome, no console or page errors:
  - **Share round trip:** a board with two rectangles and a bound arrow builds
    a 2,343-character link, copies it, and a new tab loads the same three
    objects with the hash removed.
  - **Invalid share:** `#data=this-is-not-a-real-payload` shows a friendly toast
    and restores the autosave instead of an empty or broken canvas.
  - **Oversize share:** a 301-object board hides the link, shows the 30,000
    character warning and downloads a 301-object
    `sketchspace-2026-11-15.json`.
  - **Arrow binding:** an arrow drawn between two rectangles binds at both ends,
    follows a move and a resize, keeps its bindings through Save Project plus a
    reload, and unbinds when the arrow itself is dragged.
  - **Theme:** light shapes are `#1e1e1e`, dark shapes are `#ffffff`, and a shape
    that stays selected through the toggle keeps `#1e1e1e` while the panel
    switches to the white swatch. Canvas background flips between `#ffffff` and
    `#121212`.
  - **Soft eraser:** brush width 40 with `decimate` 2 and a 40 × 40 ring cursor;
    erasing inside a filled rectangle creates a clip path and keeps the object.
  - **Pinch zoom:** 100% → 350% with the zoom label in sync, and a rectangle
    preview that is cancelled by the pinch leaves zero objects.
  - **Empty hint:** visible on a fresh board and visible again after Reset.
  - **Layouts:** 1280 × 800, 1440 × 900 and 1920 × 1080 all render without
    horizontal or vertical overflow.
  - **Metadata:** title "SketchSpace — Infinite Whiteboard", description, icon,
    apple icon, manifest, light/dark theme colours and the Open Graph title are
    all present.

## Fixes made during Day 5

- Fabric processes `touchstart` before our own listener, so the first two-finger
  touch could start a shape preview after the pinch had already cancelled one.
  `mouse:down` now ignores multi-touch events and `endPinch()` clears any preview
  that slipped through.
- Toggling the theme used to restyle the selected shape. The `themeRevision`
  token makes the selection effect skip theme-driven style writes.
- `DEFAULT_STROKE_DARK` is pure `#ffffff` (it was `#e8e8ec`), and the white
  swatch check-mark colour follows the new value.
- `hydrateStyle` keeps `strokeAuto` on whenever the re-selected stroke matches
  either theme default, so selecting a black shape in light mode does not stop
  the panel from switching to white in dark mode.

## Notes

- Share payloads are client-side only. There is still no server, so a link is a
  snapshot: the recipient gets an editable copy, not a live document.
- Browsers and chat apps truncate long URLs, which is why anything above 30,000
  characters becomes a `.json` download.
- No Vercel deploy was made — the live link still serves the Day 1 build until
  the final release (see [`AGENTS.md`](../AGENTS.md)).
