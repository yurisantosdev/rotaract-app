import { Router } from "express";
import * as movementsController from "./controllers/movementsController";

export const financeRouter = Router();

financeRouter.get("/", movementsController.list);
financeRouter.get("/:id", movementsController.get);
financeRouter.post("/", movementsController.create);
financeRouter.put("/:id", movementsController.update);
financeRouter.delete("/:id", movementsController.remove);
