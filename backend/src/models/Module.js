const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A Module represents one uploaded PDF (a curriculum unit) and the 3
// AI-generated stories derived from it.
const Module = sequelize.define(
  "Module",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    sourceFileName: { type: DataTypes.STRING },
    extractedText: { type: DataTypes.TEXT("long") },
    topic: { type: DataTypes.STRING }, // e.g. "Addition of 2-digit numbers"
    status: {
      type: DataTypes.ENUM("processing", "ready", "failed"),
      defaultValue: "processing",
    },
  },
  { tableName: "modules", timestamps: true }
);

module.exports = Module;
