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
4. The final project history must include the real application, tests,
   screenshots, README, and `.github/workflows/deploy.yml`.
5. In a separate final staging commit, create `.factory/release.json`:

```json
{
  "repository": "lowercase-project-slug",
  "description": "Short accurate GitHub description",
  "homepage": "https://miladmo68.github.io/lowercase-project-slug/"
}
```

The staging manifest commit is excluded from the public project history by
`git subtree split`. Only commits that changed `project/` reach the new repo.

## Required project workflow

Every staged app includes its own GitHub Pages workflow at
`project/.github/workflows/deploy.yml`. It must install locked dependencies,
run lint/typecheck/build as applicable, upload the static output, and deploy via
`actions/deploy-pages` without paid services or external secrets.

