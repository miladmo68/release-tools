const test = require("node:test");
const assert = require("node:assert/strict");
const { guests, initialPlan, tables } = require("../.test-dist/seed.js");
const { assignGuest, assignParty, normalizePlan, openSeats, planStats, planRoster, seatRemaining, suggestTable, updateGuest } = require("../.test-dist/seating.js");
const { backupJson, cateringCsv, guestCsv } = require("../.test-dist/export.js");
const { parseBackup } = require("../.test-dist/backup.js");

test("initial arrangement seats only attending guests within capacity", () => {
  const stats = planStats(initialPlan);
  assert.equal(stats.attending, 26);
  assert.equal(stats.seated, 22);
  assert.equal(stats.pending, 3);
  for (const table of tables) assert.ok(openSeats(table, initialPlan.assignments) >= 0);
});

test("a pending guest cannot be seated", () => {
  const result = assignGuest(initialPlan, "g27", "t5");
  assert.equal(result.ok, false);
  assert.match(result.reason, /Only attending/);
});

test("capacity is enforced before changing a guest assignment", () => {
  const result = assignGuest(initialPlan, "g23", "head");
  assert.equal(result.ok, false);
  assert.equal(initialPlan.assignments.g23, null);
});

test("moving a guest preserves the total seated count", () => {
  const result = assignGuest(initialPlan, "g03", "t5");
  assert.equal(result.ok, true);
  assert.equal(result.plan.assignments.g03, "t5");
  assert.equal(planStats(result.plan).seated, 22);
});

test("a party assignment fails atomically when too few seats remain", () => {
  const result = assignParty(initialPlan, "Art school", "t1");
  assert.equal(result.ok, false);
  assert.equal(initialPlan.assignments.g24, null);
});

test("restored plans discard unknown and over-capacity assignments", () => {
  const corrupted = { assignments: Object.fromEntries(guests.map((guest) => [guest.id, "head"])), savedAt: "2026-11-16" };
  const restored = normalizePlan(corrupted);
  assert.equal(Object.values(restored.assignments).filter((id) => id === "head").length, 2);
  assert.equal(restored.assignments.g30, null);
});

test("changing a response clears a seat and updates meal totals", () => {
  const changed = updateGuest(initialPlan, "g03", { rsvp: "declined", meal: "coast" });
  assert.equal(changed.ok, true);
  assert.equal(changed.plan.assignments.g03, null);
  assert.equal(planStats(changed.plan).attending, 25);
  assert.equal(planRoster(changed.plan).find((guest) => guest.id === "g03").meal, "coast");
});

test("a pending response can become attending and receive an open seat", () => {
  const response = updateGuest(initialPlan, "g27", { rsvp: "attending" });
  assert.equal(response.ok, true);
  const seated = assignGuest(response.plan, "g27", "t5");
  assert.equal(seated.ok, true);
  assert.equal(seated.plan.assignments.g27, "t5");
});

test("suggestions keep couples at the head table and friends with their party", () => {
  assert.equal(suggestTable(initialPlan, "g01"), null);
  const suggestion = suggestTable(initialPlan, "g24");
  assert.ok(suggestion && suggestion.id !== "head");
});

test("auto seating never exceeds capacity or changes existing seats", () => {
  const result = seatRemaining(initialPlan);
  assert.equal(result.count, 4);
  assert.equal(result.plan.assignments.g03, initialPlan.assignments.g03);
  assert.equal(planStats(result.plan).unseated, 0);
  for (const table of tables) assert.ok(openSeats(table, result.plan.assignments) >= 0);
});

test("export files include the complete fictional plan and catering tally", () => {
  assert.equal(guestCsv(initialPlan).trim().split("\r\n").length, guests.length + 1);
  assert.match(cateringCsv(initialPlan), /"Garden"/);
  assert.equal(JSON.parse(backupJson(initialPlan)).fictional, true);
});

test("backup parser rejects unrelated files and restores known plans", () => {
  assert.equal(parseBackup("not json").ok, false);
  assert.equal(parseBackup('{"product":"Other"}').ok, false);
  const imported = parseBackup(backupJson(initialPlan));
  assert.equal(imported.ok, true);
  assert.deepEqual(imported.plan.assignments, initialPlan.assignments);
});
