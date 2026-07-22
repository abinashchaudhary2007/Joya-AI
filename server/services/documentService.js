import path from "path";
import supabase from "../config/supabase.js";
import { parsePdfText } from "../utils/pdfParser.js";
import { chunkText } from "../utils/chunkText.js";
import { generateEmbedding } from "./embeddingService.js";

export const ingestPdf = async ({ filePath, title }) => {
  const text = await parsePdfText(filePath);
  if (!text) {
    throw new Error("PDF text extraction returned no content.");
  }

  const chunks = await chunkText({ text, chunkSize: 1000, overlap: 200 });
  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("PDF text chunking returned no chunks.");
  }

  const records = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    records.push({
      title,
      content: chunk,
      embedding,
      created_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase.from("documents").insert(records);
  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("Failed to insert document chunks into Supabase.");
  }

  return records.length;
};
