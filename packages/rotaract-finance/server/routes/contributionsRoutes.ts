import { Router } from "express";
import * as contributionsController from "../controllers/contributionsController";

export const contributionsRoutes = Router();

contributionsRoutes.get("/", contributionsController.list);
contributionsRoutes.post("/", contributionsController.create);
contributionsRoutes.post("/generate", contributionsController.generate);
contributionsRoutes.patch("/:id/exempt", contributionsController.exempt);
contributionsRoutes.put("/:id", contributionsController.update);
contributionsRoutes.delete("/:id", contributionsController.remove);
