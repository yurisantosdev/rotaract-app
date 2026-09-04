import { Router } from "express";
import { noticesRoutes } from "./routes/noticesRoutes";

export const noticesRouter = Router();

noticesRouter.use("/", noticesRoutes);