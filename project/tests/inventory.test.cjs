const test = require("node:test");
const assert = require("node:assert/strict");
const { monthlyPayment, totalInterest, DEFAULT_TERMS } = require("../.test-dist/finance.js");
const { applyFilters, VEHICLES } = require("../.test-dist/inventory.js");

test("monthly payment matches amortisation", () => {
  const m = monthlyPayment(23000, { down: 3000, months: 60, apr: 6, tradeIn: 0 });
  assert.ok(Math.abs(m - 386.66) < 0.05, String(m));
});
test("zero interest divides evenly", () => {
  assert.equal(monthlyPayment(12000, { down: 0, months: 48, apr: 0, tradeIn: 0 }), 250);
});
test("down payment and trade-in cover the price", () => {
  assert.equal(monthlyPayment(10000, { down: 6000, months: 36, apr: 5, tradeIn: 4000 }), 0);
  assert.equal(totalInterest(10000, { down: 6000, months: 36, apr: 5, tradeIn: 4000 }), 0);
});
test("budget filter only keeps affordable cars and sorts by payment", () => {
  const f = { budget: 450, body: "all", fuel: "all", query: "", sort: "payment" };
  const res = applyFilters(VEHICLES, f, DEFAULT_TERMS);
  assert.ok(res.length > 0 && res.length < VEHICLES.length);
  res.forEach(v => assert.ok(monthlyPayment(v.price, DEFAULT_TERMS) <= 450));
  for (let i = 1; i < res.length; i++) assert.ok(monthlyPayment(res[i].price, DEFAULT_TERMS) >= monthlyPayment(res[i - 1].price, DEFAULT_TERMS));
});
test("search and fuel filters combine", () => {
  const res = applyFilters(VEHICLES, { budget: 5000, body: "all", fuel: "Electric", query: "aura", sort: "price" }, DEFAULT_TERMS);
  assert.deepEqual(res.map(v => v.model), ["Aura", "Aura"]);
});
