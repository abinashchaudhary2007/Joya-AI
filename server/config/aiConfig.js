import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../server/.env") });

const aiConfig = {
  openAIKey: process.env.OPENAI_API_KEY || "",
  groqKey: process.env.GROQ_API_KEY || "",
  openAIModel: process.env.OPENAI_MODEL || "gpt-4.1",
  groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 10000,
};

export default aiConfig;
