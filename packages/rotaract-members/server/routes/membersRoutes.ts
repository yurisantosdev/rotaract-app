import { Router } from "express";
import * as membersController from "../controllers/membersController";

export const membersRoutes = Router();

membersRoutes.get("/", membersController.list);
membersRoutes.post("/", membersController.create);
membersRoutes.put("/:id", membersController.update);