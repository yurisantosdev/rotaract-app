import { Router } from "express";
import * as controller from "../controllers/contributionsController";

export const contributionsRoutes = Router();

contributionsRoutes.get("/", controller.list);
contributionsRoutes.get("/overdue", controller.listOverdue);
contributionsRoutes.post("/", controller.create);
contributionsRoutes.post("/generate", controller.generate);
contributionsRoutes.patch("/:id/exempt", controller.exempt);
contributionsRoutes.put("/:id", controller.update);
contributionsRoutes.delete("/:id", controller.remove);
