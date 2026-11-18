![Ivory Arc wedding seating studio on desktop](public/screenshots/desktop.png)

# Ivory Arc

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_the_studio-7E3F4A)](https://miladmo68.github.io/ivory-arc-wedding-studio/) [![Next.js](https://img.shields.io/badge/Next.js-16.4.6-302532)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-302532)](https://www.typescriptlang.org/)

**[Live Demo](https://miladmo68.github.io/ivory-arc-wedding-studio/)** · **[GitHub Source](https://github.com/miladmo68/ivory-arc-wedding-studio)**

Ivory Arc is a spatial seating studio for a wedding reception. It pairs an editorial, invitation-inspired experience with a practical guest roster, interactive floor plan, table inspector and portable plan exports. Its seeded celebration and guest records are fictional; changes stay in the current browser and no invitations or bookings are sent.

![Ivory Arc wedding seating studio on a phone](public/screenshots/mobile.png)

## Features

- Search thirty guests by name, party or note; filter by response and social circle.
- Edit RSVP and menu choices, move guests between six tables, remove a seat assignment and keep parties together within each table’s capacity.
- Suggest a compatible open table or automatically place the remaining attending guests, while preserving existing assignments.
- Review live seating, pending responses, open seats and meal totals.
- Export a guest roster and catering tally as CSV, or download and restore a validated JSON backup.
- Save changes in the browser, restore the fictional starting plan with confirmation, and print a room and guest plan.
- Keyboard-operable tabs, visible focus, responsive touch controls, reduced-motion support and status feedback.

## Technology

Next.js 16 App Router, React 19, TypeScript, custom CSS and Playwright. The static export runs on GitHub Pages without a server, account, database, payment provider or external API. Seating rules and backup parsing are tested separately from the interface.

The reception photograph is by Annie Spratt and is bundled for reliable loading; see [image attribution](ATTRIBUTIONS.md). It illustrates a fictional setting, not the named celebration.

## Run locally

Use Node.js 22 or newer. The published repository includes the generated dependency lockfile.

```sh
npm ci
npm run dev
```

For the full check:

```sh
npm run validate
npm run qa:browser
GITHUB_PAGES=true npm run build
```

`qa:browser` exercises the static build at 1440px and 390px and writes real captures to `public/screenshots/`. It requires Playwright Chromium (`npx playwright install chromium`).

## Deploy

The Pages workflow installs exact locked dependencies, validates the app and uploads the static `out/` directory. `GITHUB_PAGES=true` applies the repository base path to the exported routes and assets.

© 2026 Milad Mohammadi. The application source and fictional records were created for this project. The photograph retains its source license.
