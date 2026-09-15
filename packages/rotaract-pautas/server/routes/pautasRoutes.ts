import { Router } from "express";
import * as controller from "../controllers/pautasController";

export const pautasRoutes = Router();

pautasRoutes.get("/", controller.list);
pautasRoutes.post("/", controller.create);
pautasRoutes.post("/:id/duplicate", controller.duplicate);
pautasRoutes.post("/:id/generate", controller.generate);
pautasRoutes.post("/:id/import-pending", controller.importPending);
pautasRoutes.post("/:id/items", controller.createItem);
pautasRoutes.post("/:id/items/:itemId/move", controller.moveItem);
pautasRoutes.put("/:id/items/:itemId", controller.updateItem);
pautasRoutes.delete("/:id/items/:itemId", controller.removeItem);
pautasRoutes.put("/:id", controller.update);
pautasRoutes.delete("/:id", controller.remove);
