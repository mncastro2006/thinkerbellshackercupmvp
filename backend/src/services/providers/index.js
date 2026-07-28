/**
 * Multi-provider AI abstraction.
 *
 * Every provider module exports:
 *   - name: string
 *   - isConfigured(): boolean            (has the required API key)
 *   - generateJson({ systemPrompt, userPrompt, temperature }): Promise<string>
 *     must return raw JSON text (the caller parses it).
 *
 * `runWithFallback` tries each configured provider in order (as set by
 * AI_PROVIDER_ORDER, e.g. "openai,gemini") and returns the first successful,
 * schema-valid result. This exists so a single provider's rate limits or
 * outages don't take down AI-backed features — e.g. OpenAI's free/low tiers
 * have strict daily caps, so falling through to Gemini (or vice versa) keeps
 * things working without any user-visible interruption.
 */
const openaiProvider = require("./openai.provider");
const geminiProvider = require("./gemini.provider");

const PROVIDERS = {
  openai: openaiProvider,
  gemini: geminiProvider,
};

function getProviderOrder() {
  const configured = (process.env.AI_PROVIDER_ORDER || "openai,gemini")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  // De-dupe while preserving order, and drop unknown provider names.
  const seen = new Set();
  return configured.filter((p) => {
    if (!PROVIDERS[p] || seen.has(p)) return false;
    seen.add(p);
    return true;
  });
}

/**
 * @param {{ systemPrompt: string, userPrompt: string, temperature?: number }} args
 * @param {(raw: string, providerName: string) => any} parseAndValidate
 *   Called with the raw JSON text from each provider; should JSON.parse it,
 *   validate the shape, and either return the parsed+backfilled object or
 *   throw. Thrown errors cause `runWithFallback` to try the next provider.
 * @returns {Promise<{ result: any, providerName: string }>}
 * @throws {Error} if no provider is configured, or every configured
 *   provider failed (the error's `.attempts` lists per-provider failures).
 */
async function runWithFallback({ systemPrompt, userPrompt, temperature }, parseAndValidate) {
  const order = getProviderOrder();
  const attempts = [];

  for (const providerName of order) {
    const provider = PROVIDERS[providerName];
    if (!provider.isConfigured()) {
      attempts.push({ provider: providerName, reason: "not configured (missing API key)" });
      continue;
    }
    try {
      const raw = await provider.generateJson({ systemPrompt, userPrompt, temperature });
      const result = parseAndValidate(raw, providerName);
      return { result, providerName };
    } catch (err) {
      attempts.push({ provider: providerName, reason: err.message });
      console.warn(`[ai.providers] ${providerName} failed, trying next provider:`, err.message);
    }
  }

  const err = new Error(
    `All AI providers unavailable or failed (${attempts.map((a) => `${a.provider}: ${a.reason}`).join("; ") || "no providers configured"})`
  );
  err.attempts = attempts;
  throw err;
}

module.exports = { runWithFallback, getProviderOrder, PROVIDERS };
