import { Router } from "express";
import * as controller from "../controllers/membersController";

export const membersRoutes = Router();

membersRoutes.get("/", controller.list);
membersRoutes.post("/", controller.create);
membersRoutes.put("/:id", controller.update);