import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

const aiConfig = {
  openAIKey: process.env.OPENAI_API_KEY || "",
  groqKey: process.env.GROQ_API_KEY || "",
  openAIModel: process.env.OPENAI_MODEL || "gpt-4.1",
  groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 10000,
};

export default aiConfig;
