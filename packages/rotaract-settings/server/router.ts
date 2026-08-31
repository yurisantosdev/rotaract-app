import { Router } from "express";
import { settingsRoutes } from "./routes/settingsRoutes";

export const settingsRouter = Router();

settingsRouter.use("/", settingsRoutes);
