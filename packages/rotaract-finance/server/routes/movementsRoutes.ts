import { Router } from "express";
import * as controller from "../controllers/movementsController";

export const movementsRoutes = Router();

movementsRoutes.get("/", controller.list);
movementsRoutes.post("/import", controller.importMany);
movementsRoutes.post("/", controller.create);
movementsRoutes.put("/:id", controller.update);
movementsRoutes.delete("/:id", controller.remove);
