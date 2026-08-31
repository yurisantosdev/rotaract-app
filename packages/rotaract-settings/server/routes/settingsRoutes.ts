import { Router } from "express";
import * as settingsController from "../controllers/settingsController";

export const settingsRoutes = Router();

settingsRoutes.get("/", settingsController.list);
settingsRoutes.post("/", settingsController.create);
settingsRoutes.put("/:id", settingsController.update);
