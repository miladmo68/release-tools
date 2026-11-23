import express from "express";
import { ZodError } from "zod";
import { createIntakeService, WorkflowConflictError } from "./services/intakeService.js";
import { jsonCatalogRepository } from "./repositories/jsonCatalogRepository.js";

export function createApp(repository) {
  const app = express();
  const service = createIntakeService(repository);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (_request, response) => response.json({ ok: true }));
  app.get("/api/catalog", (_request, response) => response.json({ devices: jsonCatalogRepository.listDevices(), repairs: jsonCatalogRepository.listRepairs(), serviceSlots: jsonCatalogRepository.listSlots() }));
  app.get("/api/intakes", async (_request, response, next) => {
    try { response.json(await service.list()); } catch (error) { next(error); }
  });
  app.get("/api/intakes/:reference", async (request, response, next) => {
    try {
      const item = await service.lookup(request.params.reference);
      if (!item) return response.status(404).json({ error: "Repair plan not found" });
      response.json(item);
    } catch (error) { next(error); }
  });
  app.post("/api/intakes", async (request, response, next) => {
    try { response.status(201).json(await service.create(request.body)); } catch (error) { next(error); }
  });
  app.patch("/api/intakes/:reference/status", async (request, response, next) => {
    try {
      const item = await service.updateStatus(request.params.reference, request.body.status);
      if (!item) return response.status(404).json({ error: "Repair plan not found" });
      response.json(item);
    } catch (error) { next(error); }
  });
  app.use((error, _request, response, next) => {
    void next;
    if (error instanceof ZodError) return response.status(400).json({ error: "Check the highlighted fields", issues: error.flatten() });
    if (error instanceof RangeError) return response.status(400).json({ error: error.message });
    if (error instanceof WorkflowConflictError) return response.status(409).json({ error: error.message });
    if (error instanceof SyntaxError && "body" in error) return response.status(400).json({ error: "Invalid JSON" });
    if (error.message === "Invalid status") return response.status(400).json({ error: error.message });
    response.status(500).json({ error: "Something went wrong. Please try again." });
  });
  return app;
}
