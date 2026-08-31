import { Router } from "express";
import { movementsRoutes } from "./routes/movementsRoutes";
import { contributionsRoutes } from "./routes/contributionsRoutes";

export const financeRouter = Router();

financeRouter.use("/movements", movementsRoutes);
financeRouter.use("/contributions", contributionsRoutes);
