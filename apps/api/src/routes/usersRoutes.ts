import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as usersController from "../controllers/usersController";

const router = Router();

router.get("/", requireAuth, usersController.list);
router.get("/:id", requireAuth, usersController.get);
router.post("/", usersController.create);

export default router;
