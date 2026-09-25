import { Router } from "express";
import * as controller from "../controllers/reportsController";

export const reportsRoutes = Router();

reportsRoutes.get("/", controller.list);
reportsRoutes.post("/", controller.create);
reportsRoutes.delete("/:id", controller.remove);
reportsRoutes.put("/:id", controller.update);