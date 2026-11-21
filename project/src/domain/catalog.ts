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

import catalog from "../data/catalog.json";

export const devices = catalog.devices as Device[];
export const repairs = catalog.repairs as Repair[];
export const serviceSlots = catalog.serviceSlots;
