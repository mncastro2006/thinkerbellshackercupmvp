/**
 * ai.service.js
 *
 * Turns the raw text extracted from a parent's uploaded PDF module into
 * 3 short, easy-to-visualize stories, each with 5 multiple-choice
 * questions, suitable for a neurodivergent learner.
 *
 * If OPENAI_API_KEY is configured, a real LLM call is made. Otherwise this
 * falls back to a deterministic, template-based generator so the whole
 * product still works out of the box with zero external dependencies.
 */

const OpenAI = require("openai");

const ASSET_POOL = [
  "girl", "boy", "apple", "orange", "banana", "basket", "coin", "wallet",
  "candy", "balloon", "book", "pencil", "star", "cookie", "cupcake",
  "backpack", "notebook", "flower", "toy_car", "fish",
];

const THEMES = ["market", "money", "sharing"];

/** Guess the arithmetic focus + difficulty of the module from its text. */
function detectTopic(text) {
  const t = (text || "").toLowerCase();

  let operation = "addition";
  if (/(subtract|minus|difference|take away)/.test(t)) operation = "subtraction";
  if (/(multipl|times|product of)/.test(t)) operation = "multiplication";
  if (/(divide|division|share equally|quotient)/.test(t)) operation = "division";

  let digitLevel = 1; // single digit 1-9
  if (/(2[\s-]?digit|tens and ones|ten[s]?\b)/.test(t)) digitLevel = 2;
  if (/(3[\s-]?digit|hundreds)/.test(t)) digitLevel = 3;

  const opLabel = {
    addition: "Addition",
    subtraction: "Subtraction",
    multiplication: "Multiplication",
    division: "Division",
  }[operation];

  const topic = `${opLabel} of ${digitLevel}-digit numbers`;

  return { operation, digitLevel, topic };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rangeForDigitLevel(level) {
  if (level >= 3) return [100, 500];
  if (level === 2) return [10, 50];
  return [1, 9];
}

function pickAssets(n) {
  const shuffled = [...ASSET_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildChoices(correct) {
  const choices = new Set([String(correct)]);
  while (choices.size < 4) {
    const delta = randInt(-5, 5) || 1;
    const distractor = Math.max(0, correct + delta);
    choices.add(String(distractor));
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

function computeAnswer(operation, a, b) {
  switch (operation) {
    case "subtraction":
      return Math.max(a, b) - Math.min(a, b);
    case "multiplication":
      return a * b;
    case "division": {
      // ensure clean division
      const divisor = Math.max(1, Math.min(a, b));
      const quotient = randInt(2, 9);
      return { a: divisor * quotient, b: divisor, result: quotient };
    }
    default:
      return a + b;
  }
}

const NAME_POOL = ["Lea", "Anna", "Ben", "Mika", "Sam", "Jaya", "Leo", "Nina"];

function buildStory({ theme, operation, digitLevel, orderIndex }) {
  const [min, max] = rangeForDigitLevel(digitLevel);
  const name = NAME_POOL[randInt(0, NAME_POOL.length - 1)];
  const assets = pickAssets(3);
  const [itemA, itemB] = assets;

  const themeIntro = {
    market: `${name} went to the market with a basket to buy some fruits.`,
    money: `${name} saved some coins in a wallet to buy a small gift.`,
    sharing: `${name} wanted to share treats with friends at school.`,
  }[theme];

  const questions = [];
  for (let i = 0; i < 5; i++) {
    const a = randInt(min, max);
    const b = randInt(min, max);

    let text, correctAnswer, qAssets;

    if (operation === "division") {
      const { a: dividend, b: divisor, result } = computeAnswer(operation, a, b);
      text = `${name} has ${dividend} ${itemA}s and wants to put them equally into ${divisor} baskets. How many ${itemA}s go in each basket?`;
      correctAnswer = result;
      qAssets = [itemA];
    } else if (operation === "multiplication") {
      const result = computeAnswer(operation, a, b);
      text = `${name} buys ${a} bags with ${b} ${itemA}s in each bag. How many ${itemA}s does ${name} have in total?`;
      correctAnswer = result;
      qAssets = [itemA];
    } else if (operation === "subtraction") {
      const hi = Math.max(a, b);
      const lo = Math.min(a, b);
      text = `${name} had ${hi} ${itemA}s and gave away ${lo} ${itemA}s. How many ${itemA}s does ${name} have left?`;
      correctAnswer = computeAnswer(operation, a, b);
      qAssets = [itemA];
    } else {
      text = `${name} bought ${a} ${itemA}s and ${b} ${itemB}s. How many items did ${name} buy overall?`;
      correctAnswer = computeAnswer(operation, a, b);
      qAssets = [itemA, itemB];
    }

    questions.push({
      orderIndex: i,
      text,
      choices: buildChoices(Number(correctAnswer)),
      correctAnswer: String(correctAnswer),
      skillTag: `${operation}-${digitLevel}digit`,
      visualAssets: qAssets,
    });
  }

  return {
    orderIndex,
    title: `${name}'s ${theme === "market" ? "Trip to the Market" : theme === "money" ? "Saved Coins" : "Sharing Day"}`,
    content: `${themeIntro} Help ${name} solve the problems below by counting carefully!`,
    theme,
    visualAssets: assets,
    questions,
  };
}

/** Deterministic offline generator - no external API required. */
function generateStoriesFallback(text) {
  const { operation, digitLevel, topic } = detectTopic(text);
  const stories = THEMES.map((theme, idx) =>
    buildStory({ theme, operation, digitLevel, orderIndex: idx })
  );
  return { topic, stories };
}

/** LLM-backed generator used when OPENAI_API_KEY is configured. */
async function generateStoriesWithOpenAI(text) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are an assistant that adapts a math curriculum excerpt into
learning material for a neurodivergent child. Produce EXACTLY 3 short stories, each with
EXACTLY 5 multiple-choice questions (4 choices each). Keep story complexity and question
difficulty consistent with the source material - your job is to simplify wording and
context (not the difficulty) so the concept is easier to visualize (e.g. buying fruit at
a market, counting coins, sharing candy). Use simple sentences, concrete relatable
scenarios, and small named characters. Each question and story must include a list of
"visualAssets" chosen ONLY from this pool: ${ASSET_POOL.join(", ")}.
Respond with ONLY valid JSON (no markdown fences) matching this shape:
{
  "topic": "string, e.g. Addition of 2-digit numbers",
  "stories": [
    {
      "title": "string",
      "content": "1-3 sentence story intro",
      "theme": "market|money|sharing",
      "visualAssets": ["apple","orange"],
      "questions": [
        {
          "text": "string question referencing the story",
          "choices": ["4 short string options"],
          "correctAnswer": "must exactly match one choice",
          "skillTag": "e.g. addition-2digit",
          "visualAssets": ["apple"]
        }
      ]
    }
  ]
}`;

  const userPrompt = `Source curriculum text (may be long, focus on the core math concept
and difficulty level being taught):\n\n${text.slice(0, 6000)}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;
  const parsed = JSON.parse(raw);

  if (!parsed.stories || parsed.stories.length !== 3) {
    throw new Error("AI response did not contain exactly 3 stories");
  }
  parsed.stories.forEach((s) => {
    if (!s.questions || s.questions.length !== 5) {
      throw new Error("AI response story did not contain exactly 5 questions");
    }
    s.questions.forEach((q) => {
      if (!q.choices || q.choices.length !== 4) {
        throw new Error("AI response question did not contain exactly 4 choices");
      }
    });
  });

  parsed.stories.forEach((s, i) => {
    s.orderIndex = i;
    s.questions.forEach((q, qi) => (q.orderIndex = qi));
  });

  return parsed;
}

/**
 * Main entry point: generates { topic, stories: [...] } from extracted PDF text.
 * Falls back to the offline generator on any AI/config error so the request
 * never hard-fails.
 */
async function generateStories(text) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateStoriesWithOpenAI(text);
    } catch (err) {
      console.warn("[ai.service] OpenAI generation failed, falling back to offline generator:", err.message);
    }
  }
  return generateStoriesFallback(text);
}

module.exports = { generateStories, detectTopic };
