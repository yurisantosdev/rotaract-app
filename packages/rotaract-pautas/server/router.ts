import { Router } from "express";
import { pautasRoutes } from "./routes/pautasRoutes";

export const pautasRouter = Router();

pautasRouter.use("/", pautasRoutes);
