export const validateChatPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "Request body must be a valid JSON object.";
  }

  // Accept either a `messages` array or a single `message` string
  const hasMessages =
    Array.isArray(payload.messages) && payload.messages.length > 0;
  const hasMessage =
    payload.message && typeof payload.message === "string";

  if (!hasMessages && !hasMessage) {
    return "Either 'message' (string) or 'messages' (array) is required.";
  }

  if (hasMessage && payload.message.trim().length === 0) {
    return "Message cannot be empty.";
  }

  if (hasMessages) {
    for (const msg of payload.messages) {
      if (!msg.role || !msg.content) {
        return "Each message in 'messages' must have 'role' and 'content'.";
      }
    }
  }

  return null;
};
