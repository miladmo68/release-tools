import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../../src/data/catalog.json", import.meta.url), "utf8"));

export const jsonCatalogRepository = {
  listDevices: () => catalog.devices,
  listRepairs: () => catalog.repairs,
  listSlots: () => catalog.serviceSlots,
};
