import { getBotReply } from "../services/aiService.js";
import { getRagReply } from "../services/ragService.js";
import { validateChatPayload } from "../utils/helpers.js";

const chatController = async (req, res, next) => {
  try {
    const validationError = validateChatPayload(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError,
      });
    }

    // Support both a messages array (with history) and a plain message string
    const { message, messages } = req.body;

    // RAG mode requires Supabase AND a working embedding model.
    // The default embedding model (text-embedding-3-small) is an OpenAI model,
    // so only enable RAG if the user has explicitly set GROQ_EMBEDDING_MODEL
    // or has an OpenAI key available.
    const hasEmbeddingCapability = Boolean(
      process.env.GROQ_EMBEDDING_MODEL || process.env.OPENAI_API_KEY
    );
    const useRag = Boolean(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      hasEmbeddingCapability
    );

    let reply;
    if (useRag) {
      // RAG mode: use the latest message for retrieval
      const latestMessage = messages
        ? messages[messages.length - 1]?.content
        : message;
      reply = await getRagReply(latestMessage);
    } else {
      // Pass full history if available, otherwise fall back to single message
      reply = await getBotReply(messages || message);
    }

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      reply: error.message,
    });
  }
};

export default chatController;