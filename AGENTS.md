# Working rules — SketchSpace

These rules apply to every future session on this repo. Follow them unless
Maryam explicitly asks for an exception.

## 1. No Vercel deploys until the project is finished

- Do **not** run `vercel`, `vercel --prod`, or any deploy command while
  `docs/tasks.md` still has unfinished tasks.
- No preview or "just to check" redeploys either.
- Local checks are still required after each change: `npm run lint`,
  `npm run build`, and a browser test on `npm run dev` or `next start`.
- Deploy once, at the end, when every task is ticked and verified.
- The Day 1 deployment already exists at
  <https://sketchspace-whiteboard.vercel.app>. It is not updated again until the
  final release.

## 2. Commit only at the end of the day

- Let changes build up during the day; do not commit after every small fix.
- At the end of the working day, review `git status`, then commit the day's
  work with a clear message (a few grouped commits are fine if one day covers
  clearly separate features).
- Do not push uncommitted or half-finished work just to sync it.

## 3. Order of operations at the end of a day

1. `npm run lint`
2. `npm run build`
3. Browser smoke test on the production build (`next start`)
4. `git add` + commit + push
5. Only when **all** days are done: deploy to Vercel and test the live link
