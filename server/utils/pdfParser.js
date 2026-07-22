import fs from "fs/promises";
import pdfParse from "pdf-parse";

export const parsePdfText = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const data = await pdfParse(fileBuffer);
  return data.text || "";
};
