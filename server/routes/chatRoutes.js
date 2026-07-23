import express from "express";
import chatController from "../controllers/chatController.js";
import ttsController from "../controllers/ttsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, chatController);
router.post("/tts", authMiddleware, ttsController);

export default router;