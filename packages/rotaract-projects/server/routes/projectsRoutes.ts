import { Router } from "express";
import * as controller from "../controllers/projectsController";

export const projectsRoutes = Router();

projectsRoutes.get("/", controller.list);
projectsRoutes.post("/", controller.create);
projectsRoutes.put("/:id", controller.update);
projectsRoutes.delete("/:id", controller.remove);