const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Feedback report for the parent, generated after a Session is completed
// (i.e. after the student has gone through all 3 stories).
const Report = sequelize.define(
  "Report",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    overallScore: { type: DataTypes.FLOAT, defaultValue: 0 }, // percentage
    performanceLevel: {
      type: DataTypes.ENUM("needs_improvement", "developing", "average", "proficient", "excellent"),
      defaultValue: "developing",
    },
    strengths: { type: DataTypes.JSON, defaultValue: [] },
    weaknesses: { type: DataTypes.JSON, defaultValue: [] },
    recommendations: { type: DataTypes.JSON, defaultValue: [] },
    summary: { type: DataTypes.TEXT },
  },
  { tableName: "reports", timestamps: true }
);

module.exports = Report;
