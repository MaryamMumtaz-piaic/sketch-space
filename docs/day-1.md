# Day 1 — Setup and canvas shell

**Date:** 13 November 2026
**Status:** Complete

## What shipped

- Private GitHub repo `sketch-space` with README, MIT license, `.gitignore` and `docs/`.
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 scaffold, npm lockfile committed.
- Full-screen Excalidraw-style shell: top bar, floating bottom toolbar, left style panel, slide-in sidebar, help dialog, reset confirmation and toast.
- Fabric.js v6 canvas, client-only (`dynamic(..., { ssr: false })`), responsive with `ResizeObserver` and disposed on unmount.
- Pan: Hand tool, Space + drag, middle-drag, trackpad/scroll wheel.
- Zoom: Ctrl + wheel centred on the pointer, on-screen `− / % / +` controls, 10%–3000% clamp.
- Light and dark themes with `next-themes`, persisted in `localStorage`, no flash on reload.
- Canvas background `#ffffff` / `#121212`; violet `#6965db` accent, selection colour and S favicon.
- Inter for UI, Patrick Hand loaded for the Day 2 text tool.
- Help dialog (`?`), Reset confirmation, theme toggle in the sidebar.

## Verified

- `npm run lint` and `npm run build` pass.
- Chrome: pan/zoom buttons, Ctrl + wheel, 10% / 3000% clamps, cursors, sidebar, dialogs, theme switch and theme persistence.
- 120 temporary shapes panned and zoomed smoothly, then removed (performance check).
- Mobile 390 px: toolbar fits without overflow, no console or page errors.
- Production build served with `next start` and tested with Playwright against real Chrome.
- Live deploy: <https://sketchspace-whiteboard.vercel.app> — title, canvas, zoom, help, dark mode and mobile checked.

## Fixes made during Day 1

- Space-to-pan stopped working after clicking a toolbar button. The `:focus-visible` check was unreliable because browsers enable it as soon as a key is pressed; replaced with an input-modality check (pointer vs. Tab navigation).
- Tooltip no longer stays visible after the sidebar slides away.
- Toolbar gap tightened so all 10 tools fit at 390 px (`scrollWidth === clientWidth`).
- `Segoe UI` fallback removed from the font stack so Inter actually renders.
- Custom stroke colour is not overwritten when the theme changes.
- Disabled the Next.js dev indicator; covered the console error from a stale `.next` cache on dev restart.

## Notes

- The Vercel project is named `maryam-whiteboard` (the folder name); the repo remains `sketch-space`.
- `sketch-space.vercel.app` belongs to an unrelated older app, so it is not used.
- Vercel's GitHub auto-connect failed for the private repo; deploys are done with the CLI.
- Working rules live in [`AGENTS.md`](../AGENTS.md): no deploys until every task is done, commits at end of day.
