import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";
import { createJsonRepository } from "../server/repositories/jsonRepository.js";

test("API validates searches and persists preview lifecycle through the JSON adapter", async () => {
  const server = createApp(createJsonRepository()).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const all = await fetch(`${base}/api/rooms`);
    assert.equal(all.status, 200);
    assert.equal((await all.json()).length, 6);

    const bad = await fetch(`${base}/api/rooms?checkIn=2027-01-12&checkOut=2027-01-11&guests=2`);
    assert.equal(bad.status, 400);
    assert.match((await bad.json()).error, /after arrival/);
    const incomplete = await fetch(`${base}/api/rooms?checkIn=2027-01-12`);
    assert.equal(incomplete.status, 400);
    const malformed = await fetch(`${base}/api/previews`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 400);

    const body = { roomId: "harbour-room", checkIn: "2027-01-12", checkOut: "2027-01-14", guests: 2, extraIds: ["breakfast"], guestName: "Morgan Lee", guestEmail: "MORGAN@example.com" };
    const created = await fetch(`${base}/api/previews`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(created.status, 201);
    const preview = await created.json();
    assert.equal(preview.guestEmail, "morgan@example.com");
    assert.ok(preview.quote.total > preview.quote.roomSubtotal);

    const list = await fetch(`${base}/api/previews`);
    assert.ok((await list.json()).some(item => item.id === preview.id));
    const removed = await fetch(`${base}/api/previews/${preview.id}`, { method: "DELETE" });
    assert.equal(removed.status, 204);
    const missing = await fetch(`${base}/api/previews/${preview.id}`, { method: "DELETE" });
    assert.equal(missing.status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test("API rejects unknown extras and reports unavailable inventory", async () => {
  const server = createApp(createJsonRepository()).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const input = { roomId: "harbour-room", checkIn: "2026-11-21", checkOut: "2026-11-22", guests: 2, extraIds: [], guestName: "Morgan Lee", guestEmail: "morgan@example.com" };
    const request = data => fetch(`${base}/api/previews`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const unknown = await request({ ...input, checkIn: "2027-01-12", checkOut: "2027-01-14", extraIds: ["unknown"] });
    assert.equal(unknown.status, 400);
    const missingRoom = await request({ ...input, roomId: "missing", checkIn: "2027-01-12", checkOut: "2027-01-14" });
    assert.equal(missingRoom.status, 404);
    const unavailable = await request(input);
    assert.equal(unavailable.status, 409);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
