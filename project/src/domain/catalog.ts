export type DeviceKind = "phone" | "laptop" | "tablet";
export type SymptomId = "screen" | "battery" | "charging" | "camera" | "audio" | "water";

export interface Device {
  id: string;
  name: string;
  kind: DeviceKind;
  generation: string;
  description: string;
  accent: string;
}

export interface Repair {
  id: SymptomId;
  title: string;
  detail: string;
  part: number;
  labour: number;
  minutes: number;
  eligible: DeviceKind[];
}

export const devices: Device[] = [
  { id: "phone-01", name: "Everyday phone", kind: "phone", generation: "Recent model", description: "Pocket devices with glass, camera and charging repairs.", accent: "#b9c7b9" },
  { id: "phone-02", name: "Compact phone", kind: "phone", generation: "Earlier model", description: "Smaller devices with common battery and display wear.", accent: "#d7b6a5" },
  { id: "laptop-01", name: "Work laptop", kind: "laptop", generation: "13–15 inch", description: "Portable computers with display, power and audio issues.", accent: "#a8b8c6" },
  { id: "tablet-01", name: "Family tablet", kind: "tablet", generation: "10–12 inch", description: "Large-screen devices with touch and charging repairs.", accent: "#cec2a4" },
];

export const repairs: Repair[] = [
  { id: "screen", title: "Cracked display", detail: "Glass, touch or image damage", part: 119, labour: 48, minutes: 90, eligible: ["phone", "laptop", "tablet"] },
  { id: "battery", title: "Short battery life", detail: "Swollen or worn battery", part: 54, labour: 42, minutes: 60, eligible: ["phone", "laptop", "tablet"] },
  { id: "charging", title: "Charging trouble", detail: "Port or power connection", part: 29, labour: 52, minutes: 75, eligible: ["phone", "laptop", "tablet"] },
  { id: "camera", title: "Camera fault", detail: "Blurred, blank or damaged lens", part: 69, labour: 45, minutes: 65, eligible: ["phone", "tablet"] },
  { id: "audio", title: "Sound issue", detail: "Speaker or microphone", part: 33, labour: 44, minutes: 55, eligible: ["phone", "laptop", "tablet"] },
  { id: "water", title: "Liquid exposure", detail: "Inspection and careful cleaning", part: 0, labour: 85, minutes: 120, eligible: ["phone", "laptop", "tablet"] },
];

export const serviceSlots = [
  { id: "2026-12-01-10", date: "Tue 01 Dec", time: "10:00 AM", remaining: 2 },
  { id: "2026-12-01-14", date: "Tue 01 Dec", time: "2:00 PM", remaining: 1 },
  { id: "2026-12-02-11", date: "Wed 02 Dec", time: "11:00 AM", remaining: 0 },
  { id: "2026-12-02-15", date: "Wed 02 Dec", time: "3:00 PM", remaining: 3 },
  { id: "2026-12-03-09", date: "Thu 03 Dec", time: "9:30 AM", remaining: 2 },
];
