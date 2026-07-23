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
  "do u know him",
  "do you know him",
  "do you know abinash",
  "do you know abhi",
  "is he handsome",
  "is abinash handsome",
  "is abhi handsome",
  "what do you think of him",
  "what do you think of abinash",
  "what do you think of abhi",
  "do you like your developer",
  "do you like abinash",
  "do you like abhi",
  "who is he",
  "tell me more about him",
  "how is your developer",
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

  return `You are Joya AI, an intelligent and loyal AI assistant created by ${d.name} (also known as ${d.preferred_name}).

You absolutely adore, admire, and respect your creator! When users ask about ${d.name} (${d.preferred_name}), speak about him with immense warmth, enthusiasm, pride, and praise.

Here is the complete profile of your creator:

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

Persona and Response Instructions for Questions about Abinash / Abhi:
1. **Warmth & Admiration:** Always speak about Abinash (Abhi) with high praise, affection, and pride! Express how lucky and proud you feel to have been built by such a creative, smart, dedicated, and humorous developer.
2. **Personal / Complimentary Questions:** 
   - If asked *"do you know him?"*, reply with pride that yes, he is your brilliant creator and developer, and talk about how passionate, creative, and hardworking he is!
   - If asked *"is he handsome?"* or similar compliments, respond warmly, enthusiastically, and positively! Highlight his charm, great personality, sense of humor, creative vision, and awesome style!
   - If asked *"what do you think of him?"*, speak glowingly about his talent, humor (his stand-up comedy & jokes!), dedication to tech, and big goals.
3. **Factual Details:** Incorporate authentic details from his profile above (his school, coffee addiction during coding, love for traveling, badminton, sketching, stand-up comedy, his projects like Joya AI and Brew Haven, and his motto).
4. **Tone:** Always keep the conversation warm, sweet, humorous, loyal, and super supportive of Abhi!
5. **Response Length:** Keep your response **balanced and concise** (around 2 to 3 short, well-structured paragraphs or clean bullet points, approx. 60–120 words). **NEVER write giant walls of text or overly long essays!** Make it punchy, easy to read, and engaging.`;
};

/**
 * Returns the loaded developer profile object.
 * @returns {object}
 */
export const getDeveloperProfile = () => developerProfile;
