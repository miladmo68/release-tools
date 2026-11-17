import { guests, tables } from "./seed";
import { planRoster } from "./seating";
import type { SeatingPlan } from "./types";

function cell(value: string | number): string {
  const safe = String(value).replace(/^[=+\-@]/, "'$&");
  return `"${safe.replaceAll('"', '""')}"`;
}

function csv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

export function guestCsv(plan: SeatingPlan): string {
  const roster = planRoster(plan);
  return csv([
    ["Guest", "Party", "Circle", "Response", "Menu", "Table", "Note"],
    ...roster.map((guest) => [guest.name, guest.party, guest.side, guest.rsvp, guest.meal, tables.find((table) => table.id === plan.assignments[guest.id])?.name ?? "Unseated", guest.note])
  ]);
}

export function cateringCsv(plan: SeatingPlan): string {
  const roster = planRoster(plan).filter((guest) => guest.rsvp === "attending");
  return csv([
    ["Table", "Guests", "Garden", "Coast", "Hearth", "Open seats"],
    ...tables.map((table) => {
      const atTable = roster.filter((guest) => plan.assignments[guest.id] === table.id);
      return [table.name, atTable.length, atTable.filter((guest) => guest.meal === "garden").length, atTable.filter((guest) => guest.meal === "coast").length, atTable.filter((guest) => guest.meal === "hearth").length, table.capacity - atTable.length];
    })
  ]);
}

export function backupJson(plan: SeatingPlan): string {
  return JSON.stringify({ product: "Ivory Arc", version: 1, fictional: true, guestCount: guests.length, plan }, null, 2);
}
