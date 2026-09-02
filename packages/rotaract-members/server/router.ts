import { Router } from "express";
import { membersRoutes } from "./routes/membersRoutes";

export const membersRouter = Router();

membersRouter.use("/", membersRoutes);
