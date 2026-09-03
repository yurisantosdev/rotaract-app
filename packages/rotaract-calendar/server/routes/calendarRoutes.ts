import { Router } from "express";
import * as calendarController from "../controllers/calendarController";

export const calendarRoutes = Router();

calendarRoutes.get("/", calendarController.list);
calendarRoutes.post("/", calendarController.create);
calendarRoutes.put("/:id", calendarController.update);
calendarRoutes.delete("/:id", calendarController.remove);