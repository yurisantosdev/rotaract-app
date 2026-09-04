import { Router } from "express";
import * as noticesController from "../controllers/noticesController";

export const noticesRoutes = Router();

noticesRoutes.get("/", noticesController.list);
noticesRoutes.post("/", noticesController.create);
noticesRoutes.delete("/:id", noticesController.remove);
noticesRoutes.get("/read-all/:id", noticesController.readAll);