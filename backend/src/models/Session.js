const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A Kahoot-style connection session: parent generates a join code,
// student enters the code on their screen to connect to the module.
// Parent owns pacing via cursorStoryIndex / cursorQuestionIndex / cursorStage.
const Session = sequelize.define(
  "Session",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(12), allowNull: false, unique: true },
    studentName: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("waiting", "active", "completed", "expired"),
      defaultValue: "waiting",
    },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    cursorStoryIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
    cursorQuestionIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
    // story = show visuals only; question = answer choices; done = finished
    cursorStage: {
      type: DataTypes.ENUM("story", "question", "done"),
      defaultValue: "story",
    },
    // Accumulated answers for the current story before Attempt is finalized
    pendingAnswers: { type: DataTypes.JSON, defaultValue: [] },
    // Last student tap — shown on parent live view
    lastAnswerFeedback: { type: DataTypes.JSON, defaultValue: null },
  },
  { tableName: "sessions", timestamps: true }
);

module.exports = Session;
