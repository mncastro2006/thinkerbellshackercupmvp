const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// One of the 3 short stories generated per Module.
const Story = sequelize.define(
  "Story",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    // list of asset/emoji keys used to visualize the story, e.g. ["girl","apple","apple","orange"]
    visualAssets: { type: DataTypes.JSON, defaultValue: [] },
    theme: { type: DataTypes.STRING }, // e.g. "market", "money", "sharing", "measuring"
    // short narrative "storybuilding" beats shown/read before the questions start,
    // e.g. ["It was a sunny morning...", "Lea wanted to buy fruit for a picnic...", ...]
    beats: { type: DataTypes.JSON, defaultValue: [] },
    // composable scene: a fixed background + cast of characters reused across the
    // story's intro and all of its questions (objects vary per-question, see Question.visualAssets)
    scene: { type: DataTypes.JSON, defaultValue: {} }, // { background: "market", characters: ["girl","friend"] }
    // plain-language guide for the PARENT ONLY on how to teach the underlying concept.
    // Must never be sent to the student device (see session.controller.joinSession).
    parentGuide: { type: DataTypes.TEXT },
  },
  { tableName: "stories", timestamps: true }
);

module.exports = Story;
