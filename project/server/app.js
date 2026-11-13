import express from "express";
import { z } from "zod";
import { createBookingService, DomainError } from "./services/bookingService.js";

const searchSchema = z.object({ checkIn: z.string(), checkOut: z.string(), guests: z.coerce.number().int().min(1).max(4) });
const previewSchema = searchSchema.extend({
  roomId: z.string().min(1),
  extraIds: z.array(z.string()).max(3),
  guestName: z.string().trim().min(2).max(80),
  guestEmail: z.string().trim().email().max(160),
});

export function createApp(repository) {
  const app = express();
  const service = createBookingService(repository);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/rooms", async (req, res, next) => {
    try {
      const hasSearch = ["checkIn", "checkOut", "guests"].some(key => key in req.query);
      res.json(hasSearch ? await service.searchRooms(searchSchema.parse(req.query)) : await service.listRooms());
    } catch (error) { next(error); }
  });
  app.get("/api/previews", async (_req, res, next) => {
    try { res.json(await service.listPreviews()); } catch (error) { next(error); }
  });
  app.post("/api/previews", async (req, res, next) => {
    try { res.status(201).json(await service.createPreview(previewSchema.parse(req.body))); } catch (error) { next(error); }
  });
  app.delete("/api/previews/:id", async (req, res, next) => {
    try { await service.deletePreview(req.params.id); res.status(204).end(); } catch (error) { next(error); }
  });
  app.use((error, _req, res, _next) => {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request.", issues: error.issues });
    if (error instanceof DomainError) return res.status(error.status).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  });
  return app;
}
