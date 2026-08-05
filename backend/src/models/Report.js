const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Feedback report for the parent, generated after a Session is completed
// (i.e. after the student has gone through all 3 stories).
//
// Shape follows a qualitative, strategy-focused rubric rather than a plain
// score card: break the module into competencies, describe HOW the child is
// currently solving problems and WHAT kind of mistakes they're making, then
// suggest concrete multi-sensory practice - never framed around speed/time.
// generatedBy records whether the narrative fields (keyInsight/nextMilestone/
// multiSensoryActivities/strengths/summary) came from an AI provider or the
// deterministic offline fallback, so the UI/logs can be transparent about it.
const Report = sequelize.define(
  "Report",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    overallScore: { type: DataTypes.FLOAT, defaultValue: 0 }, // percentage, quick-glance only
    performanceLevel: {
      type: DataTypes.ENUM("needs_improvement", "developing", "average", "proficient", "excellent"),
      defaultValue: "developing",
    },
    // [{ tag, label, accuracy, correct, total, masteryLevel }] - computed
    // deterministically from answer data, never left to the AI to guess.
    competencyBreakdown: { type: DataTypes.JSON, defaultValue: [] },
    // "Wins and Strengths" bullet list
    strengths: { type: DataTypes.JSON, defaultValue: [] },
    // { currentStrategy, errorPattern } - the qualitative heart of the report
    keyInsight: { type: DataTypes.JSON, defaultValue: null },
    // Plain-language paragraph describing the next skill to build toward
    nextMilestone: { type: DataTypes.TEXT },
    // [{ modality: "Visual"|"Kinesthetic"|"Tactile"|"Auditory", title, description }]
    multiSensoryActivities: { type: DataTypes.JSON, defaultValue: [] },
    summary: { type: DataTypes.TEXT },
    generatedBy: { type: DataTypes.STRING, defaultValue: "offline-fallback" }, // "openai" | "gemini" | "offline-fallback"
  },
  { tableName: "reports", timestamps: true }
);

module.exports = Report;
