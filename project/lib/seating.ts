import { guests, initialPlan, tables } from "./seed";
import type { Assignments, Guest, ReceptionTable, SeatingPlan } from "./types";

export type SeatingResult = { ok: true; plan: SeatingPlan } | { ok: false; reason: string };

export function tableGuests(tableId: string, assignments: Assignments, roster: Guest[] = guests): Guest[] {
  return roster.filter((guest) => assignments[guest.id] === tableId);
}

export function openSeats(table: ReceptionTable, assignments: Assignments, roster: Guest[] = guests): number {
  return table.capacity - tableGuests(table.id, assignments, roster).length;
}

export function assignGuest(plan: SeatingPlan, guestId: string, tableId: string | null, roster: Guest[] = guests, floor: ReceptionTable[] = tables): SeatingResult {
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

export function assignParty(plan: SeatingPlan, party: string, tableId: string, roster: Guest[] = guests, floor: ReceptionTable[] = tables): SeatingResult {
  const table = floor.find((item) => item.id === tableId);
  if (!table) return { ok: false, reason: "Choose a table from the floor plan." };
  const partyGuests = roster.filter((guest) => guest.party === party && guest.rsvp === "attending" && plan.assignments[guest.id] !== tableId);
  if (!partyGuests.length) return { ok: false, reason: "No attending guests in this party need a seat here." };
  if (openSeats(table, plan.assignments, roster) < partyGuests.length) return { ok: false, reason: `${partyGuests.length} seats are needed, but ${table.name} has ${openSeats(table, plan.assignments, roster)} open.` };
  const assignments = { ...plan.assignments };
  partyGuests.forEach((guest) => { assignments[guest.id] = tableId; });
  return { ok: true, plan: { assignments, savedAt: null } };
}

export function planStats(plan: SeatingPlan, roster: Guest[] = guests, floor: ReceptionTable[] = tables) {
  const attending = roster.filter((guest) => guest.rsvp === "attending");
  const seated = attending.filter((guest) => floor.some((table) => table.id === plan.assignments[guest.id]));
  const meals = attending.reduce((count, guest) => ({ ...count, [guest.meal]: count[guest.meal] + 1 }), { garden: 0, coast: 0, hearth: 0 });
  return { invited: roster.length, attending: attending.length, pending: roster.filter((guest) => guest.rsvp === "pending").length, seated: seated.length, unseated: attending.length - seated.length, capacity: floor.reduce((sum, table) => sum + table.capacity, 0), meals };
}

export function normalizePlan(value: unknown, roster: Guest[] = guests, floor: ReceptionTable[] = tables): SeatingPlan {
  if (!value || typeof value !== "object" || !("assignments" in value) || !value.assignments || typeof value.assignments !== "object") return structuredClone(initialPlan);
  const source = value.assignments as Record<string, unknown>;
  const assignments: Assignments = {};
  const used: Record<string, number> = {};
  for (const guest of roster) {
    const id = source[guest.id];
    const table = floor.find((item) => item.id === id);
    if (!table || guest.rsvp !== "attending" || (used[table.id] ?? 0) >= table.capacity) assignments[guest.id] = null;
    else { assignments[guest.id] = table.id; used[table.id] = (used[table.id] ?? 0) + 1; }
  }
  return { assignments, savedAt: "savedAt" in value && typeof value.savedAt === "string" ? value.savedAt : null };
}
