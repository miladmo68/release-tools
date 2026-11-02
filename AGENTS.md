# Cloud portfolio release instructions

- Follow `README.md` exactly for release branch structure and manifest fields.
- Use GitHub Git data operations to group related files into meaningful commits.
- Never place credentials, tokens, private keys, or paid API keys in this repo.
- Do not modify `main`, the publisher workflow, or the release script during a
  daily project run.
- Use a new `release/**` branch for every project and never reuse a release slug.
- Make every project different in domain, information architecture, data model,
  primary interaction, visual direction, color system, typography, and layout.
- Alternate the daily stack strictly: Next.js, then MERN, then Next.js, then
  MERN. Determine the next stack from the latest successful tracked release.
- A MERN day must contain genuine React, Express and Node architecture plus a
  MongoDB repository/model adapter. Its free GitHub Pages demo may select a
  deterministic JSON persistence adapter so every interaction works without a
  hosted database. Describe that deployment mode accurately; never imply the
  live static demo is connected to MongoDB when it is not.
- Check the tracker and existing repositories before choosing the day's idea.
- A project is not releasable until every visible control works on desktop and
  mobile and all required validation passes.
- Because the authoring runtime may not reach npm, put executable validation in
  the required `validate` and Playwright `qa:browser` scripts. The factory runs
  them on GitHub Actions before it creates the public repository.
- Pin every dependency to an exact version in `package.json`. Do not author a
  lockfile in the restricted runtime; the factory generates it before `npm ci`.
- Create 4 or 5 genuine authoring commits so the factory's verified screenshot
  commit brings the final public history to the normal 5 or 6 commits.
