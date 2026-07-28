const { Session, Module, Story, Question, Attempt } = require("../models");
const { generateCode } = require("../utils/code.util");
const asyncHandler = require("../utils/asyncHandler");
const { Op } = require("sequelize");

const CODE_LENGTH = Number(process.env.SESSION_CODE_LENGTH || 6);
const TTL_MINUTES = Number(process.env.SESSION_CODE_TTL_MINUTES || 60);

// POST /api/sessions   { moduleId }  (parent, authenticated)
const createSession = asyncHandler(async (req, res) => {
  const { moduleId } = req.body;
  const module_ = await Module.findOne({ where: { id: moduleId, parentId: req.user.id } });
  if (!module_) return res.status(404).json({ message: "Module not found" });
  if (module_.status !== "ready") {
    return res.status(400).json({ message: "Module is still processing, please wait" });
  }

  let code;
  for (let i = 0; i < 10; i++) {
    code = generateCode(CODE_LENGTH);
    const clash = await Session.findOne({ where: { code, status: { [Op.in]: ["waiting", "active"] } } });
    if (!clash) break;
  }

  const session = await Session.create({
    code,
    parentId: req.user.id,
    moduleId: module_.id,
    status: "waiting",
    expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
  });

  res.status(201).json({ session });
});

// POST /api/sessions/join   { code, studentName }  (public, no auth - student device)
const joinSession = asyncHandler(async (req, res) => {
  const { code, studentName } = req.body;
  if (!code) return res.status(400).json({ message: "code is required" });

  const session = await Session.findOne({
    where: { code: code.toUpperCase().trim() },
    include: [
      {
        model: Module,
        as: "module",
        include: [{ model: Story, as: "stories", include: [{ model: Question, as: "questions" }] }],
      },
    ],
  });

  if (!session) return res.status(404).json({ message: "Invalid code. Please check with your parent." });
  if (session.status === "expired" || session.expiresAt < new Date()) {
    return res.status(410).json({ message: "This code has expired. Ask your parent for a new one." });
  }

  session.status = "active";
  if (studentName) session.studentName = studentName;
  await session.save();

  // Strip correct answers before sending to the student device
  const module_ = session.module.toJSON();
  module_.stories = module_.stories
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((s) => ({
      ...s,
      questions: s.questions
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(({ correctAnswer, ...q }) => q),
    }));

  res.json({ session: { id: session.id, code: session.code, studentName: session.studentName }, module: module_ });
});

// GET /api/sessions/:id  (parent - poll for status/results)
const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    where: { id: req.params.id, parentId: req.user.id },
    include: [
      { model: Module, as: "module" },
      { model: Attempt, as: "attempts" },
    ],
  });
  if (!session) return res.status(404).json({ message: "Session not found" });
  res.json({ session });
});

const listSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.findAll({
    where: { parentId: req.user.id },
    include: [{ model: Module, as: "module" }],
    order: [["createdAt", "DESC"]],
  });
  res.json({ sessions });
});

module.exports = { createSession, joinSession, getSession, listSessions };
