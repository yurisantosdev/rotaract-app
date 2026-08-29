import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/", authController.login);

export default router;
