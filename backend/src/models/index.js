const sequelize = require("../config/db");

const User = require("./User");
const Module = require("./Module");
const Story = require("./Story");
const Question = require("./Question");
const Session = require("./Session");
const Attempt = require("./Attempt");
const Answer = require("./Answer");
const Report = require("./Report");

// A parent owns modules (uploaded curriculum units)
User.hasMany(Module, { foreignKey: "parentId", as: "modules" });
Module.belongsTo(User, { foreignKey: "parentId", as: "parent" });

// A module produces 3 stories, each with 5 questions
Module.hasMany(Story, { foreignKey: "moduleId", as: "stories", onDelete: "CASCADE" });
Story.belongsTo(Module, { foreignKey: "moduleId" });

Story.hasMany(Question, { foreignKey: "storyId", as: "questions", onDelete: "CASCADE" });
Question.belongsTo(Story, { foreignKey: "storyId" });

// A session connects a parent's module to a student device via a join code
User.hasMany(Session, { foreignKey: "parentId", as: "sessions" });
Session.belongsTo(User, { foreignKey: "parentId", as: "parent" });

Module.hasMany(Session, { foreignKey: "moduleId", as: "sessions" });
Session.belongsTo(Module, { foreignKey: "moduleId", as: "module" });

// Each attempt belongs to a session + a story
Session.hasMany(Attempt, { foreignKey: "sessionId", as: "attempts", onDelete: "CASCADE" });
Attempt.belongsTo(Session, { foreignKey: "sessionId" });

Story.hasMany(Attempt, { foreignKey: "storyId", as: "attempts" });
Attempt.belongsTo(Story, { foreignKey: "storyId", as: "story" });

Attempt.hasMany(Answer, { foreignKey: "attemptId", as: "answers", onDelete: "CASCADE" });
Answer.belongsTo(Attempt, { foreignKey: "attemptId" });

Question.hasMany(Answer, { foreignKey: "questionId", as: "answers" });
Answer.belongsTo(Question, { foreignKey: "questionId", as: "question" });

// One consolidated report per session (after all 3 stories are completed)
Session.hasOne(Report, { foreignKey: "sessionId", as: "report", onDelete: "CASCADE" });
Report.belongsTo(Session, { foreignKey: "sessionId" });

async function initDb() {
  // Retry connecting since mysql container may still be starting up
  const maxRetries = 15;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("[db] Connected to MySQL");
      break;
    } catch (err) {
      console.log(`[db] MySQL not ready yet (attempt ${attempt}/${maxRetries})...`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await sequelize.sync({ alter: true });
  console.log("[db] Models synced");
}

module.exports = {
  sequelize,
  initDb,
  User,
  Module,
  Story,
  Question,
  Session,
  Attempt,
  Answer,
  Report,
};
