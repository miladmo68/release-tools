import { guests, initialPlan, tables } from "./seed";
import type { Assignments, Guest, Meal, ReceptionTable, RSVP, SeatingPlan } from "./types";

export type SeatingResult = { ok: true; plan: SeatingPlan } | { ok: false; reason: string };

export function planRoster(plan: SeatingPlan, seed: Guest[] = guests): Guest[] {
  return seed.map((guest) => ({ ...guest, ...plan.guestUpdates[guest.id] }));
}

export function updateGuest(plan: SeatingPlan, guestId: string, change: { rsvp?: RSVP; meal?: Meal }, seed: Guest[] = guests): SeatingResult {
  const guest = seed.find((item) => item.id === guestId);
  if (!guest) return { ok: false, reason: "That guest is no longer in this plan." };
  if (change.rsvp && !["attending", "pending", "declined"].includes(change.rsvp)) return { ok: false, reason: "Choose a valid response." };
  if (change.meal && !["garden", "coast", "hearth"].includes(change.meal)) return { ok: false, reason: "Choose a valid menu." };
  const updated = { ...plan.guestUpdates[guestId], ...change };
  return { ok: true, plan: { ...plan, guestUpdates: { ...plan.guestUpdates, [guestId]: updated }, assignments: { ...plan.assignments, [guestId]: updated.rsvp && updated.rsvp !== "attending" ? null : plan.assignments[guestId] }, savedAt: null } };
}

export function tableGuests(tableId: string, assignments: Assignments, roster: Guest[] = guests): Guest[] {
  return roster.filter((guest) => assignments[guest.id] === tableId);
}

export function openSeats(table: ReceptionTable, assignments: Assignments, roster: Guest[] = guests): number {
  return table.capacity - tableGuests(table.id, assignments, roster).length;
}

export function assignGuest(plan: SeatingPlan, guestId: string, tableId: string | null, roster: Guest[] = planRoster(plan), floor: ReceptionTable[] = tables): SeatingResult {
  const guest = roster.find((item) => item.id === guestId);
  if (!guest) return { ok: false, reason: "That guest is no longer in this plan." };
  if (tableId === null) return { ok: true, plan: { ...plan, assignments: { ...plan.assignments, [guestId]: null }, savedAt: null } };
  const table = floor.find((item) => item.id === tableId);
  if (!table) return { ok: false, reason: "Choose a table from the floor plan." };
  if (guest.rsvp !== "attending") return { ok: false, reason: "Only attending guests can be seated." };
  if (plan.assignments[guestId] === tableId) return { ok: true, plan };
  if (openSeats(table, plan.assignments, roster) < 1) return { ok: false, reason: `${table.name} is full. Move someone first or choose another table.` };
  return { ok: true, plan: { ...plan, assignments: { ...plan.assignments, [guestId]: tableId }, savedAt: null } };
}

export function assignParty(plan: SeatingPlan, party: string, tableId: string, roster: Guest[] = planRoster(plan), floor: ReceptionTable[] = tables): SeatingResult {
  const table = floor.find((item) => item.id === tableId);
  if (!table) return { ok: false, reason: "Choose a table from the floor plan." };
  const partyGuests = roster.filter((guest) => guest.party === party && guest.rsvp === "attending" && plan.assignments[guest.id] !== tableId);
  if (!partyGuests.length) return { ok: false, reason: "No attending guests in this party need a seat here." };
  if (openSeats(table, plan.assignments, roster) < partyGuests.length) return { ok: false, reason: `${partyGuests.length} seats are needed, but ${table.name} has ${openSeats(table, plan.assignments, roster)} open.` };
  const assignments = { ...plan.assignments };
  partyGuests.forEach((guest) => { assignments[guest.id] = tableId; });
  return { ok: true, plan: { ...plan, assignments, savedAt: null } };
}

export function planStats(plan: SeatingPlan, roster: Guest[] = planRoster(plan), floor: ReceptionTable[] = tables) {
  const attending = roster.filter((guest) => guest.rsvp === "attending");
  const seated = attending.filter((guest) => floor.some((table) => table.id === plan.assignments[guest.id]));
  const meals = attending.reduce((count, guest) => ({ ...count, [guest.meal]: count[guest.meal] + 1 }), { garden: 0, coast: 0, hearth: 0 });
  return { invited: roster.length, attending: attending.length, pending: roster.filter((guest) => guest.rsvp === "pending").length, seated: seated.length, unseated: attending.length - seated.length, capacity: floor.reduce((sum, table) => sum + table.capacity, 0), meals };
}

export function normalizePlan(value: unknown, roster: Guest[] = guests, floor: ReceptionTable[] = tables): SeatingPlan {
  if (!value || typeof value !== "object" || !("assignments" in value) || !value.assignments || typeof value.assignments !== "object") return structuredClone(initialPlan);
  const source = value.assignments as Record<string, unknown>;
  const updatesSource = "guestUpdates" in value && value.guestUpdates && typeof value.guestUpdates === "object" ? value.guestUpdates as Record<string, unknown> : {};
  const guestUpdates: SeatingPlan["guestUpdates"] = {};
  for (const guest of roster) {
    const item = updatesSource[guest.id];
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    guestUpdates[guest.id] = {
      ...(candidate.rsvp === "attending" || candidate.rsvp === "pending" || candidate.rsvp === "declined" ? { rsvp: candidate.rsvp } : {}),
      ...(candidate.meal === "garden" || candidate.meal === "coast" || candidate.meal === "hearth" ? { meal: candidate.meal } : {})
    };
  }
  const currentRoster = planRoster({ assignments: {}, guestUpdates, savedAt: null }, roster);
  const assignments: Assignments = {};
  const used: Record<string, number> = {};
  for (const guest of currentRoster) {
    const id = source[guest.id];
    const table = floor.find((item) => item.id === id);
    if (!table || guest.rsvp !== "attending" || (used[table.id] ?? 0) >= table.capacity) assignments[guest.id] = null;
    else { assignments[guest.id] = table.id; used[table.id] = (used[table.id] ?? 0) + 1; }
  }
  return { assignments, guestUpdates, savedAt: "savedAt" in value && typeof value.savedAt === "string" ? value.savedAt : null };
}
