const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Answer = sequelize.define(
  "Answer",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    givenAnswer: { type: DataTypes.STRING, allowNull: false },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  { tableName: "answers", timestamps: true }
);

module.exports = Answer;
