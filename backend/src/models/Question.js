const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Question = sequelize.define(
  "Question",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    text: { type: DataTypes.STRING, allowNull: false },
    choices: { type: DataTypes.JSON, allowNull: false }, // ["5","6","11","1"]
    correctAnswer: { type: DataTypes.STRING, allowNull: false },
    skillTag: { type: DataTypes.STRING }, // e.g. "addition-2digit"
    visualAssets: { type: DataTypes.JSON, defaultValue: [] },
  },
  { tableName: "questions", timestamps: true }
);

module.exports = Question;
