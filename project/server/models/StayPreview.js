import mongoose from "mongoose";

const stayPreviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  roomId: { type: String, required: true, index: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  guests: { type: Number, required: true, min: 1, max: 4 },
  extraIds: [String],
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  quote: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: String, required: true },
}, { versionKey: false });

export const StayPreviewModel = mongoose.models.StayPreview || mongoose.model("StayPreview", stayPreviewSchema);
