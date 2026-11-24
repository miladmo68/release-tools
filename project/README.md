![Kestrel Motor Co. on desktop](public/screenshots/desktop.png)

# Kestrel Motor Co.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_the_lot-0e2a2d)](https://miladmo68.github.io/kestrel-motor-co/) [![Next.js](https://img.shields.io/badge/Next.js-16.4.6-0c1415)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-0c1415)](https://www.typescriptlang.org/)

**[Live Demo](https://miladmo68.github.io/kestrel-motor-co/)** · **[GitHub Source](https://github.com/miladmo68/kestrel-motor-co)**

Kestrel Motor Co. is a pre-owned car dealership experience built around one idea: people shop by monthly payment, not sticker price. A budget slider filters the whole lot, every card shows the payment first, and each vehicle opens into a live finance calculator and a test-drive scheduler. The dealership, vehicles and prices are fictional; nothing is submitted anywhere and bookings stay in the current browser session.

![Kestrel Motor Co. on a phone](public/screenshots/mobile.png)

## Features

- Set a monthly budget, term and down payment; the lot, the match count and the featured car update instantly.
- Filter by body style and fuel, search by make, model or colour, and sort by payment, price, mileage or year.
- Open any vehicle for a finance calculator with down payment, trade-in, APR and term, a paid-up-front split bar and total cost.
- Book a test drive with day and time slots, validation, a confirmation reference and a downloadable calendar file.
- Compare up to three cars side by side with the best value in each row highlighted.
- Remembers the budget, terms and compare tray in the browser.
- Skip link, keyboard-operable dialogs and tabs, visible focus, live regions and reduced-motion support.

## Technology

Next.js 16 App Router, React 19, TypeScript, custom CSS, self-hosted Fontsource fonts and Playwright. The static export needs no server, account, database or external API. Finance maths, filtering and booking helpers are covered by unit tests; the browser suite exercises the whole flow at 1440 and 390 pixels.

Vehicle artwork is drawn in code, so there are no third-party photographs. See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) and [DESIGN.md](DESIGN.md).

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Full check:

```sh
npm run validate
npm run qa:browser
```

## Deploy

Pushing to `main` runs the Pages workflow, which installs locked dependencies, validates, builds a static export with the repository base path and deploys it to GitHub Pages.
