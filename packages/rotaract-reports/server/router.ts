import { Router } from "express";
import { reportsRoutes } from "./routes/reportsRoutes";

export const reportsRouter = Router();

reportsRouter.use("/", reportsRoutes);