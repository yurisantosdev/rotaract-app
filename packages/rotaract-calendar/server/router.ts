import { Router } from "express";
import { calendarRoutes } from "./routes/calendarRoutes";

export const calendarRouter = Router();

calendarRouter.use("/", calendarRoutes);
