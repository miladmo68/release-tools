import test from "node:test";
import assert from "node:assert/strict";
import { availableRooms, dateNumber, isRoomAvailable, nightsBetween, quoteStay, stayDates, validateSearch } from "../shared/stay.js";

const room = { nightlyRate: 200, maxGuests: 2, inventory: 2, unavailable: ["2026-11-21"] };
const search = { checkIn: "2026-11-19", checkOut: "2026-11-21", guests: 2 };

test("strict ISO dates and UTC night spans", () => {
  assert.ok(Number.isNaN(dateNumber("2026-02-30")));
  assert.equal(nightsBetween("2026-11-19", "2026-11-21"), 2);
  assert.deepEqual(stayDates("2026-11-19", "2026-11-21"), ["2026-11-19", "2026-11-20"]);
});

test("search rejects past, inverted, long, and oversized stays", () => {
  assert.match(validateSearch({ ...search, checkIn: "2026-11-12" }, "2026-11-13"), /today/);
  assert.match(validateSearch({ ...search, checkOut: "2026-11-19" }, "2026-11-13"), /after/);
  assert.match(validateSearch({ ...search, checkOut: "2026-12-20" }, "2026-11-13"), /28/);
  assert.match(validateSearch({ ...search, guests: 5 }, "2026-11-13"), /four/);
  assert.equal(validateSearch(search, "2026-11-13"), null);
});

test("arrival on sold-out day is unavailable; checkout on that day remains valid", () => {
  assert.equal(isRoomAvailable(room, search), true);
  assert.equal(isRoomAvailable(room, { ...search, checkOut: "2026-11-22" }), false);
  assert.equal(availableRooms([room], { ...search, guests: 3 }).length, 0);
});

test("quote handles weekend rate, long-stay discount, extras, and tax", () => {
  const quote = quoteStay(room, [{ id: "breakfast", price: 28, unit: "night" }], { ...search, extraIds: ["breakfast"] });
  assert.deepEqual(quote.nightlyRates, [200, 224]);
  assert.equal(quote.roomSubtotal, 424);
  assert.equal(quote.extrasSubtotal, 112);
  assert.equal(quote.taxes, 70);
  assert.equal(quote.total, 606);
  const long = quoteStay(room, [], { ...search, checkOut: "2026-11-25", extraIds: [] });
  assert.equal(long.nights, 6);
  assert.ok(long.roomSubtotal < long.nightlyRates.reduce((a, b) => a + b, 0));
});
