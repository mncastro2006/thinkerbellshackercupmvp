/**
 * Gemini provider — thin wrapper so ai.service.js can treat every LLM
 * provider the same way (see providers/index.js for the shared interface).
 *
 * Uses @google/genai, Google's current officially-supported SDK (the older
 * @google/generative-ai package reached end-of-life in Aug 2025).
 */
const { GoogleGenAI } = require("@google/genai");

const name = "gemini";

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * @param {{ systemPrompt: string, userPrompt: string, temperature?: number }} args
 * @returns {Promise<string>} raw JSON text from the model
 */
async function generateJson({ systemPrompt, userPrompt, temperature = 0.7 }) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini response contained no text");
  return text;
}

module.exports = { name, isConfigured, generateJson };
