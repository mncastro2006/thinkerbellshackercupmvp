/**
 * ai.service.js
 *
 * Turns the raw text extracted from a parent's uploaded PDF module into
 * 3 short, easy-to-visualize stories, each with 5 multiple-choice
 * questions, suitable for a neurodivergent learner.
 *
 * If at least one AI provider is configured (OPENAI_API_KEY and/or
 * GEMINI_API_KEY), a real LLM call is made - providers are tried in the
 * order given by AI_PROVIDER_ORDER (default "openai,gemini"), so a rate
 * limit or outage on one provider automatically falls through to the next.
 * If every provider is unconfigured or fails, this falls back to a
 * deterministic, template-based generator so the whole product still works
 * out of the box with zero external dependencies.
 *
 * Each story also carries:
 *  - beats: a short "storybuilding" sequence read/narrated before any
 *    questions are asked (see PRD roadmap item: pre-assessment storybuilding).
 *  - scene: a composable background + cast of characters reused across the
 *    story's intro and all of its questions (objects vary per question).
 *  - parentGuide: a plain-language, parent-only explanation of how to teach
 *    the underlying concept - never sent to the student device.
 * Each question also carries:
 *  - answerScene: per-choice scene placement (marker + position) so answer
 *    options render as spots inside the story frame instead of plain quiz
 *    buttons underneath it.
 */

const { runWithFallback } = require("./providers");

// People are handled separately from objects so we never end up with
// nonsensical sentences like "Lea bought 5 girls".
const CHARACTER_POOL = ["girl", "boy", "friend", "mom", "dad", "teacher"];

const OBJECT_POOL = [
  "apple", "orange", "banana", "basket", "coin", "wallet",
  "candy", "balloon", "book", "pencil", "star", "cookie", "cupcake",
  "backpack", "notebook", "flower", "toy_car", "fish", "ruler", "seed",
];

// Decorative markers used only to visually distinguish the 4 answer "spots"
// placed inside the scene - unrelated to the objects actually being counted,
// so students don't confuse "how many apples are shown" with "which spot".
const ANSWER_MARKERS = ["basket", "flag", "balloon", "leaf"];
const ANSWER_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"];

// One themed "world" per story: a background + which objects make sense in it.
const THEME_LIBRARY = {
  market: {
    background: "market",
    label: "Trip to the Market",
    objects: ["apple", "orange", "banana", "basket", "cookie", "cupcake"],
  },
  money: {
    background: "home",
    label: "Saving Up Coins",
    objects: ["coin", "wallet", "balloon", "book", "candy", "backpack"],
  },
  sharing: {
    background: "park",
    label: "Sharing Day",
    objects: ["candy", "cookie", "balloon", "star", "flower", "fish"],
  },
  measuring: {
    background: "classroom",
    label: "Measuring Adventure",
    objects: ["pencil", "book", "ruler", "toy_car", "notebook"],
  },
  garden: {
    background: "garden",
    label: "Garden Helpers",
    objects: ["flower", "seed", "basket", "fish", "star"],
  },
};

// Which themes make sense for which operation, in priority order. Rounding
// always leads with "measuring" (ruler context), matching the product's
// worked example.
const THEMES_BY_OPERATION = {
  addition: ["market", "sharing", "garden"],
  subtraction: ["sharing", "market", "garden"],
  multiplication: ["market", "garden", "sharing"],
  division: ["sharing", "garden", "market"],
  rounding: ["measuring", "market", "garden"],
};

const NAME_POOL = ["Lea", "Anna", "Ben", "Mika", "Sam", "Jaya", "Leo", "Nina"];

const ROUND_PLACE_BY_DIGIT_LEVEL = {
  1: { label: "whole number", tag: "wholenumber", step: 1 },
  2: { label: "ten", tag: "ten", step: 10 },
  3: { label: "hundred", tag: "hundred", step: 100 },
};

/** Guess the arithmetic focus + difficulty of the module from its text. */
function detectTopic(text) {
  const t = (text || "").toLowerCase();

  let operation = "addition";
  if (/(round(ing)?\s*(up|down|off|to the nearest)?|nearest (ten|hundred|whole number))/.test(t)) {
    operation = "rounding";
  } else if (/(subtract|minus|difference|take away)/.test(t)) {
    operation = "subtraction";
  } else if (/(multipl|times|product of)/.test(t)) {
    operation = "multiplication";
  } else if (/(divide|division|share equally|quotient)/.test(t)) {
    operation = "division";
  }

  let digitLevel = 1; // single digit 1-9 / nearest whole number
  if (/(2[\s-]?digit|tens and ones|nearest ten\b|ten[s]?\b)/.test(t)) digitLevel = 2;
  if (/(3[\s-]?digit|hundreds|nearest hundred)/.test(t)) digitLevel = 3;

  const opLabel = {
    addition: "Addition",
    subtraction: "Subtraction",
    multiplication: "Multiplication",
    division: "Division",
    rounding: "Rounding",
  }[operation];

  const topic =
    operation === "rounding"
      ? `Rounding to the nearest ${ROUND_PLACE_BY_DIGIT_LEVEL[digitLevel].label}`
      : `${opLabel} of ${digitLevel}-digit numbers`;

  return { operation, digitLevel, topic };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function rangeForDigitLevel(level) {
  if (level >= 3) return [100, 500];
  if (level === 2) return [10, 50];
  return [1, 9];
}

function buildChoices(correct, step = 1) {
  const choices = new Set([String(correct)]);
  let guard = 0;
  while (choices.size < 4 && guard < 40) {
    guard += 1;
    const delta = (randInt(-5, 5) || 1) * step;
    const distractor = Math.max(0, correct + delta);
    choices.add(String(distractor));
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

// --- Storybuilding: short narrative beats read/shown before questions -----

const BEATS_BY_THEME = {
  market: [
    ["It was a bright Saturday morning, and {name} walked to the local market with an empty basket.",
      "{name} loved market days - the stalls were full of colors, smells, and friendly sellers."],
    ["Today, {name} was on a mission to gather enough treats for a family picnic.",
      "{name}'s goal was to fill the basket with enough goodies to share with everyone at home."],
    ["As {name} wandered past the first stall, something caught their eye..."],
  ],
  money: [
    ["{name} had been saving coins in a little wallet for weeks.",
      "Every day, {name} tucked a few coins away, dreaming of a small gift to buy."],
    ["Today was finally the day to see how much {name} had saved up."],
    ["{name} opened the wallet and started counting..."],
  ],
  sharing: [
    ["It was recess, and {name} brought a bag of goodies to share with friends.",
      "{name} always looked forward to sharing time with the whole group."],
    ["Everyone gathered around, excited to see what {name} had brought today."],
    ["{name} started handing things out, one by one..."],
  ],
  measuring: [
    ["In class, {name} was handed a ruler and asked to measure some objects for a project.",
      "{name} liked measuring day - it felt like being a tiny scientist."],
    ["The teacher explained that some measurements needed to be rounded to make them easier to work with."],
    ["{name} picked up the ruler and got to work..."],
  ],
  garden: [
    ["{name} spent the afternoon helping out in the family garden.",
      "The garden was full of things to count, water, and plant."],
    ["There were seeds to plant and flowers to check before the sun went down."],
    ["{name} grabbed a small watering can and began..."],
  ],
};

function buildBeats(theme, name) {
  const bank = BEATS_BY_THEME[theme] || BEATS_BY_THEME.market;
  return bank.map((variants) => pick(variants).replace(/\{name\}/g, name));
}

// --- Question phrasing: several templates per operation so stories don't --
// --- all read as the same rigid "person A has N, person B has N" pattern --

const ADDITION_TEMPLATES = [
  "While at the {locationNoun}, {name} picked out {a} {itemA}{aPlural}. A little later, {name} found {b} more {itemB}{bPlural}. How many {itemA}{aPlural} and {itemB}{bPlural} does {name} have now?",
  "{name} counted {a} {itemA}{aPlural} in one hand and {b} {itemB}{bPlural} in the other. If {name} puts them all together, how many items are there in total?",
  "First {name} collected {a} {itemA}{aPlural}, then added {b} more {itemB}{bPlural} to the pile. What's the total number of items {name} has now?",
];

const SUBTRACTION_TEMPLATES = [
  "{name} started with {hi} {itemA}{hiPlural} but gave {lo} away to a friend. How many {itemA}{hiPlural} does {name} have left?",
  "Out of {hi} {itemA}{hiPlural}, {lo} were used up during the day. How many {itemA}{hiPlural} remain?",
  "{name} had {hi} {itemA}{hiPlural} in the basket. After sharing {lo} of them, how many are still in the basket?",
];

const MULTIPLICATION_TEMPLATES = [
  "{name} arranged {a} rows with {b} {itemA}{bPlural} in each row. How many {itemA}{bPlural} are there altogether?",
  "Each of the {a} bags {name} packed holds {b} {itemA}{bPlural}. How many {itemA}{bPlural} did {name} pack in total?",
];

const DIVISION_TEMPLATES = [
  "{name} wants to split {dividend} {itemA}{itemAPlural} evenly among {divisor} baskets. How many {itemA}{itemAPlural} go in each basket?",
  "There are {dividend} {itemA}{itemAPlural} to share equally between {divisor} friends. How many does each friend get?",
];

const ROUNDING_TEMPLATES = [
  "While measuring with a ruler, {name} found that a {itemA} was {value} centimeters long. What is {value} rounded to the nearest {placeLabel}?",
  "{name} measured a {itemA} and wrote down {value} centimeters. Rounded to the nearest {placeLabel}, what length should {name} record?",
];

const IRREGULAR_PLURALS = new Set(["fish"]);

function plural(n, word) {
  if (n === 1) return "";
  if (IRREGULAR_PLURALS.has(word)) return "";
  return "s";
}

function buildQuestion({ operation, digitLevel, theme, name, items }) {
  const [min, max] = rangeForDigitLevel(digitLevel);
  const [itemA, itemB] = items;

  if (operation === "rounding") {
    const place = ROUND_PLACE_BY_DIGIT_LEVEL[digitLevel] || ROUND_PLACE_BY_DIGIT_LEVEL[1];
    let value, correctAnswer;
    if (place.tag === "wholenumber") {
      const whole = randInt(1, 9);
      const decimal = randInt(1, 9);
      value = Number(`${whole}.${decimal}`);
      correctAnswer = decimal >= 5 ? whole + 1 : whole;
    } else if (place.tag === "ten") {
      const tens = randInt(1, 9) * 10;
      const ones = randInt(1, 9);
      value = tens + ones;
      correctAnswer = ones >= 5 ? tens + 10 : tens;
    } else {
      const hundreds = randInt(1, 9) * 100;
      const rest = randInt(1, 99);
      value = hundreds + rest;
      correctAnswer = rest >= 50 ? hundreds + 100 : hundreds;
    }

    const text = pick(ROUNDING_TEMPLATES)
      .replace(/\{name\}/g, name)
      .replace(/\{itemA\}/g, itemA)
      .replace(/\{value\}/g, String(value))
      .replace(/\{placeLabel\}/g, place.label);

    return {
      text,
      choices: buildChoices(correctAnswer, place.step),
      correctAnswer: String(correctAnswer),
      skillTag: `rounding-nearest-${place.tag}`,
      visualAssets: [itemA],
    };
  }

  if (operation === "division") {
    const divisor = randInt(2, Math.max(2, Math.min(9, max)));
    const quotient = randInt(2, 9);
    const dividend = divisor * quotient;
    const text = pick(DIVISION_TEMPLATES)
      .replace(/\{name\}/g, name)
      .replace(/\{itemA\}/g, itemA)
      .replace(/\{itemAPlural\}/g, plural(dividend, itemA))
      .replace(/\{dividend\}/g, String(dividend))
      .replace(/\{divisor\}/g, String(divisor));
    return {
      text,
      choices: buildChoices(quotient),
      correctAnswer: String(quotient),
      skillTag: `division-${digitLevel}digit`,
      visualAssets: [itemA],
    };
  }

  if (operation === "multiplication") {
    const a = randInt(2, Math.min(9, Math.max(2, max)));
    const b = randInt(min, max);
    const result = a * b;
    const text = pick(MULTIPLICATION_TEMPLATES)
      .replace(/\{name\}/g, name)
      .replace(/\{itemA\}/g, itemA)
      .replace(/\{bPlural\}/g, plural(b, itemA))
      .replace(/\{a\}/g, String(a))
      .replace(/\{b\}/g, String(b));
    return {
      text,
      choices: buildChoices(result),
      correctAnswer: String(result),
      skillTag: `multiplication-${digitLevel}digit`,
      visualAssets: [itemA],
    };
  }

  if (operation === "subtraction") {
    const a = randInt(min, max);
    const b = randInt(min, max);
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    const result = hi - lo;
    const text = pick(SUBTRACTION_TEMPLATES)
      .replace(/\{name\}/g, name)
      .replace(/\{itemA\}/g, itemA)
      .replace(/\{hiPlural\}/g, plural(hi, itemA))
      .replace(/\{hi\}/g, String(hi))
      .replace(/\{lo\}/g, String(lo));
    return {
      text,
      choices: buildChoices(result),
      correctAnswer: String(result),
      skillTag: `subtraction-${digitLevel}digit`,
      visualAssets: [itemA],
    };
  }

  // addition (default)
  const a = randInt(min, max);
  const b = randInt(min, max);
  const result = a + b;
  const locationNoun = { market: "market stall", money: "shop", sharing: "party", garden: "garden", measuring: "workshop" }[theme] || "market stall";
  const text = pick(ADDITION_TEMPLATES)
    .replace(/\{name\}/g, name)
    .replace(/\{locationNoun\}/g, locationNoun)
    .replace(/\{itemA\}/g, itemA)
    .replace(/\{aPlural\}/g, plural(a, itemA))
    .replace(/\{itemB\}/g, itemB)
    .replace(/\{bPlural\}/g, plural(b, itemB))
    .replace(/\{a\}/g, String(a))
    .replace(/\{b\}/g, String(b));
  return {
    text,
    choices: buildChoices(result),
    correctAnswer: String(result),
    skillTag: `addition-${digitLevel}digit`,
    visualAssets: [itemA, itemB],
  };
}

// --- Parent teaching guide: plain-language, parent-only ---------------------

function buildParentGuide({ operation, digitLevel, theme, itemA, itemB, divisor }) {
  const place = ROUND_PLACE_BY_DIGIT_LEVEL[digitLevel] || ROUND_PLACE_BY_DIGIT_LEVEL[1];

  const guides = {
    addition:
      `Guide: Addition means combining two groups into one total. Using the ${itemA}s and ${itemB || itemA}s ` +
      `from the story, have your child count out each group separately (fingers, buttons, or drawings work well), ` +
      `then combine the groups and count everything together once. For 2-digit numbers, line up the tens and ones ` +
      `columns and add starting from the ones place, carrying over any extra ten.`,
    subtraction:
      `Guide: Subtraction means taking away from a group and counting what's left. Using the ${itemA}s from the story, ` +
      `have your child count out the starting amount, physically remove the amount that was given away or used up, ` +
      `and count what remains. For 2-digit numbers, if the ones digit being subtracted is bigger than the ones digit ` +
      `you start with, borrow one ten from the tens column first.`,
    multiplication:
      `Guide: Multiplication is repeated addition of equal-sized groups. Show your child the equal groups of ${itemA}s ` +
      `from the story, have them count one group at a time, then add the groups together (or skip-count) to find the ` +
      `total, instead of counting every item one by one.`,
    division:
      `Guide: Division means splitting a total into equal groups. Using the ${itemA}s from the story, have your child ` +
      `physically deal them out one at a time into ${divisor || "a few"} equal baskets or piles until none are left, ` +
      `then count how many ended up in each basket.`,
    rounding:
      `Guide: Rounding means choosing the closest "friendly" number. Look at the digit right after the place you're ` +
      `rounding to - if it's 5 or more, round UP to the next ${place.label}; if it's less than 5, round DOWN and keep ` +
      `the current ${place.label}. Try showing your child the ruler markings from the story between the two nearby ` +
      `${place.label}s so they can see with their own eyes which one the measurement is closer to.`,
  };

  return guides[operation] || guides.addition;
}

// --- Scene composition: background + cast + per-answer scene placement ----

function buildScene(theme) {
  const def = THEME_LIBRARY[theme] || THEME_LIBRARY.market;
  const mainCharacter = pick(["girl", "boy"]);
  let cast = [mainCharacter];
  if (theme === "sharing") cast = [mainCharacter, "friend"];
  if (theme === "measuring") cast = [mainCharacter, "teacher"];
  if (theme === "money" && Math.random() > 0.5) cast = [mainCharacter, pick(["mom", "dad"])];
  return { background: def.background, characters: cast };
}

function buildAnswerScene(choices) {
  return choices.map((choice, i) => ({
    label: choice,
    marker: ANSWER_MARKERS[i % ANSWER_MARKERS.length],
    position: ANSWER_POSITIONS[i % ANSWER_POSITIONS.length],
  }));
}

function pickThemeObjects(theme, count) {
  const def = THEME_LIBRARY[theme] || THEME_LIBRARY.market;
  const pool = [...def.objects];
  const picked = [];
  while (picked.length < count && pool.length) {
    const idx = randInt(0, pool.length - 1);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function buildStory({ theme, operation, digitLevel, orderIndex }) {
  const name = pick(NAME_POOL);
  const [itemA, itemB] = pickThemeObjects(theme, 2);
  const def = THEME_LIBRARY[theme] || THEME_LIBRARY.market;

  const beats = buildBeats(theme, name);

  const questions = [];
  for (let i = 0; i < 5; i++) {
    const built = buildQuestion({ operation, digitLevel, theme, name, items: [itemA, itemB || itemA] });
    questions.push({
      orderIndex: i,
      text: built.text,
      choices: built.choices,
      correctAnswer: built.correctAnswer,
      skillTag: built.skillTag,
      visualAssets: built.visualAssets,
      answerScene: buildAnswerScene(built.choices),
    });
  }

  const divisor = operation === "division" ? randInt(2, 9) : undefined;

  return {
    orderIndex,
    title: `${name}'s ${def.label}`,
    content: beats.join(" "),
    beats,
    theme,
    visualAssets: [itemA, itemB].filter(Boolean),
    scene: buildScene(theme),
    parentGuide: buildParentGuide({ operation, digitLevel, theme, itemA, itemB, divisor }),
    questions,
  };
}

/** Deterministic offline generator - no external API required. */
function generateStoriesFallback(text) {
  const { operation, digitLevel, topic } = detectTopic(text);
  const themes = THEMES_BY_OPERATION[operation] || THEMES_BY_OPERATION.addition;
  const stories = themes.map((theme, idx) =>
    buildStory({ theme, operation, digitLevel, orderIndex: idx })
  );
  return { topic, stories };
}

/**
 * Ensures every story/question has the composition fields the frontend and
 * parent-guide feature need, even if the AI response only returned the
 * older/minimal shape (text + choices). Never overwrites fields the AI did
 * provide.
 */
function backfillCompositionFields(parsed) {
  const { operation, digitLevel } = detectTopic(parsed.topic || "");
  parsed.stories.forEach((s) => {
    if (!s.beats || !s.beats.length) {
      s.beats = s.content ? [s.content] : buildBeats(s.theme || "market", "The learner");
    }
    if (!s.scene || !s.scene.background) {
      s.scene = buildScene(s.theme || "market");
    }
    if (!s.parentGuide) {
      const [itemA, itemB] = s.visualAssets || [];
      s.parentGuide = buildParentGuide({ operation, digitLevel, theme: s.theme, itemA, itemB });
    }
    s.questions.forEach((q) => {
      if (!q.answerScene || !q.answerScene.length) {
        q.answerScene = buildAnswerScene(q.choices);
      }
    });
  });
  return parsed;
}

/** Validates and normalizes a raw JSON story response from any provider. */
function parseAndValidateStories(raw) {
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

  return backfillCompositionFields(parsed);
}

/** LLM-backed generator, tried across every configured provider in order. */
async function generateStoriesWithAI(text) {
  const systemPrompt = `You are an assistant that adapts a math curriculum excerpt into
learning material for a neurodivergent child, for a PARENT-LED at-home session (the parent
reads/narrates and teaches; the child answers on a connected device). Produce EXACTLY 3
short stories, each with EXACTLY 5 multiple-choice questions (4 choices each). Keep story
complexity and question difficulty consistent with the source material - your job is to
simplify wording and context (not the difficulty).

Write stories like real child-friendly narratives, NOT a rigid "Person A has N objects,
Person B has N objects" pattern - vary sentence structure across questions. Each story
must include 2-4 short "beats" (a tiny storybuilding intro, read/narrated before any
questions) that set the scene before the math starts.

Each story needs a "scene": a background key and a list of 1-2 character keys (people),
chosen ONLY from:
  backgrounds: market, home, park, classroom, garden
  characters: girl, boy, friend, mom, dad, teacher
Objects used in visualAssets/answerScene must be chosen ONLY from:
  apple, orange, banana, basket, coin, wallet, candy, balloon, book, pencil, star, cookie,
  cupcake, backpack, notebook, flower, toy_car, fish, ruler, seed

Each story also needs a "parentGuide": 2-4 plain-language sentences telling the PARENT how
to teach the underlying concept in the moment (not just describing the story), referencing
the story's context where possible (e.g. "use the ruler from the story to show..."). This
guide is for the parent only and will never be shown to the child.

Each question needs an "answerScene": one entry per choice (in the same order as
"choices"), each with a "marker" chosen ONLY from: basket, flag, balloon, leaf, and a
"position" chosen ONLY from: top-left, top-right, bottom-left, bottom-right (use all 4,
one each) - these represent where each answer option is visually placed inside the story
scene, so answers feel like part of the story rather than generic quiz buttons.

Respond with ONLY valid JSON (no markdown fences) matching this shape:
{
  "topic": "string, e.g. Addition of 2-digit numbers",
  "stories": [
    {
      "title": "string",
      "beats": ["2-4 short narrative sentences setting up the story"],
      "content": "1-3 sentence story summary (fallback if beats aren't shown)",
      "theme": "market|money|sharing|measuring|garden",
      "scene": { "background": "market", "characters": ["girl"] },
      "parentGuide": "2-4 plain-language sentences for the parent",
      "visualAssets": ["apple","orange"],
      "questions": [
        {
          "text": "string question referencing the story, naturally phrased",
          "choices": ["4 short string options"],
          "correctAnswer": "must exactly match one choice",
          "skillTag": "e.g. addition-2digit",
          "visualAssets": ["apple"],
          "answerScene": [
            { "label": "5", "marker": "basket", "position": "top-left" },
            { "label": "6", "marker": "flag", "position": "top-right" },
            { "label": "11", "marker": "balloon", "position": "bottom-left" },
            { "label": "1", "marker": "leaf", "position": "bottom-right" }
          ]
        }
      ]
    }
  ]
}`;

  const userPrompt = `Source curriculum text (may be long, focus on the core math concept
and difficulty level being taught):\n\n${text.slice(0, 6000)}`;

  const { result, providerName } = await runWithFallback(
    { systemPrompt, userPrompt, temperature: 0.7 },
    parseAndValidateStories
  );
  console.log(`[ai.service] Stories generated via ${providerName}`);
  return result;
}

/**
 * Main entry point: generates { topic, stories: [...] } from extracted PDF text.
 * Falls back to the offline generator if every configured AI provider is
 * unconfigured or fails, so the request never hard-fails.
 */
async function generateStories(text) {
  try {
    return await generateStoriesWithAI(text);
  } catch (err) {
    console.warn("[ai.service] AI generation unavailable, falling back to offline generator:", err.message);
  }
  return generateStoriesFallback(text);
}

module.exports = { generateStories, generateStoriesWithAI, generateStoriesFallback, detectTopic };
