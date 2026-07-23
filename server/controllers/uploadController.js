import { ingestPdf } from "../services/documentService.js";

const uploadController = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "A PDF file is required for upload.",
      });
    }

    const title = req.body.title || file.originalname;
    const insertedCount = await ingestPdf({ filePath: file.buffer || file.path, title });

    return res.status(201).json({
      success: true,
      message: "PDF uploaded and indexed successfully.",
      insertedCount,
    });
  } catch (error) {
    console.error("Upload controller error:", error);
    return next(error);
  }
};

export default uploadController;
