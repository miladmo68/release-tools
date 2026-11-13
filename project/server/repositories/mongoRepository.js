import mongoose from "mongoose";
import { RoomModel } from "../models/Room.js";
import { StayPreviewModel } from "../models/StayPreview.js";

export async function createMongoRepository(uri) {
  if (!uri) throw new Error("A MongoDB URI is required for the Mongo adapter.");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return {
    async listRooms() { return RoomModel.find({}).lean(); },
    async listPreviews() { return StayPreviewModel.find({}).sort({ createdAt: -1 }).lean(); },
    async savePreview(preview) { return (await StayPreviewModel.create(preview)).toObject(); },
    async deletePreview(id) { return Boolean(await StayPreviewModel.findOneAndDelete({ id })); },
  };
}
