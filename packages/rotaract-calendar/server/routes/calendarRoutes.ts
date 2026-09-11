import { Router } from "express";
import * as controller from "../controllers/calendarController";

export const calendarRoutes = Router();

calendarRoutes.get("/", controller.list);
calendarRoutes.get("/pending-accept", controller.listPendingAccept);
calendarRoutes.post("/", controller.create);
calendarRoutes.put("/:id", controller.update);
calendarRoutes.delete("/:id", controller.remove);