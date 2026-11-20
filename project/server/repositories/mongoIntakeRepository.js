import { Intake } from "../models/Intake.js";

export const mongoIntakeRepository = {
  async create(record) { const entry = await Intake.create(record); return entry.toObject(); },
  async findByReference(reference) { return Intake.findOne({ reference }).lean(); },
  async list() { return Intake.find().sort({ createdAt: -1 }).limit(50).lean(); },
  async updateStatus(reference, status) { return Intake.findOneAndUpdate({ reference }, { status }, { new: true }).lean(); },
};
