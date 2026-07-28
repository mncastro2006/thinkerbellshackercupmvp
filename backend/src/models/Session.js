const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A Kahoot-style connection session: parent generates a join code,
// student enters the code on their screen to connect to the module.
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
  },
  { tableName: "sessions", timestamps: true }
);

module.exports = Session;
