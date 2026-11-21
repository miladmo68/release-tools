import { intakeInput } from "../validation/intake.js";
import { jsonCatalogRepository } from "../repositories/jsonCatalogRepository.js";

export function createIntakeService(repository) {
  return {
    async create(raw) {
      const value = intakeInput.parse(raw);
      const device = jsonCatalogRepository.listDevices().find((item) => item.id === value.deviceId);
      if (value.symptoms.some((id) => !jsonCatalogRepository.listRepairs().some((repair) => repair.id === id && repair.eligible.includes(device.kind)))) {
        throw new RangeError("Choose issues supported for this device.");
      }
      if (!jsonCatalogRepository.listSlots().some((slot) => slot.id === value.slotId && slot.remaining > 0)) {
        throw new RangeError("Choose an available illustrative window.");
      }
      const reference = `TD-${Date.now().toString(36).toUpperCase()}`;
      return repository.create({ ...value, reference, status: "requested", createdAt: new Date().toISOString() });
    },
    async lookup(reference) { return repository.findByReference(reference.trim().toUpperCase()); },
    async list() { return repository.list(); },
    async updateStatus(reference, status) {
      if (!["requested", "inspecting", "awaiting-parts", "ready"].includes(status)) throw new Error("Invalid status");
      return repository.updateStatus(reference.trim().toUpperCase(), status);
    },
  };
}
