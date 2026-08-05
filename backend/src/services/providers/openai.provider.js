/**
 * OpenAI provider — thin wrapper so ai.service.js can treat every LLM
 * provider the same way (see providers/index.js for the shared interface).
 */
const OpenAI = require("openai");

const name = "openai";

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * @param {{ systemPrompt: string, userPrompt: string, temperature?: number }} args
 * @returns {Promise<string>} raw JSON text from the model
 */
async function generateJson({ systemPrompt, userPrompt, temperature = 0.7 }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    response_format: { type: "json_object" },
  });

  return completion.choices[0].message.content;
}

module.exports = { name, isConfigured, generateJson };
