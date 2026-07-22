import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const chunkText = async ({ text, chunkSize = 1000, overlap = 200 }) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: overlap,
  });

  const documents = await splitter.splitText(text);
  return documents.map((chunk) => chunk.trim()).filter(Boolean);
};
