const test = require("node:test");
const assert = require("node:assert/strict");
const { guests, initialPlan, tables } = require("../.test-dist/seed.js");
const { assignGuest, assignParty, normalizePlan, openSeats, planStats } = require("../.test-dist/seating.js");

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
