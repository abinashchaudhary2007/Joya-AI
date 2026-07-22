import { generateEmbedding } from "./embeddingService.js";
import { getRelevantDocuments } from "./retrievalService.js";
import { callGroq } from "./aiService.js";

const buildPrompt = ({ contextChunks, question }) => {
  const contextText = contextChunks
    .map((chunk, index) => `Chunk ${index + 1}: ${chunk.content}`)
    .join("\n\n");

  return `You are a helpful assistant.

Answer ONLY using the provided context.
If the answer does not exist in the context, say you don't know.

Context:
${contextText}

User:
${question}`;
};

export const getRagReply = async (question) => {
  const embedding = await generateEmbedding(question);
  const relevantDocuments = await getRelevantDocuments(embedding, 5);

  const prompt = buildPrompt({
    contextChunks: relevantDocuments,
    question,
  });

  return await callGroq(prompt);
};
