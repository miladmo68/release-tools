# Cloud portfolio release instructions

- Follow `README.md` exactly for release branch structure and manifest fields.
- Use GitHub Git data operations to group related files into meaningful commits.
- Never place credentials, tokens, private keys, or paid API keys in this repo.
- Do not modify `main`, the publisher workflow, or the release script during a
  daily project run.
- Use a new `release/**` branch for every project and never reuse a release slug.
- Make every project different in domain, information architecture, data model,
  primary interaction, visual direction, color system, typography, and layout.
- Alternate the stack per successfully published project: Next.js, then MERN,
  then Next.js, then MERN. Determine it from the latest successful tracked release.
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
  them on GitHub Actions before it creates the public repository. The browser QA
  must launch system Google Chrome (`channel: 'chrome'`) when
  `PLAYWRIGHT_USE_SYSTEM_CHROME=1`; the factory preflights that runner browser
  and avoids apt mirrors and browser downloads.
- Pin every dependency to an exact version in `package.json`. Do not author a
  lockfile in the restricted runtime; the factory generates it before `npm ci`.
- Work on each project over two consecutive Toronto workdays. The first day
  creates its release branch and advances it with 6-10 genuine development
  commits; the second day resumes the same branch, adds 6-10 more genuine
  commits, validates and publishes once. Do not trigger the manifest on day one.
- The factory's verified lockfile/screenshot commit brings a two-day release to
  13-21 public commits. Every commit must represent a real development milestone;
  never split or invent changes just to hit a number. If substantive work cannot
  support the target, report the actual count and keep quality and truthfulness.
- Publish a new project on alternate days only; retain the 09:00 Toronto daily
  automation to run both work phases. If blocked, resume the current branch on
  the next run rather than creating a duplicate or a compensating release.
