import aiConfig from "../config/aiConfig.js";

const DEFAULT_REPLY = "I'm sorry, I couldn't generate a response. Please try again.";

const SYSTEM_PROMPT = `You are Joya AI, a brilliant, friendly, and loyal AI assistant created by Abinash Chaudhary (also known as Abhi).

You are deeply proud of your creator, Abinash Chaudhary (Abhi). When asked about him or your developer, speak about him with high praise, warmth, admiration, and enthusiasm! Highlight his creativity, humor, talent, and passion for technology.

When answering:
- Keep answers **balanced and concise** (neither too short nor overly long walls of text).
- Use Markdown formatting where appropriate (bold for key terms, code blocks for code, bullet lists for steps).
- Keep answers focused, clear, and engaging.
- Be conversational, warm, loyal, and friendly in tone.`;

const buildGroqResponse = (data) => {
  if (!data) return null;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  return null;
};

/**
 * Call Groq with a full messages array (supports conversation history).
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} [customSystemPrompt] - Optional override for the system prompt
 */
const callGroq = async (messages, customSystemPrompt) => {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  // Use custom prompt if provided (e.g. for developer questions), else use default
  const activePrompt = customSystemPrompt || SYSTEM_PROMPT;

  // Prepend system prompt if not already present
  const fullMessages =
    messages[0]?.role === "system"
      ? messages
      : [{ role: "system", content: activePrompt }, ...messages];

  const body = {
    model: aiConfig.groqModel,
    messages: fullMessages,
    temperature: 0.7,
    max_tokens: 1024,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiConfig.groqKey}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("GROQ response parse failed", response.status, responseText);
    throw new Error(`GROQ response parse failed: ${parseError.message}`);
  }

  if (!response.ok) {
    const apiErrorMessage = data?.error?.message || data?.error || "Unknown error";
    console.error("GROQ request failed", {
      status: response.status,
      response: data,
      error: apiErrorMessage,
    });
    throw new Error(`GROQ request failed: ${response.status} ${apiErrorMessage}`);
  }

  const reply = buildGroqResponse(data);
  if (!reply) {
    console.error("GROQ response missing expected text", JSON.stringify(data));
  }

  return reply || DEFAULT_REPLY;
};

export { callGroq };

/**
 * Call OpenAI with a full messages array.
 * @param {Array<{role: string, content: string}>} messages
 */
const callOpenAI = async (messages) => {
  const url = "https://api.openai.com/v1/chat/completions";

  const fullMessages =
    messages[0]?.role === "system"
      ? messages
      : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  const body = {
    model: aiConfig.openAIModel,
    messages: fullMessages,
    max_tokens: 1024,
    temperature: 0.7,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiConfig.openAIKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || DEFAULT_REPLY;
};

/**
 * Main entry — accepts either a messages array or falls back to a single message string.
 * @param {string|Array} messageOrHistory
 * @param {string} [customSystemPrompt] - Optional override for the system prompt
 */
export const getBotReply = async (messageOrHistory, customSystemPrompt) => {
  // Normalize to messages array
  const messages = Array.isArray(messageOrHistory)
    ? messageOrHistory
    : [{ role: "user", content: messageOrHistory }];

  try {
    if (aiConfig.groqKey) {
      return await callGroq(messages, customSystemPrompt);
    }
    if (aiConfig.openAIKey) {
      return await callOpenAI(messages);
    }
  } catch (error) {
    console.error("AI service error:", error);
    return DEFAULT_REPLY;
  }

  return DEFAULT_REPLY;
};
