const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Extracts raw text from an uploaded PDF file on disk.
 */
async function extractTextFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return (data.text || "").trim();
}

module.exports = { extractTextFromPdf };
