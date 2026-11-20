import mongoose from "mongoose";

const intakeSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true },
  symptoms: [{ type: String, required: true }],
  customer: { name: { type: String, required: true }, email: { type: String, required: true } },
  slotId: { type: String, required: true },
  notes: { type: String, default: "" },
  status: { type: String, enum: ["requested", "inspecting", "awaiting-parts", "ready"], default: "requested" },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

export const Intake = mongoose.models.Intake || mongoose.model("Intake", intakeSchema);
