# Merefold Wardrobe

A fictional contemporary wardrobe studio centered on one interaction: compose a three-piece outfit and see its contents and total change instantly. The project is in development; a verified live demo and finished screenshots will be added at release.

## Product

- Select a layer, top and bottom from a compact nine-piece collection.
- Search each category by name, material or colour; clear an empty search.
- Inspect material details, reset the composition, save a look in this browser and download its illustrative details.
- Keyboard-accessible controls, responsive layout and reduced-motion support.

All garments, prices and order-related content are illustrative. No stock is held, order is placed or payment collected.

## Architecture

React 19, TypeScript and Vite render the static GitHub Pages demo from bundled JSON; browser storage keeps the current look locally. Express exposes garment list and detail routes. The server has a Mongoose repository for a configured `MONGODB_URI` and a memory adapter for local exploration without MongoDB. The public demo does not connect to a live database.

## Run locally

```bash
npm ci
npm run dev
npm run validate
npm run qa:browser
```

Run `npm start` to start the API on port 3001. The Pages build uses the repository subpath configured in `vite.config.js`.
