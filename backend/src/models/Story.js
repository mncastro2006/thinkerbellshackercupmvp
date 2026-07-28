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
    theme: { type: DataTypes.STRING }, // e.g. "market", "money", "sharing"
  },
  { tableName: "stories", timestamps: true }
);

module.exports = Story;
