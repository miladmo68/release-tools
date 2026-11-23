![Tandem Device Studio — desktop repair journey](public/screenshots/desktop.png)

# Tandem Device Studio

**[Live Demo](https://miladmo68.github.io/tandem-device-studio/)** · **[Source](https://github.com/miladmo68/tandem-device-studio)**

![React](https://img.shields.io/badge/React-19-142024?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-142024?logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-4-142024?logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-adapter-142024?logo=mongodb&logoColor=white) ![GitHub%20Pages](https://img.shields.io/badge/Live-GitHub%20Pages-d5eb68?logo=github&logoColor=142024)

Tandem is an original repair-planning experience for phones, laptops and tablets. It helps someone identify likely work, compare an itemised estimate, choose a sample visit window and keep a private draft. A repair shop could adapt its Express API and Mongoose model to operational workflows; the public demo stays fast, free and secretless.

**Everything in the demo is fictional:** device categories, prices, parts, visit windows and drafts are illustrative. Saving a plan does not reserve a time, contact a technician, create a customer record on a server, or take payment. The photographs show general repair tools, not Tandem customer work.

![Tandem Device Studio — phone experience](public/screenshots/mobile.png)

## What works

- Choose among four device profiles in three families and select compatible symptoms.
- See a transparent parts, labour and HST breakdown that updates with the chosen device and issues.
- Choose from five illustrative recurring windows, including a disabled full window and capacity tracked for drafts saved in the same browser.
- Validate name and email, write optional notes, and save or remove a private visit preview. Storage errors receive clear feedback.
- Reopen saved drafts, review their estimated totals and download a JSON copy.
- Use the full flow at desktop and phone widths, including keyboard-accessible dialogs and reduced-motion support.
- Exercise an Express API with Zod validation, repository/service boundaries, a Mongoose model and a JSON file adapter.

## Stack and architecture

React 19, TypeScript 5.8 and Vite 6 power the interface. Domain data is bundled from `src/data/catalog.json`; browser-local storage keeps draft plans in the GitHub Pages demo. No backend or MongoDB connection runs on the public Pages site.

The separate Node/Express API lives in `server/`. It validates requests with Zod and selects the Mongoose repository when `MONGODB_URI` is supplied; otherwise it uses a JSON file repository for local development. The Mongoose adapter is implemented as an optional backend integration, but the public static demo deliberately uses the JSON catalog and browser-local drafts. The API does not promise a working commercial booking service.

## Run locally

Requires Node.js 22. After publication, the repository contains the publisher-generated lockfile.

```bash
npm ci
npm run dev
```

Open the Vite URL shown in the terminal. For the independent API, run `npm run start:api` in another terminal. It defaults to the JSON file adapter; setting `MONGODB_URI` selects MongoDB. Never commit a connection string.

```bash
npm run validate
npx playwright install chromium
npm run qa:browser
```

`validate` runs ESLint, TypeScript, API tests and a production build. Browser QA checks desktop and phone journeys and writes actual screenshots to `public/screenshots/`.

## Deploy

The included GitHub Pages workflow installs exact locked dependencies, validates the app and deploys `dist/` from `main`. Vite's base path is `/tandem-device-studio/`. Hosting needs no paid database or API key.

## Photography

Two bundled repair photographs are credited with source URLs and license details in [ATTRIBUTIONS.md](ATTRIBUTIONS.md).
