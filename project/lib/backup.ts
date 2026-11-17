import { normalizePlan } from "./seating";
import type { SeatingPlan } from "./types";

export type BackupResult = { ok: true; plan: SeatingPlan } | { ok: false; reason: string };

export function parseBackup(text: string): BackupResult {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || !("product" in value) || value.product !== "Ivory Arc" || !("version" in value) || value.version !== 1 || !("plan" in value) || !value.plan || typeof value.plan !== "object" || !("assignments" in value.plan) || !value.plan.assignments || typeof value.plan.assignments !== "object") {
      return { ok: false, reason: "Choose an Ivory Arc version 1 plan backup." };
    }
    return { ok: true, plan: normalizePlan(value.plan) };
  } catch {
    return { ok: false, reason: "That file is not valid JSON. The current plan has not changed." };
  }
}
