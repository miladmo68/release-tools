import { readFileSync } from "node:fs";

const rooms = JSON.parse(readFileSync(new URL("../../src/data/rooms.json", import.meta.url), "utf8"));
const previews = new Map();

export function createJsonRepository() {
  return {
    async listRooms() { return structuredClone(rooms); },
    async listPreviews() { return [...previews.values()].map(item => structuredClone(item)); },
    async savePreview(preview) { previews.set(preview.id, structuredClone(preview)); return structuredClone(preview); },
    async deletePreview(id) { return previews.delete(id); },
  };
}
