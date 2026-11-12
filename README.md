# release-tools

My release tooling for portfolio projects.

A project is built on a `release/<slug>-<date>` branch inside `project/`.
Adding `.release/manifest.json` runs the publish workflow: it installs locked
dependencies, runs lint, type checks, tests and a production build, runs
Playwright on desktop and phone, captures screenshots, then creates the public
repository and deploys it to GitHub Pages.

See [CONTRIBUTING.md](CONTRIBUTING.md) for project conventions.

The publish token is stored only as an encrypted Actions secret. The workflow
runs only on pushes to `release/**` that add the manifest, and it never
overwrites an existing repository.

— Milad M
