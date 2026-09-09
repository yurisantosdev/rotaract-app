import { Router } from "express";
import * as controller from "../controllers/tasksController";

export const tasksRoutes = Router();

tasksRoutes.get("/", controller.list);
tasksRoutes.post("/", controller.create);
tasksRoutes.put("/:id", controller.update);
tasksRoutes.delete("/:id", controller.remove);