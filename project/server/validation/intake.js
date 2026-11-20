import { z } from "zod";

export const intakeInput = z.object({
  deviceId: z.enum(["phone-01", "phone-02", "laptop-01", "tablet-01"]),
  symptoms: z.array(z.enum(["screen", "battery", "charging", "camera", "audio", "water"])).min(1).max(6),
  customer: z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(160) }),
  slotId: z.string().regex(/^2026-12-0[1-3]-(09|10|11|14|15)$/),
  notes: z.string().trim().max(500).default(""),
});
