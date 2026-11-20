import { intakeInput } from "../validation/intake.js";

export function createIntakeService(repository) {
  return {
    async create(raw) {
      const value = intakeInput.parse(raw);
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
