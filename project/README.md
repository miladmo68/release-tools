![Sable & Sky desktop experience](public/screenshots/desktop.png)

# Sable & Sky

**[Live Demo](https://miladmo68.github.io/sable-sky-hotel/)** · **[Source](https://github.com/miladmo68/sable-sky-hotel)**

![React](https://img.shields.io/badge/React-19-102439?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-4269D4?logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-4.21-102439?logo=express) ![MongoDB](https://img.shields.io/badge/MongoDB-adapter-4269D4?logo=mongodb&logoColor=white)

A coastal boutique hotel booking experience imagined for guests who want to choose a room carefully. Search a stay, compare six room categories, tailor extras, see a transparent quote and keep a private stay preview. The editorial interface uses original CSS architectural illustrations rather than external imagery.

**Illustrative demo:** The hotel, rooms, availability and rates are fictional. Saving a preview does not reserve a room, contact a hotel or take payment. Any guest details entered remain in that browser unless the user downloads a summary.

## On a phone

![Sable & Sky mobile experience](public/screenshots/mobile.png)

## Features

- Date and guest search with valid date ranges, occupancy rules and unavailable nights.
- Six detailed room types with clear amenities, responsive architectural scenes, and price and size sorting.
- Weekend pricing, a longer-stay discount, optional extras and an itemized illustrative total.
- Validated guest details, browser-local stay previews, persistence, removal and a downloadable text summary.
- Keyboard focus management, visible focus, semantic forms, reduced-motion support, desktop and phone layouts, and useful empty/error states.
- Express API with request validation, status-aware errors, a booking service and swappable JSON and MongoDB repositories.

## Technology and architecture

React 19, Vite 6, TypeScript, Express 4, Node.js, Mongoose 8, Zod, Playwright and GitHub Pages. Shared deterministic stay rules drive the public demo and API. The Express service exposes room search and preview lifecycle endpoints. The Mongoose models and repository support an optional connected MongoDB deployment; the public static GitHub Pages demo uses bundled JSON data and browser localStorage, **not a live MongoDB or Express connection**.

No paid service, API key, account or database is needed for the live demo. All artwork is original; see [Attributions](ATTRIBUTIONS.md).

## Run locally

Node.js 22 or newer:

```bash
npm install
npm run dev
```

Optional Express API (JSON repository by default):

```bash
npm run start:api
```

Set your own `MONGODB_URI` in your environment to use the Mongo repository instead. It seeds the fictional room catalogue in an empty database. Do not commit credentials.

## Check and deploy

```bash
npm run validate
npm run qa:browser
GITHUB_PAGES=true npm run build
```

The browser test exercises desktop and phone journeys, checks overflow and runtime errors, and writes `public/screenshots/desktop.png` and `public/screenshots/mobile.png` from the running production build. The included Pages workflow deploys the `dist` static export from `main`. The public demo works without its optional Express server.
