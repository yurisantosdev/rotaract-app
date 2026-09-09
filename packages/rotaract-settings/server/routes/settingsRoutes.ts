import { Router } from "express";
import * as controller from "../controllers/settingsController";

export const settingsRoutes = Router();

settingsRoutes.get("/", controller.list);
settingsRoutes.post("/", controller.create);
settingsRoutes.put("/:id", controller.update);
