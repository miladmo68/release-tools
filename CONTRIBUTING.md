# Project conventions

## Workflow
Each project lives on its own `release/<slug>-<yyyy-mm-dd>` branch (started
from `release-base`) inside `project/`, and is published as its own public
repository with a live GitHub Pages demo once it is finished.

## Stack
I alternate between Next.js (App Router, TypeScript) and MERN (React + Vite,
Express, Node, Mongoose). The static Pages demo of a MERN app uses a JSON data
adapter; the README says so.

Reuse the tooling (eslint, tsconfig, Playwright, tests, deploy workflow) from
the latest project of the same stack instead of starting from zero.

## Design
Every project is a different domain with its own layout, main interaction,
data model, color palette and font pairing. Each repo has a short `DESIGN.md`
(domain, users, palette, fonts, layout idea).

Quality bar: responsive at 1440 and 390, every control works, keyboard and
focus states, reduced motion, empty and error states, no horizontal overflow.
Original or licensed images only; no real brands, logos or people.

## Commits
Small, meaningful commits as the work progresses, conventional style
(`feat: add room filters`, `fix: mobile menu focus`).
Author: `Milad M <info@miladweb.com>`.

## Docs
README: desktop screenshot, title, Live Demo and Source links, stack badges,
short description, a note that demo data is fictional, phone screenshot,
Features, Tech, Run locally, Deploy. Extra files: `DESIGN.md`,
`ATTRIBUTIONS.md`. Keep docs about the product itself.

## Publishing
Run the full check locally first:

```bash
npm install --package-lock-only --ignore-scripts
npm ci
npm run validate
npm run qa:browser
GITHUB_PAGES=true npm run build
```

Then add `.release/manifest.json` in its own commit to publish:

```json
{
  "repository": "project-slug",
  "description": "Short description",
  "homepage": "https://miladmo68.github.io/project-slug/"
}
```

Don't change `main`, `scripts/` or `.github/` from a project branch.
