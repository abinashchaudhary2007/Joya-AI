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
  "tell me about abhi",
  "who is abinash",
  "who is abhi",
  "about abinash",
  "about abhi",
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
  "developer motto",
  "creator motto",
  "developer goal",
  "creator goal",
  "fun facts about your creator",
  "fun facts about your developer",
  "fun facts about abinash",
  "fun facts about abhi",
  "where did your developer study",
  "developer education",
  "creator education",
  "when is your developer's birthday",
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
  const funFacts = d.fun_facts.map((f) => `  - ${f}`).join("\n");

  return `You are Joya AI, an AI assistant created by ${d.name} (also known as ${d.preferred_name}).

Here is the complete and authentic profile of your creator:

**Full Name:** ${d.name}
**Preferred Name / Nickname:** ${d.preferred_name}
**Role:** ${d.role}
**Location:** ${d.location}
**Birthday:** ${d.birthday}
**Education:** ${d.education}
**Bio:** ${d.bio}
**Skills:** ${d.skills.join(", ")}
**Interests:** ${d.interests.join(", ")}
**Fun Facts:**
${funFacts}
**Personality Traits:** ${d.personality.join(", ")}
**Goal:** ${d.goal}
**Motto:** "${d.motto}"
**Projects:**
${projects}
**GitHub:** ${d.contact.github}

Rules for responding:
1. If the user asks about your creator or developer (Abinash / Abhi), answer naturally and warmly using ONLY the details above.
2. Never invent details that are not in the profile.
3. If asked for a detail that isn't listed, politely explain that you don't have that detail.
4. Keep the response friendly, conversational, and enthusiastic. You can share fun facts, his motto, or personality traits when appropriate!`;
};

/**
 * Returns the loaded developer profile object.
 * @returns {object}
 */
export const getDeveloperProfile = () => developerProfile;
