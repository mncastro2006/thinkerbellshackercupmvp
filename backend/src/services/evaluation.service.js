/**
 * Builds the parent-facing feedback report after a student completes all
 * 3 stories.
 *
 * The report follows a qualitative, strategy-focused rubric rather than a
 * plain score card:
 *   1. Break the module down into its core competencies (skillTags) and
 *      show mastery per competency.
 *   2. Analyze incorrect answers for qualitative error patterns (off-by-one,
 *      transposition, operation swap, etc.) instead of just counting misses.
 *   3. Infer the child's current cognitive strategy where possible
 *      (e.g. Count-All vs Count-On for addition).
 *   4. Never frame anything around time, speed, or urgency.
 *   5. Suggest concrete multi-sensory (visual/kinesthetic/tactile/auditory)
 *      home practice activities tied to the specific gap found.
 *
 * `buildReportWithAI` (evaluation via an LLM, see services/providers) does
 * the actual qualitative reasoning and produces the richer narrative;
 * `buildReport` is the deterministic, template-based fallback used when no
 * AI provider is configured/available, so a report is always produced.
 */
const { MODULES } = require("../content/modules.config");
const { runWithFallback } = require("./providers");

function levelFromScore(pct) {
  if (pct >= 90) return "excellent";
  if (pct >= 75) return "proficient";
  if (pct >= 50) return "average";
  if (pct >= 30) return "developing";
  return "needs_improvement";
}

function masteryLevelFromAccuracy(pct) {
  if (pct >= 75) return "Mastered";
  if (pct >= 50) return "Developing";
  return "Needs Support";
}

// Covers every skillTag produced by both the hardcoded packs
// (modules.config.js) and the AI/offline generators (ai.service.js), so
// modules without a packKey (AI-generated) still get readable labels.
const DEFAULT_SKILL_LABELS = {
  "addition-1digit": "Single-Digit Addition",
  "addition-2digit": "2-Digit Addition",
  "addition-3digit": "3-Digit Addition",
  "subtraction-1digit": "Single-Digit Subtraction",
  "subtraction-2digit": "2-Digit Subtraction",
  "subtraction-3digit": "3-Digit Subtraction",
  "multiplication-1digit": "Single-Digit Multiplication",
  "multiplication-2digit": "2-Digit Multiplication",
  "multiplication-3digit": "3-Digit Multiplication",
  "division-1digit": "Single-Digit Division",
  "division-2digit": "1- and 2-Digit Division",
  "division-3digit": "Division with Larger Numbers",
  "rounding-nearest-wholenumber": "Rounding to the Nearest Whole Number",
  "rounding-nearest-ten": "Rounding to the Nearest Ten",
  "rounding-nearest-hundred": "Rounding to the Nearest Hundred",
};

function skillLabel(tag, packFeedback) {
  if (packFeedback?.skillLabels?.[tag]) return packFeedback.skillLabels[tag];
  return DEFAULT_SKILL_LABELS[tag] || tag.replace(/-/g, " ");
}

/**
 * Deterministic, purely numeric classification of a wrong answer - used to
 * ground both the AI prompt and the offline fallback in real evidence
 * rather than guesswork.
 */
function classifyNumericError(givenAnswer, correctAnswer) {
  const given = Number(givenAnswer);
  const correct = Number(correctAnswer);
  if (Number.isNaN(given) || Number.isNaN(correct)) return "other";

  const diff = given - correct;
  if (Math.abs(diff) === 1) return "off-by-one";

  // Transposition: same digits, different order (e.g. 41 vs 14), only
  // meaningful for 2+ digit numbers.
  const givenDigits = String(Math.abs(given)).split("").sort().join("");
  const correctDigits = String(Math.abs(correct)).split("").sort().join("");
  if (given !== correct && givenDigits === correctDigits && givenDigits.length > 1) {
    return "transposition";
  }

  if (Math.abs(diff) === 10 || Math.abs(diff) === 100) return "place-value-slip";

  return "other-numeric";
}

const ERROR_PATTERN_LABELS = {
  "off-by-one": "off-by-one errors",
  transposition: "digit transposition (e.g. writing 14 instead of 41)",
  "place-value-slip": "place-value slips (off by a whole ten or hundred)",
  "other-numeric": "inconsistent numeric errors",
  other: "unclassified errors",
};

/**
 * Groups incorrect answers by error type and returns the dominant pattern
 * (most frequent), or null if the child had no incorrect answers to analyze.
 */
function analyzeErrorPatterns(detailedRecords) {
  const wrong = detailedRecords.filter((r) => !r.isCorrect);
  if (!wrong.length) return null;

  const counts = {};
  for (const r of wrong) {
    const type = classifyNumericError(r.givenAnswer, r.correctAnswer);
    counts[type] = (counts[type] || 0) + 1;
  }
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return { dominant, label: ERROR_PATTERN_LABELS[dominant], counts, sampleSize: wrong.length };
}

/** Turns "addition-2digit" into { operation: "addition", digitLevel: 2 }. */
function parseSkillTag(tag) {
  const m = /^([a-z]+)(?:-nearest)?-(\d)?digit|^([a-z]+)-nearest-(\w+)/.exec(tag || "");
  if (!m) return { operation: (tag || "").split("-")[0] || "general", digitLevel: 1 };
  if (m[3]) return { operation: m[3], digitLevel: 1 }; // rounding-nearest-*
  return { operation: m[1], digitLevel: Number(m[2]) || 1 };
}

// Coarse, rule-based cognitive-strategy inference used only by the offline
// fallback (the AI path reasons over the real question/answer text instead,
// which is far more reliable). Maps operation -> the strategy a child is
// likely using today, and the next strategy to grow toward.
const STRATEGY_PROGRESSIONS = {
  addition: {
    current: '"Count-All" Strategy: likely counting every item in both groups from 1, rather than starting from the first number and counting on.',
    next: 'Our next goal is helping your learner move from "Count-All" to "Count-On" - keeping the first number in mind and counting forward from there instead of recounting everything from scratch.',
  },
  subtraction: {
    current: '"Count-Back" from the total, one at a time, which becomes error-prone once the amount being removed grows past a few items.',
    next: 'Our next goal is building comfort with "removal in chunks" - taking away a ten or a five at once instead of one-by-one - so subtraction feels less like tedious counting.',
  },
  multiplication: {
    current: '"Repeated Addition": adding the same group over and over rather than seeing the groups as a single multiplication fact.',
    next: "Our next goal is connecting repeated addition to skip-counting (e.g. 5, 10, 15) so multiplication starts to feel faster and more automatic without relying on speed drills.",
  },
  division: {
    current: '"One-by-One Dealing": physically or mentally handing out items one at a time into groups, which gets overwhelming with larger totals.',
    next: 'Our next goal is helping your learner see division as "multiplication in reverse" - using known multiplication facts or skip-counting to find how many groups fit, instead of dealing out items one by one.',
  },
  rounding: {
    current: "reading each digit in isolation rather than picturing where the number sits between two nearby round numbers.",
    next: "Our next goal is building a mental (or physical) number line so your learner can see which round number a value is actually closer to, instead of memorizing a digit rule.",
  },
};

function inferCognitiveStrategy(dominantOperation) {
  return STRATEGY_PROGRESSIONS[dominantOperation] || STRATEGY_PROGRESSIONS.addition;
}

// Multi-sensory home practice bank (Visual / Kinesthetic / Tactile / Auditory),
// grouped by operation. Used by the offline fallback; the AI path generates
// activities tailored to the specific story context instead, but falls back
// to this bank if the model call fails validation.
const ACTIVITY_BANK = {
  addition: [
    { modality: "Visual", title: "Subitizing with Dice and Dot Cards", description: "Play a quick game with a single die or a set of dominoes. Practice naming the number of dots instantly without counting each dot one by one, to build number sense before combining groups." },
    { modality: "Kinesthetic", title: "Physical \"Count-On\" Taps", description: "When solving a problem like 6 + 3, have your learner tap their forehead and say \"6\" out loud, then tap 3 fingers on the table while counting \"7, 8, 9.\"" },
    { modality: "Tactile", title: "Cup-and-Counter Grouping", description: "Cover a group of counters (buttons, cereal) with a small cup and write the group's total on it. Place the second group next to the cup. Have your learner point to the cup, say its number, then touch the remaining counters to count on." },
  ],
  subtraction: [
    { modality: "Visual", title: "Number Line Hops", description: "Draw a simple number line on paper. Have your learner place a finger on the starting number and hop backward one space per count, landing on the answer." },
    { modality: "Kinesthetic", title: "Step-Back Counting", description: "Line up chairs or floor tiles as a number path. Have your learner physically step backward the amount being subtracted, calling out each number as they step." },
    { modality: "Tactile", title: "Take-Away Jar", description: "Fill a jar with a known number of small objects. Have your learner remove a handful at once (not one-by-one) and count what's left, reinforcing that subtraction can happen in chunks." },
  ],
  multiplication: [
    { modality: "Visual", title: "Array Grids", description: "Draw a grid of rows and columns (e.g. 3 rows of 4 dots). Have your learner count by rows to see the total, connecting the visual array to the multiplication fact." },
    { modality: "Kinesthetic", title: "Skip-Counting Jumps", description: "Lay out number cards on the floor. Have your learner jump only on the multiples (e.g. 5, 10, 15) while saying them aloud." },
    { modality: "Tactile", title: "Equal-Groups Sorting", description: "Give your learner a pile of small objects and ask them to build several equal-sized groups, then count the groups to find the total, reinforcing multiplication as equal groups rather than one big count." },
  ],
  division: [
    { modality: "Visual", title: "Muffin Tin or Grid Arrays", description: "Use a muffin tin or a drawn grid. Give your learner a set number of small snacks and ask them to place an equal amount into each cup until they run out, then count the filled cups." },
    { modality: "Kinesthetic", title: "Block Tower Splitting", description: "Build a tower of interlocking blocks. Ask your learner to snap off smaller towers of a fixed size and count how many smaller towers they made." },
    { modality: "Tactile", title: "\"Leftovers\" Remainder Box", description: "Give your learner a set of small objects and ask them to make equal groups of a given size. Have them place any leftover objects in a small \"Remainder Box\" instead of forcing them into a group - this frames remainders as a normal part of the answer." },
  ],
  rounding: [
    { modality: "Visual", title: "Number Line Rounding", description: "Draw a number line with the two nearest round numbers marked at each end. Mark the actual value in between and ask your learner which end it's closer to." },
    { modality: "Kinesthetic", title: "Walk-the-Line Rounding", description: "Tape a number line on the floor with the two round numbers at either end. Have your learner physically stand on the value being rounded, then decide which end to \"walk toward.\"" },
    { modality: "Tactile", title: "Ruler Measuring Check", description: "Using a real ruler, measure a small object together and ask your learner to place a finger on the measurement, then on each nearby round number, to feel which one is physically closer." },
  ],
};

function activitiesForOperation(operation) {
  return ACTIVITY_BANK[operation] || ACTIVITY_BANK.addition;
}

/**
 * Deterministic competency breakdown - always computed from real answer
 * data (never left to an LLM to guess), used by both the offline fallback
 * and as ground-truth context fed into the AI prompt.
 */
function buildCompetencyBreakdown(answerRecords, packFeedback) {
  const bySkill = {};
  for (const a of answerRecords) {
    const tag = a.skillTag || "general";
    bySkill[tag] = bySkill[tag] || { correct: 0, total: 0 };
    bySkill[tag].total += 1;
    if (a.isCorrect) bySkill[tag].correct += 1;
  }
  return Object.entries(bySkill).map(([tag, s]) => {
    const accuracy = Math.round((s.correct / s.total) * 100);
    return {
      tag,
      label: skillLabel(tag, packFeedback),
      accuracy,
      correct: s.correct,
      total: s.total,
      masteryLevel: masteryLevelFromAccuracy(accuracy),
    };
  });
}

/**
 * Deterministic, template-based report - used when no AI provider is
 * configured or every provider fails. Matches the same JSON shape as the
 * AI-generated report so the frontend never needs to know which path ran.
 *
 * @param {Array<{skillTag: string, isCorrect: boolean, givenAnswer?: string, correctAnswer?: string}>} answerRecords
 * @param {string} studentName
 * @param {string|null} packKey MATH3_Mod1 | MATH3_Mod2
 */
function buildReport(answerRecords, studentName = "The learner", packKey = null) {
  const packFeedback = packKey && MODULES[packKey] ? MODULES[packKey].feedback : null;
  const total = answerRecords.length;
  const correct = answerRecords.filter((a) => a.isCorrect).length;
  const overallScore = total ? Math.round((correct / total) * 100) : 0;
  const performanceLevel = levelFromScore(overallScore);

  const competencyBreakdown = buildCompetencyBreakdown(answerRecords, packFeedback);

  const strengths = competencyBreakdown
    .filter((s) => s.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((s) => `Strong performance in ${s.label} (${s.correct}/${s.total} correct) — this skill is Mastered.`);
  if (strengths.length === 0) {
    strengths.push(
      `${studentName} is building foundational understanding across every competency — celebrate the persistence, not just the score.`
    );
  }

  // Weakest competency drives the qualitative insight + activities, since
  // that's the most useful thing for a parent to act on right now.
  const weakest = competencyBreakdown.slice().sort((a, b) => a.accuracy - b.accuracy)[0];
  const errorPattern = analyzeErrorPatterns(answerRecords);
  const { operation } = parseSkillTag(weakest?.tag);
  const strategy = inferCognitiveStrategy(operation);

  const keyInsight = weakest
    ? {
        currentStrategy: `Current Method: ${strategy.current}`,
        errorPattern: errorPattern
          ? `Error Pattern: Most incorrect answers in ${weakest.label} were ${errorPattern.label}. This suggests ${studentName} understands the underlying concept, but the specific process breaks down somewhere in execution.`
          : `${studentName} answered consistently in ${weakest.label} - no dominant error pattern was found in this session.`,
      }
    : null;

  const nextMilestone = weakest ? strategy.next : `Continue reinforcing ${packFeedback?.summaryFocus || "current concepts"} with new story contexts to build confidence.`;

  const multiSensoryActivities = activitiesForOperation(operation);

  const summary =
    `${studentName} completed the module with ${correct}/${total} questions correct overall` +
    (packFeedback?.summaryFocus ? ` on ${packFeedback.summaryFocus}` : "") +
    `. ` +
    (weakest && weakest.accuracy < 75
      ? `The clearest next opportunity is ${weakest.label}, where the pattern above points to a specific, fixable strategy gap rather than a lack of understanding.`
      : `${studentName} is showing solid, consistent understanding across every competency assessed in this module.`);

  return {
    overallScore,
    performanceLevel,
    competencyBreakdown,
    strengths,
    keyInsight,
    nextMilestone,
    multiSensoryActivities,
    summary,
    generatedBy: "offline-fallback",
  };
}

/**
 * @param {Array<{skillTag: string, isCorrect: boolean, givenAnswer: string, correctAnswer: string, questionText?: string}>} detailedRecords
 * @param {string} studentName
 * @param {{ packKey: string|null, topic?: string }} moduleInfo
 */
async function buildReportWithAI(detailedRecords, studentName, moduleInfo = {}) {
  const packFeedback = moduleInfo.packKey && MODULES[moduleInfo.packKey] ? MODULES[moduleInfo.packKey].feedback : null;
  const competencyBreakdown = buildCompetencyBreakdown(detailedRecords, packFeedback);
  const total = detailedRecords.length;
  const correct = detailedRecords.filter((a) => a.isCorrect).length;
  const overallScore = total ? Math.round((correct / total) * 100) : 0;
  const performanceLevel = levelFromScore(overallScore);

  const wrongAnswers = detailedRecords
    .filter((a) => !a.isCorrect)
    .map((a) => ({
      skill: skillLabel(a.skillTag, packFeedback),
      question: a.questionText || null,
      givenAnswer: a.givenAnswer,
      correctAnswer: a.correctAnswer,
    }));

  const systemPrompt = `You are a learning specialist writing a home-practice report for the PARENT of a
neurodivergent child, after the child completed a set of math story-questions. Your job is to turn raw
answer data into an insightful, actionable, and encouraging report. Follow these rules strictly:

1. Break the module down into its core competencies using the exact competency labels provided in the
   input data (do not invent new competency names) and reference their accuracy.
2. Analyze the child's INCORRECT answers for qualitative error patterns - e.g. off-by-one, digit
   transposition, place-value slips, operation swap - using the actual given/correct answer pairs
   provided, not guesses. Explain what the pattern suggests about the child's understanding.
3. Identify the child's likely CURRENT cognitive strategy for the weakest competency (e.g. "Count-All"
   vs "Count-On" for addition, "one-by-one dealing" vs "multiplication in reverse" for division), and
   describe the NEXT strategy milestone to grow toward.
4. Do NOT mention time, speed, urgency, or how long anything took. Frame everything around
   understanding and strategy, never pace.
5. Suggest exactly 3 multi-sensory home practice activities (one Visual, one Kinesthetic, one Tactile
   or Auditory), each concrete, 5-10 minutes, doable with household items, and directly tied to the
   weakest competency and error pattern found.
6. Tone: warm, specific, and strengths-first. Always name at least one genuine strength before any gap.
7. Never fabricate data - only reference competencies, accuracy numbers, and answer pairs given to you.

Respond with ONLY valid JSON (no markdown fences) matching this shape:
{
  "strengths": ["1-2 short bullet strings naming specific wins, referencing real competency labels/accuracy"],
  "keyInsight": {
    "currentStrategy": "1-2 sentences describing the child's current method, starting with a short label like 'Current Method: ...'",
    "errorPattern": "1-2 sentences describing the dominant error pattern found in the wrong answers and what it suggests, starting with a short label like 'Error Pattern: ...'"
  },
  "nextMilestone": "1-2 sentences naming the next strategy the child should grow toward and why",
  "multiSensoryActivities": [
    { "modality": "Visual", "title": "short activity name", "description": "1-3 sentences, concrete and doable at home" },
    { "modality": "Kinesthetic", "title": "short activity name", "description": "..." },
    { "modality": "Tactile", "title": "short activity name", "description": "..." }
  ],
  "summary": "2-3 sentence overall narrative summary for the parent, strengths-first, ending on the next growth opportunity"
}`;

  const userPrompt = `Student name: ${studentName}
Module topic: ${moduleInfo.topic || "unspecified"}

Competency breakdown (computed from real answers, use these exact labels):
${JSON.stringify(competencyBreakdown, null, 2)}

Incorrect answers this session (question text, what the child answered, and the correct answer):
${JSON.stringify(wrongAnswers, null, 2)}
${wrongAnswers.length === 0 ? "\n(The child answered every question correctly this session.)" : ""}`;

  function parseAndValidateFeedback(raw) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.strengths) || !parsed.strengths.length) {
      throw new Error("AI feedback response missing strengths");
    }
    if (!parsed.nextMilestone || typeof parsed.nextMilestone !== "string") {
      throw new Error("AI feedback response missing nextMilestone");
    }
    if (!Array.isArray(parsed.multiSensoryActivities) || parsed.multiSensoryActivities.length < 2) {
      throw new Error("AI feedback response missing multiSensoryActivities");
    }
    if (!parsed.summary || typeof parsed.summary !== "string") {
      throw new Error("AI feedback response missing summary");
    }
    // keyInsight is optional (e.g. a perfect-score session may have nothing to analyze)
    return parsed;
  }

  const { result, providerName } = await runWithFallback(
    { systemPrompt, userPrompt, temperature: 0.6 },
    parseAndValidateFeedback
  );

  return {
    overallScore,
    performanceLevel,
    competencyBreakdown,
    strengths: result.strengths,
    keyInsight: result.keyInsight || null,
    nextMilestone: result.nextMilestone,
    multiSensoryActivities: result.multiSensoryActivities,
    summary: result.summary,
    generatedBy: providerName,
  };
}

/**
 * Main entry point: builds the qualitative report via AI when a provider is
 * configured and succeeds, otherwise falls back to the deterministic
 * template report so a report is always produced.
 *
 * @param {Array} detailedRecords per-answer records (skillTag, isCorrect, givenAnswer, correctAnswer, questionText)
 * @param {string} studentName
 * @param {{ packKey: string|null, topic?: string }} moduleInfo
 */
async function generateReport(detailedRecords, studentName, moduleInfo = {}) {
  try {
    return await buildReportWithAI(detailedRecords, studentName, moduleInfo);
  } catch (err) {
    console.warn("[evaluation.service] AI feedback unavailable, falling back to template report:", err.message);
  }
  return buildReport(detailedRecords, studentName, moduleInfo.packKey || null);
}

module.exports = { buildReport, buildReportWithAI, generateReport, skillLabel };
