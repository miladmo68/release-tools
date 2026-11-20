import fs from "node:fs/promises";
import path from "node:path";

export function createJsonIntakeRepository(filePath = path.join(process.cwd(), "server/data/intakes.json")) {
  const read = async () => JSON.parse(await fs.readFile(filePath, "utf8"));
  const write = async (items) => fs.writeFile(filePath, JSON.stringify(items, null, 2));
  return {
    async create(record) { const items = await read(); items.unshift(record); await write(items); return record; },
    async findByReference(reference) { return (await read()).find((item) => item.reference === reference) ?? null; },
    async list() { return read(); },
    async updateStatus(reference, status) {
      const items = await read(); const item = items.find((entry) => entry.reference === reference);
      if (!item) return null; item.status = status; await write(items); return item;
    },
  };
}
