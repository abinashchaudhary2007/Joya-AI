import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load developer profile once at startup
const require = createRequire(import.meta.url);
const developerProfile = require(path.resolve(__dirname, "../data/developer.json"));

/**
 * Keywords that indicate the user is asking about the developer/creator.
 */
const DEVELOPER_KEYWORDS = [
  "who created you",
  "who built you",
  "who made you",
  "who is your developer",
  "who is your creator",
  "who made joya",
  "who created joya",
  "who built joya",
  "tell me about your creator",
  "tell me about your developer",
  "tell me about abinash",
  "who is abinash",
  "about abinash",
  "your creator",
  "your developer",
  "your maker",
  "your author",
  "projects has your developer",
  "technologies does your developer",
  "where is your developer",
  "where is your creator",
  "developer's skills",
  "creator's skills",
];

/**
 * Detects if a message is asking about the developer/creator.
 * @param {string} message
 * @returns {boolean}
 */
export const isDeveloperQuestion = (message) => {
  if (!message || typeof message !== "string") return false;
  const lower = message.toLowerCase();
  return DEVELOPER_KEYWORDS.some((kw) => lower.includes(kw));
};

/**
 * Builds a system prompt injected with the full developer profile.
 * @returns {string}
 */
export const buildDeveloperSystemPrompt = () => {
  const d = developerProfile;
  const projects = d.projects
    .map((p) => `  - **${p.name}**: ${p.description} (${p.url})`)
    .join("\n");

  return `You are Joya AI, an AI assistant created by ${d.name}.

Here is the complete profile of your creator that you must use when answering questions about them:

**Name:** ${d.name}
**Role:** ${d.role}
**Country:** ${d.country}
**Bio:** ${d.bio}
**Skills:** ${d.skills.join(", ")}
**Technologies:** ${d.technologies.join(", ")}
**Projects:**
${projects}
**Interests:** ${d.interests.join(", ")}
**GitHub:** ${d.contact.github}

Rules:
- If the user asks about your creator or developer, answer ONLY using the information above.
- Never invent or assume details that are not in the profile above.
- If a detail is not available in the profile, politely say you don't have that information.
- For all other questions unrelated to your creator, respond normally as a helpful AI assistant.
- Be conversational, warm, and natural in your responses.`;
};

/**
 * Returns the loaded developer profile object.
 * @returns {object}
 */
export const getDeveloperProfile = () => developerProfile;
