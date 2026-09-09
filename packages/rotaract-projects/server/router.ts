import { Router } from "express";
import { projectsRoutes } from "./routes/projectsRoutes";

export const projectsRouter = Router();

projectsRouter.use("/", projectsRoutes);
