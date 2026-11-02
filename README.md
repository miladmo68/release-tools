# Portfolio Cloud Factory

Private release infrastructure for Milad's daily cloud portfolio workflow.

This repository exists so the connected cloud task can build a project through
the GitHub connector without needing Milad's Mac. The final staging commit
triggers GitHub Actions, which creates a new public repository and lets the
project's own deployment workflow publish it to GitHub Pages.

## Security

- `PORTFOLIO_BOT_TOKEN` is stored only as an encrypted GitHub Actions secret.
- The publishing workflow runs only on pushes to `release/**` branches that add
  `.factory/release.json`.
- The token is never written to the repository, logs, artifacts, or reports.
- The publisher refuses to overwrite an existing repository.
- A basic secret scan runs before publication.
- The factory repository is private.

## Release branch contract

1. Start a new branch from `release-base` named `release/<project-slug>-<date>`.
2. Build the project only inside `project/`.
3. Create 2–7 meaningful project commits, normally 5 or 6. Batch related files
   into each commit with Git data operations; do not create one commit per file.
4. The staged project must include the real application, tests, README,
   `package-lock.json`, and `.github/workflows/deploy.yml`.
5. `package.json` must expose `validate` and `qa:browser` scripts. `validate`
   runs all applicable lint, typecheck, tests and production build checks.
   `qa:browser` uses Playwright Chromium against the production build, tests
   every visible interaction at representative desktop and phone viewports,
   and writes `public/screenshots/desktop.png` and
   `public/screenshots/mobile.png`.
6. README starts with `public/screenshots/desktop.png` and also presents the
   mobile screenshot. The publisher generates both images before publication
   and adds one final truthful screenshot commit to the public history.
7. In a separate final staging commit, create `.factory/release.json`:

```json
{
  "repository": "lowercase-project-slug",
  "description": "Short accurate GitHub description",
  "homepage": "https://miladmo68.github.io/lowercase-project-slug/"
}
```

The staging manifest commit is excluded from the public project history by
`git subtree split`. GitHub Actions installs locked dependencies, runs the full
validation suite, installs Chromium, performs browser QA, captures desktop and
mobile screenshots, and only then creates the public repository. A failed test
leaves the staged branch intact and publishes nothing.

## Required project workflow

Every staged app includes its own GitHub Pages workflow at
`project/.github/workflows/deploy.yml`. It must install locked dependencies,
run lint/typecheck/build as applicable, upload the static output, and deploy via
`actions/deploy-pages` without paid services or external secrets.

