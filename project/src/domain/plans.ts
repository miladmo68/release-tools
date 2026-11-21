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

export function validateVisitPlan(value: Omit<VisitPlan, "reference" | "createdAt" | "status">): string | null {
  const device = devices.find((item) => item.id === value.deviceId);
  if (!device) return "Choose a supported device.";
  if (!value.symptoms.length || value.symptoms.some((id) => !repairs.some((repair) => repair.id === id && repair.eligible.includes(device.kind)))) return "Choose at least one supported issue.";
  if (!serviceSlots.some((slot) => slot.id === value.slotId && slot.remaining > 0)) return "Choose an available visit window.";
  if (value.name.trim().length < 2 || value.name.trim().length > 80) return "Enter a name between 2 and 80 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) || value.email.length > 160) return "Enter a valid email address.";
  if (value.notes.length > 500) return "Keep the notes under 500 characters.";
  return null;
}

export function readPlans(): VisitPlan[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.reference === "string") : [];
  } catch { return []; }
}

export function savePlan(input: Omit<VisitPlan, "reference" | "createdAt" | "status">): VisitPlan {
  const error = validateVisitPlan(input);
  if (error) throw new Error(error);
  const plan: VisitPlan = { ...input, reference: `TD-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), status: "draft" };
  localStorage.setItem(storageKey, JSON.stringify([plan, ...readPlans()].slice(0, 20)));
  return plan;
}

export function removePlan(reference: string) {
  localStorage.setItem(storageKey, JSON.stringify(readPlans().filter((plan) => plan.reference !== reference)));
}
