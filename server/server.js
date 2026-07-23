import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import { requestLogger } from "./utils/logger.js";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

const clientPath = path.resolve(process.cwd(), "client");

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Chat API routes
app.use("/chat", chatRoutes);
app.use("/upload", uploadRoutes);

// Serve static client files
app.use(express.static(clientPath));

// Fallback to the client app for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// Centralized error handler
app.use(errorHandler);

// Only start the server when running locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT ?? 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;