import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  eyebrow: String,
  description: String,
  longDescription: String,
  sizeSqm: { type: Number, min: 1 },
  beds: String,
  maxGuests: { type: Number, min: 1, max: 4 },
  nightlyRate: { type: Number, min: 0 },
  inventory: { type: Number, min: 0 },
  features: [String],
  accent: String,
  illustration: String,
  unavailable: [String],
}, { timestamps: true });

export const RoomModel = mongoose.models.Room || mongoose.model("Room", roomSchema);
