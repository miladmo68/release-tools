import { devices, repairs, serviceSlots, type SymptomId } from "./catalog";

export interface VisitPlan {
  reference: string;
  deviceId: string;
  symptoms: SymptomId[];
  slotId: string;
  name: string;
  email: string;
  notes: string;
  createdAt: string;
  status: "draft";
}

const storageKey = "tandem.visit-plans.v1";
export const plansChangedEvent = "tandem:plans-changed";

export function validateVisitPlan(value: Omit<VisitPlan, "reference" | "createdAt" | "status">): string | null {
  const device = devices.find((item) => item.id === value.deviceId);
  if (!device) return "Choose a supported device.";
  if (!value.symptoms.length || value.symptoms.some((id) => !repairs.some((repair) => repair.id === id && repair.eligible.includes(device.kind)))) return "Choose at least one supported issue.";
  if (remainingInBrowser(value.slotId) < 1) return "That illustrative window is full in this browser. Choose another.";
  if (value.name.trim().length < 2 || value.name.trim().length > 80) return "Enter a name between 2 and 80 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) || value.email.length > 160) return "Enter a valid email address.";
  if (value.notes.length > 500) return "Keep the notes under 500 characters.";
  return null;
}

export function readPlans(): VisitPlan[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.reference === "string" && devices.some((device) => device.id === item.deviceId) && Array.isArray(item.symptoms) && item.symptoms.length > 0 && item.symptoms.every((id: SymptomId) => repairs.some((repair) => repair.id === id)) && serviceSlots.some((slot) => slot.id === item.slotId) && typeof item.name === "string" && typeof item.email === "string") : [];
  } catch { return []; }
}

export function remainingInBrowser(slotId: string): number {
  const slot = serviceSlots.find((item) => item.id === slotId);
  return Math.max(0, (slot?.remaining ?? 0) - readPlans().filter((item) => item.slotId === slotId).length);
}

export function savePlan(input: Omit<VisitPlan, "reference" | "createdAt" | "status">): VisitPlan {
  const error = validateVisitPlan(input);
  if (error) throw new Error(error);
  const plan: VisitPlan = { ...input, reference: `TD-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), status: "draft" };
  try { localStorage.setItem(storageKey, JSON.stringify([plan, ...readPlans()].slice(0, 20))); }
  catch { throw new Error("This browser could not save the plan. Check that local storage is enabled."); }
  window.dispatchEvent(new Event(plansChangedEvent));
  return plan;
}

export function removePlan(reference: string) {
  try { localStorage.setItem(storageKey, JSON.stringify(readPlans().filter((plan) => plan.reference !== reference))); }
  catch { throw new Error("This browser could not remove the plan. Try again after checking local storage."); }
  window.dispatchEvent(new Event(plansChangedEvent));
}
