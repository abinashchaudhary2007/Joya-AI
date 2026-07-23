import fs from "fs/promises";
import pdfParse from "pdf-parse-new";

export const parsePdfText = async (fileInput) => {
  const fileBuffer = Buffer.isBuffer(fileInput) ? fileInput : await fs.readFile(fileInput);
  const data = await pdfParse(fileBuffer);
  return data.text || "";
};
