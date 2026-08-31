import { Router } from "express";
import * as movementsController from "../controllers/movementsController";

export const movementsRoutes = Router();

movementsRoutes.get("/", movementsController.list);
movementsRoutes.post("/", movementsController.create);
movementsRoutes.put("/:id", movementsController.update);
movementsRoutes.delete("/:id", movementsController.remove);
