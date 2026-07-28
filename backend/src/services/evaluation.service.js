/**
 * evaluation.service.js
 *
 * Builds the parent-facing feedback report after a student completes all
 * 3 stories in a session: overall score, per-skill strengths/weaknesses,
 * a performance level, and concrete recommendations.
 */

function levelFromScore(pct) {
  if (pct >= 90) return "excellent";
  if (pct >= 75) return "proficient";
  if (pct >= 50) return "average";
  if (pct >= 30) return "developing";
  return "needs_improvement";
}

const SKILL_LABELS = {
  "addition-1digit": "addition of single-digit numbers",
  "addition-2digit": "addition of 2-digit numbers",
  "addition-3digit": "addition of 3-digit numbers",
  "subtraction-1digit": "subtraction of single-digit numbers",
  "subtraction-2digit": "subtraction of 2-digit numbers",
  "subtraction-3digit": "subtraction of 3-digit numbers",
  "multiplication-1digit": "multiplication of single-digit numbers",
  "multiplication-2digit": "multiplication of 2-digit numbers",
  "division-1digit": "division with single-digit numbers",
  "division-2digit": "division with 2-digit numbers",
  "rounding-nearest-wholenumber": "rounding decimals to the nearest whole number",
  "rounding-nearest-ten": "rounding numbers to the nearest ten",
  "rounding-nearest-hundred": "rounding numbers to the nearest hundred",
};

function skillLabel(tag) {
  return SKILL_LABELS[tag] || tag.replace(/-/g, " ");
}

/**
 * @param {Array<{skillTag: string, isCorrect: boolean}>} answerRecords flattened
 *        answers across all 3 stories of the session
 */
function buildReport(answerRecords, studentName = "The learner") {
  const total = answerRecords.length;
  const correct = answerRecords.filter((a) => a.isCorrect).length;
  const overallScore = total ? Math.round((correct / total) * 100) : 0;
  const performanceLevel = levelFromScore(overallScore);

  // group by skill tag
  const bySkill = {};
  for (const a of answerRecords) {
    const tag = a.skillTag || "general";
    bySkill[tag] = bySkill[tag] || { correct: 0, total: 0 };
    bySkill[tag].total += 1;
    if (a.isCorrect) bySkill[tag].correct += 1;
  }

  const skillStats = Object.entries(bySkill).map(([tag, s]) => ({
    tag,
    label: skillLabel(tag),
    accuracy: Math.round((s.correct / s.total) * 100),
    correct: s.correct,
    total: s.total,
  }));

  const strengths = skillStats
    .filter((s) => s.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((s) => `Strong performance in ${s.label} (${s.correct}/${s.total} correct).`);

  const weaknesses = skillStats
    .filter((s) => s.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((s) => `${studentName} needs improvement in ${s.label} (${s.correct}/${s.total} correct).`);

  const recommendations = skillStats
    .filter((s) => s.accuracy < 60)
    .map((s) => {
      const tips = {
        addition: "Practice with physical objects (buttons, fruit, counters) to build number-sense before moving to written sums. Try 5-10 minutes of visual counting daily.",
        subtraction: "Use a number line or take-away visuals (e.g. removing items from a basket) to reinforce the concept before symbolic subtraction.",
        multiplication: "Introduce repeated addition and equal groups (e.g. bags of the same number of fruits) before formal multiplication facts.",
        division: "Practice equal sharing with real objects (splitting snacks evenly among friends) to build intuition before formal division.",
        rounding: "Use a ruler or number line to show the two nearest 'friendly' numbers and let your child point to which one the value is physically closer to, before relying on the digit rule alone.",
      };
      const op = s.tag.split("-")[0];
      return `For ${s.label}: ${tips[op] || "Provide extra guided practice with visual, hands-on examples."}`;
    });

  if (weaknesses.length === 0) {
    weaknesses.push(`No significant weak areas detected — ${studentName} is performing consistently across topics.`);
  }
  if (recommendations.length === 0) {
    recommendations.push(`Continue reinforcing current concepts with new story contexts to build confidence and generalize the skill.`);
  }
  if (strengths.length === 0) {
    strengths.push(`${studentName} is building foundational understanding — celebrate small wins to keep motivation high.`);
  }

  const summary = `${studentName} scored ${overallScore}% overall (${correct}/${total} questions correct) across the 3 stories, ` +
    `placing performance in the "${performanceLevel.replace("_", " ")}" range. ` +
    (weaknesses.length && skillStats.some((s) => s.accuracy < 60)
      ? `The main area to focus on next is ${skillStats.sort((a, b) => a.accuracy - b.accuracy)[0].label}.`
      : `${studentName} is showing solid understanding across the assessed skills.`);

  return {
    overallScore,
    performanceLevel,
    strengths,
    weaknesses,
    recommendations,
    summary,
    skillStats,
  };
}

module.exports = { buildReport, skillLabel };
