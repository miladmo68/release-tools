import { intakeInput } from "../validation/intake.js";
import { jsonCatalogRepository } from "../repositories/jsonCatalogRepository.js";

const transitions = {
  requested: ["inspecting"],
  inspecting: ["awaiting-parts", "ready"],
  "awaiting-parts": ["inspecting", "ready"],
  ready: [],
};

export class WorkflowConflictError extends Error {}

export function createIntakeService(repository) {
  return {
    async create(raw) {
      const value = intakeInput.parse(raw);
      const device = jsonCatalogRepository.listDevices().find((item) => item.id === value.deviceId);
      if (value.symptoms.some((id) => !jsonCatalogRepository.listRepairs().some((repair) => repair.id === id && repair.eligible.includes(device.kind)))) {
        throw new RangeError("Choose issues supported for this device.");
      }
      const slot = jsonCatalogRepository.listSlots().find((item) => item.id === value.slotId);
      const used = (await repository.list()).filter((item) => item.slotId === value.slotId).length;
      if (!slot || used >= slot.remaining) {
        throw new RangeError("Choose an available illustrative window.");
      }
      const reference = `TD-${Date.now().toString(36).toUpperCase()}`;
      return repository.create({ ...value, reference, status: "requested", createdAt: new Date().toISOString() });
    },
    async lookup(reference) { return repository.findByReference(reference.trim().toUpperCase()); },
    async list() { return repository.list(); },
    async updateStatus(reference, status) {
      if (!["requested", "inspecting", "awaiting-parts", "ready"].includes(status)) throw new Error("Invalid status");
      const normalized = reference.trim().toUpperCase();
      const existing = await repository.findByReference(normalized);
      if (!existing) return null;
      if (existing.status === status) return existing;
      if (!transitions[existing.status]?.includes(status)) throw new WorkflowConflictError(`Cannot move a ${existing.status} repair to ${status}.`);
      return repository.updateStatus(normalized, status);
    },
  };
}
