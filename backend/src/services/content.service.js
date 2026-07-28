/**
 * Prototype "AI" story loader — returns predetermined packs by PDF filename
 * after a short delay so the UI still feels like generation is happening.
 */
const { resolvePack, listSupportedFilenames } = require("../content/modules.config");

const FAKE_AI_DELAY_MS = Number(process.env.FAKE_AI_DELAY_MS || 2500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} filename original uploaded PDF name
 * @param {string} [title] optional title from the form
 * @returns {Promise<{ packKey: string, topic: string, title: string, stories: Array, feedback: object }>}
 */
async function loadPredeterminedModule(filename, title = "") {
  const resolved = resolvePack(filename, title);
  if (!resolved) {
    const err = new Error(
      `This prototype only supports these PDFs: ${listSupportedFilenames().join(" or ")}. ` +
        `Rename your file to match (e.g. MATH3_Mod1.pdf for addition, MATH3_Mod2.pdf for division).`
    );
    err.statusCode = 400;
    throw err;
  }

  // Fake "AI generating stories..." latency
  await sleep(FAKE_AI_DELAY_MS);

  const { key, pack } = resolved;
  return {
    packKey: key,
    topic: pack.topic,
    title: pack.title,
    stories: pack.stories,
    feedback: pack.feedback,
  };
}

module.exports = { loadPredeterminedModule, listSupportedFilenames, FAKE_AI_DELAY_MS };
