import { devices, repairs, type SymptomId } from "./catalog";

export interface EstimateLine { title: string; parts: number; labour: number; minutes: number }
export interface Estimate { lines: EstimateLine[]; subtotal: number; tax: number; total: number; minutes: number; note: string }

export function createEstimate(deviceId: string, selected: SymptomId[]): Estimate {
  const device = devices.find((item) => item.id === deviceId);
  if (!device) throw new Error("Select a supported device.");
  const unique = [...new Set(selected)];
  if (unique.length === 0) throw new Error("Choose at least one issue.");
  const lines = unique.map((id) => {
    const repair = repairs.find((item) => item.id === id && item.eligible.includes(device.kind));
    if (!repair) throw new Error("That repair is unavailable for this device.");
    const factor = device.kind === "laptop" ? 1.45 : device.kind === "tablet" ? 1.2 : 1;
    return { title: repair.title, parts: Math.round(repair.part * factor), labour: repair.labour, minutes: repair.minutes };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.parts + line.labour, 0);
  const tax = Math.round(subtotal * 0.13 * 100) / 100;
  return { lines, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100,
    minutes: lines.reduce((sum, line) => sum + line.minutes, 0),
    note: "Illustrative estimate only. An in-person diagnosis may change parts, labour and timing." };
}
