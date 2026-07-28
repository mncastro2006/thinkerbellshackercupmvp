const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A student's playthrough of one Story within a Session.
const Attempt = sequelize.define(
  "Attempt",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    score: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalQuestions: { type: DataTypes.INTEGER, defaultValue: 0 },
    completedAt: { type: DataTypes.DATE },
  },
  { tableName: "attempts", timestamps: true }
);

module.exports = Attempt;
