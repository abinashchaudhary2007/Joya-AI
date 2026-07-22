import aiConfig from "../config/aiConfig.js";

const EMBEDDING_URL = "https://api.groq.com/openai/v1/embeddings";
const EMBEDDING_MODEL = process.env.GROQ_EMBEDDING_MODEL || "text-embedding-3-small";

export const generateEmbedding = async (input) => {
  if (!input || typeof input !== "string") {
    throw new Error("Embedding generation requires a non-empty string input.");
  }

  const response = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiConfig.groqKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input,
    }),
  });

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Embedding response parse failed", response.status, responseText);
    throw new Error("Failed to parse embedding response from Groq.");
  }

  if (!response.ok) {
    const apiErrorMessage = data?.error?.message || data?.error || "Unknown embedding error";
    console.error("Embedding request failed", {
      status: response.status,
      response: data,
      error: apiErrorMessage,
    });
    throw new Error(`Embedding request failed: ${response.status} ${apiErrorMessage}`);
  }

  const embedding = data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) {
    throw new Error("Embedding response did not include a valid vector.");
  }

  return embedding;
};
