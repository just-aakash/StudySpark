import express from "express";
import { saveSession, getSession, clearSession } from "../controllers/sessionController.js";
import { protect as authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/save", authMiddleware, saveSession);
router.get("/", authMiddleware, getSession);
router.delete("/", authMiddleware, clearSession);

export default router;