# Contributing to SketchSpace

Thanks for taking a look. SketchSpace is a small, finished project, and it is
better with other eyes on it. Issues and pull requests are both welcome.

## Before you start

- **Found a bug?** Open an [issue](https://github.com/MaryamMumtaz-piaic/sketch-space/issues)
  with your browser and version, the steps that reproduce it, what you expected
  and what happened instead. A screenshot helps a lot.
- **Not sure something is a bug?** Open an issue anyway and describe it.
- **Want to change the code?** Fork the repository, work on a branch, and open a
  pull request against `main`. Tell me what you changed and why.
- **Security problem?** Please do not open a public issue first — message me on
  GitHub and give me a chance to fix it.

## The light-version rule

This repository is the light edition of SketchSpace. It runs entirely in the
browser, with no backend. Please keep it that way:

- No new dependency unless it really earns its place — the bundle stays small.
- No server, database, account system or telemetry.
- No feature that breaks local-first behaviour.

## Code style

- TypeScript everywhere, no `any` unless there is no way around it.
- Small components in `components/`, helpers in `lib/`, Fabric.js logic in
  `lib/fabric/`.
- Follow the naming and file layout that is already there.
- Keep the Excalidraw conventions that the app deliberately copies: tool
  shortcuts, the toolbar order and the style panel.
- `npm run lint` and `npm run build` should both pass before you open a pull
  request. There is no automated test suite — the release was verified by hand
  (see [docs/testing-report.md](docs/testing-report.md)) — so describe how you
  checked your change in the pull request.

## Commit messages

Short and in the imperative, grouped by area:

```text
feat: add shape rotation snapping
fix: keep arrow binding after undo
docs: explain share-link limits
```

## Licensing of contributions

By opening a pull request you confirm that the work is yours (or that you have
permission to submit it) and you agree that it may be included in SketchSpace
under the [SketchSpace Light License](LICENSE), including the right for the
author to relicense the project as a whole.

## Forks and credit

You are welcome to fork SketchSpace to learn from it, change it, or self-host
your own version. If you publish that fork, the [license](LICENSE) asks you to:

1. keep the `LICENSE` file and the author credit,
2. say which parts you changed,
3. keep the SketchSpace name and label your copy as a derivative,
4. not present the project, or a rebranded copy of it, as your own original
   work or as a portfolio piece under your own name.

If you do make changes, tell me — a pull request is the nicest way, and it means
your improvement reaches everyone else too.
