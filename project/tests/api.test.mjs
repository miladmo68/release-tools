import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";

const memory = () => {
  const items = [];
  return {
    create: async (item) => { items.push(item); return item; },
    findByReference: async (reference) => items.find((item) => item.reference === reference) ?? null,
    list: async () => items,
    updateStatus: async (reference, status) => {
      const item = items.find((entry) => entry.reference === reference);
      if (!item) return null;
      item.status = status;
      return item;
    },
  };
};

test("intake API validates, creates, looks up and advances a ticket", async () => {
  const server = createApp(memory()).listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const invalid = await fetch(`${base}/api/intakes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId: "unknown" }) });
    assert.equal(invalid.status, 400);
    const created = await fetch(`${base}/api/intakes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId: "phone-01", symptoms: ["screen"], customer: { name: "Test Person", email: "test@example.com" }, slotId: "tue-10", notes: "Touch is intermittent" }) });
    assert.equal(created.status, 201);
    const ticket = await created.json();
    assert.match(ticket.reference, /^TD-/);
    const lookup = await fetch(`${base}/api/intakes/${ticket.reference}`);
    assert.equal((await lookup.json()).status, "requested");
    const changed = await fetch(`${base}/api/intakes/${ticket.reference}/status`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "inspecting" }) });
    assert.equal((await changed.json()).status, "inspecting");
    const missing = await fetch(`${base}/api/intakes/TD-MISSING`);
    assert.equal(missing.status, 404);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test("intake API rejects unsupported symptoms and full demo windows", async () => {
  const server = createApp(memory()).listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const send = (body) => fetch(`${base}/api/intakes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const baseInput = { deviceId: "phone-01", symptoms: ["screen"], customer: { name: "Test Person", email: "test@example.com" }, slotId: "tue-14", notes: "" };
    assert.equal((await send({ ...baseInput, deviceId: "laptop-01", symptoms: ["camera"] })).status, 400);
    assert.equal((await send({ ...baseInput, slotId: "wed-11" })).status, 400);
    assert.equal((await send(baseInput)).status, 201);
    assert.equal((await send(baseInput)).status, 400);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
