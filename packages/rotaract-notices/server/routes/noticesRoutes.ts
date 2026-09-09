import { Router } from "express";
import * as controller from "../controllers/noticesController";

export const noticesRoutes = Router();

noticesRoutes.get("/", controller.list);
noticesRoutes.post("/", controller.create);
noticesRoutes.delete("/:id", controller.remove);
noticesRoutes.get("/read-all/:id", controller.readAll);