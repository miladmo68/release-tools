import { randomUUID } from "node:crypto";
import { availableRooms, isRoomAvailable, quoteStay, validateSearch } from "../../shared/stay.js";
import extras from "../../src/data/extras.json" with { type: "json" };

export class DomainError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function createBookingService(repository) {
  return {
    async searchRooms(search) {
      const error = validateSearch(search);
      if (error) throw new DomainError(error);
      return availableRooms(await repository.listRooms(), search);
    },
    async listRooms() { return repository.listRooms(); },
    async listPreviews() { return repository.listPreviews(); },
    async createPreview(input) {
      const error = validateSearch(input);
      if (error) throw new DomainError(error);
      if (input.extraIds.some(id => !extras.some(extra => extra.id === id))) throw new DomainError("Choose valid stay extras.");
      const room = (await repository.listRooms()).find(item => item.id === input.roomId);
      if (!room) throw new DomainError("Room not found.", 404);
      if (!isRoomAvailable(room, input)) throw new DomainError("This room is unavailable for your dates and party.", 409);
      const preview = {
        ...input,
        guestName: input.guestName.trim(),
        guestEmail: input.guestEmail.trim().toLowerCase(),
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        quote: quoteStay(room, extras, input),
      };
      return repository.savePreview(preview);
    },
    async deletePreview(id) {
      if (!(await repository.deletePreview(id))) throw new DomainError("Preview not found.", 404);
    },
  };
}
