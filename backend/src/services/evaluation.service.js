/**
 * Builds the parent-facing feedback report after a student completes all
 * 3 stories. Uses pack-specific copy from modules.config.js when packKey is set.
 */
const { MODULES } = require("../content/modules.config");

function levelFromScore(pct) {
  if (pct >= 90) return "excellent";
  if (pct >= 75) return "proficient";
  if (pct >= 50) return "average";
  if (pct >= 30) return "developing";
  return "needs_improvement";
}

const DEFAULT_SKILL_LABELS = {
  "addition-1digit": "addition of single-digit numbers",
  "addition-2digit": "addition of 2-digit numbers",
  "division-1digit": "division with single-digit numbers",
  "division-2digit": "division with 1- and 2-digit numbers",
};

function skillLabel(tag, packFeedback) {
  if (packFeedback?.skillLabels?.[tag]) return packFeedback.skillLabels[tag];
  return DEFAULT_SKILL_LABELS[tag] || tag.replace(/-/g, " ");
}

/**
 * @param {Array<{skillTag: string, isCorrect: boolean}>} answerRecords
 * @param {string} studentName
 * @param {string|null} packKey MATH3_Mod1 | MATH3_Mod2
 */
function buildReport(answerRecords, studentName = "The learner", packKey = null) {
  const packFeedback = packKey && MODULES[packKey] ? MODULES[packKey].feedback : null;
  const total = answerRecords.length;
  const correct = answerRecords.filter((a) => a.isCorrect).length;
  const overallScore = total ? Math.round((correct / total) * 100) : 0;
  const performanceLevel = levelFromScore(overallScore);

  const bySkill = {};
  for (const a of answerRecords) {
    const tag = a.skillTag || "general";
    bySkill[tag] = bySkill[tag] || { correct: 0, total: 0 };
    bySkill[tag].total += 1;
    if (a.isCorrect) bySkill[tag].correct += 1;
  }

  const skillStats = Object.entries(bySkill).map(([tag, s]) => ({
    tag,
    label: skillLabel(tag, packFeedback),
    accuracy: Math.round((s.correct / s.total) * 100),
    correct: s.correct,
    total: s.total,
  }));

  const strengthTpl = packFeedback?.strengthTemplate || "Strong performance in {label} ({correct}/{total} correct).";
  const weaknessTpl =
    packFeedback?.weaknessTemplate || "{name} needs improvement in {label} ({correct}/{total} correct).";

  const strengths = skillStats
    .filter((s) => s.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((s) =>
      strengthTpl
        .replace("{label}", s.label)
        .replace("{correct}", String(s.correct))
        .replace("{total}", String(s.total))
        .replace("{name}", studentName)
    );

  const weaknesses = skillStats
    .filter((s) => s.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((s) =>
      weaknessTpl
        .replace("{label}", s.label)
        .replace("{correct}", String(s.correct))
        .replace("{total}", String(s.total))
        .replace("{name}", studentName)
    );

  const recommendations = skillStats
    .filter((s) => s.accuracy < 60)
    .map((s) => {
      const tip =
        packFeedback?.recommendations?.[s.tag] ||
        "Provide extra guided practice with visual, hands-on examples related to this skill.";
      return `For ${s.label}: ${tip}`;
    });

  if (weaknesses.length === 0) {
    weaknesses.push(
      `No significant weak areas detected — ${studentName} is performing consistently across topics.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      `Continue reinforcing ${packFeedback?.summaryFocus || "current concepts"} with new story contexts to build confidence.`
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      `${studentName} is building foundational understanding — celebrate small wins to keep motivation high.`
    );
  }

  const focus =
    skillStats.some((s) => s.accuracy < 60)
      ? skillStats.slice().sort((a, b) => a.accuracy - b.accuracy)[0].label
      : null;

  const summary =
    `${studentName} scored ${overallScore}% overall (${correct}/${total} questions correct) across the 3 stories, ` +
    `placing performance in the "${performanceLevel.replace("_", " ")}" range` +
    (packFeedback?.summaryFocus ? ` for ${packFeedback.summaryFocus}` : "") +
    `. ` +
    (focus
      ? `The main area to focus on next is ${focus}.`
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
