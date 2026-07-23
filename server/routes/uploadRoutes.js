import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import uploadController from "../controllers/uploadController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (file.mimetype !== "application/pdf") {
    return callback(new Error("Only PDF files are accepted."), false);
  }
  callback(null, true);
};

const upload = multer({ storage, fileFilter });
const router = express.Router();

router.post("/", upload.single("file"), uploadController);

export default router;
