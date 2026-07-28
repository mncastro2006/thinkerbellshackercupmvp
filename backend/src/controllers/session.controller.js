const { Session, Module, Story, Question, Attempt } = require("../models");
const { generateCode } = require("../utils/code.util");
const asyncHandler = require("../utils/asyncHandler");
const { Op } = require("sequelize");
const {
  loadModuleStories,
  finalizeStoryAttempt,
  maybeCompleteSession,
} = require("../services/sessionPace.service");

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
    cursorStoryIndex: 0,
    cursorQuestionIndex: 0,
    cursorStage: "story",
    pendingAnswers: [],
    lastAnswerFeedback: null,
  });

  res.status(201).json({ session });
});

// POST /api/sessions/join   { code, studentName }  (public)
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
  if (session.cursorStage == null) session.cursorStage = "story";
  await session.save();

  const module_ = session.module.toJSON();
  module_.stories = module_.stories
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(({ parentGuide, ...s }) => ({
      ...s,
      questions: s.questions
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(({ correctAnswer, ...q }) => q),
    }));

  res.json({
    session: {
      id: session.id,
      code: session.code,
      studentName: session.studentName,
      cursorStoryIndex: session.cursorStoryIndex,
      cursorQuestionIndex: session.cursorQuestionIndex,
      cursorStage: session.cursorStage,
    },
    module: module_,
  });
});

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

// GET /api/sessions/:id/live  (parent)
const getLiveSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    where: { id: req.params.id, parentId: req.user.id },
    include: [
      {
        model: Module,
        as: "module",
        include: [{ model: Story, as: "stories", include: [{ model: Question, as: "questions" }] }],
      },
      { model: Attempt, as: "attempts" },
    ],
  });
  if (!session) return res.status(404).json({ message: "Session not found" });

  const module_ = session.module.toJSON();
  module_.stories = module_.stories
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((s) => ({
      ...s,
      questions: (s.questions || []).sort((a, b) => a.orderIndex - b.orderIndex),
    }));

  res.json({
    session: {
      id: session.id,
      code: session.code,
      status: session.status,
      studentName: session.studentName,
      attempts: session.attempts,
      cursorStoryIndex: session.cursorStoryIndex,
      cursorQuestionIndex: session.cursorQuestionIndex,
      cursorStage: session.cursorStage,
      lastAnswerFeedback: session.lastAnswerFeedback,
      pendingAnswers: session.pendingAnswers,
    },
    module: module_,
    currentStoryIndex: session.cursorStoryIndex || 0,
  });
});

// GET /api/sessions/:id/state  (student poll — public by session id from join)
const getSessionState = asyncHandler(async (req, res) => {
  const session = await Session.findByPk(req.params.id);
  if (!session) return res.status(404).json({ message: "Session not found" });

  res.json({
    status: session.status,
    cursorStoryIndex: session.cursorStoryIndex,
    cursorQuestionIndex: session.cursorQuestionIndex,
    cursorStage: session.cursorStage,
    lastAnswerFeedback: session.lastAnswerFeedback
      ? {
          questionId: session.lastAnswerFeedback.questionId,
          givenAnswer: session.lastAnswerFeedback.givenAnswer,
          // Student gets soft feedback only after they answered (isCorrect ok for UX)
          isCorrect: session.lastAnswerFeedback.isCorrect,
        }
      : null,
  });
});

// POST /api/sessions/:id/advance  (parent)
const advanceSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    where: { id: req.params.id, parentId: req.user.id },
  });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.status === "waiting") {
    return res.status(400).json({ message: "Wait for the student to connect first" });
  }
  if (session.status === "completed" || session.cursorStage === "done") {
    return res.json({ session, completed: true });
  }

  const module_ = await loadModuleStories(session.moduleId);
  const stories = module_.stories;
  let storyIdx = session.cursorStoryIndex || 0;
  let qIdx = session.cursorQuestionIndex || 0;
  let stage = session.cursorStage || "story";

  if (stage === "story") {
    stage = "question";
    qIdx = 0;
    session.lastAnswerFeedback = null;
  } else if (stage === "question") {
    const story = stories[storyIdx];
    const answered = (session.pendingAnswers || []).some(
      (a) => a.storyId === story.id && a.questionId === story.questions[qIdx]?.id
    );
    if (!answered) {
      return res.status(400).json({
        message: "Wait for the learner to choose an answer before continuing.",
        session: {
          id: session.id,
          cursorStoryIndex: storyIdx,
          cursorQuestionIndex: qIdx,
          cursorStage: stage,
          lastAnswerFeedback: session.lastAnswerFeedback,
        },
      });
    }

    if (qIdx + 1 < story.questions.length) {
      qIdx += 1;
      session.lastAnswerFeedback = null;
    } else {
      await finalizeStoryAttempt(session, story);
      if (storyIdx + 1 < stories.length) {
        storyIdx += 1;
        qIdx = 0;
        stage = "story";
        session.lastAnswerFeedback = null;
      } else {
        await maybeCompleteSession(session, stories);
        stage = "done";
      }
    }
  }

  session.cursorStoryIndex = storyIdx;
  session.cursorQuestionIndex = qIdx;
  session.cursorStage = stage;
  await session.save();

  const completed = session.status === "completed" || stage === "done";
  res.json({
    session: {
      id: session.id,
      status: session.status,
      cursorStoryIndex: session.cursorStoryIndex,
      cursorQuestionIndex: session.cursorQuestionIndex,
      cursorStage: session.cursorStage,
      lastAnswerFeedback: session.lastAnswerFeedback,
    },
    completed,
  });
});

// POST /api/sessions/:id/back  (parent)
const backSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    where: { id: req.params.id, parentId: req.user.id },
  });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.status !== "active") {
    return res.status(400).json({ message: "Session is not active" });
  }

  const module_ = await loadModuleStories(session.moduleId);
  const stories = module_.stories;
  let storyIdx = session.cursorStoryIndex || 0;
  let qIdx = session.cursorQuestionIndex || 0;
  let stage = session.cursorStage || "story";

  if (stage === "question" && qIdx > 0) {
    qIdx -= 1;
    // Remove pending answer for the question we're leaving so they can re-answer
    const story = stories[storyIdx];
    const leavingQ = story.questions[qIdx + 1];
    if (leavingQ) {
      session.pendingAnswers = (session.pendingAnswers || []).filter(
        (a) => !(a.storyId === story.id && a.questionId === leavingQ.id)
      );
    }
    session.lastAnswerFeedback = null;
  } else if (stage === "question" && qIdx === 0) {
    stage = "story";
    session.lastAnswerFeedback = null;
  } else if (stage === "story" && storyIdx > 0) {
    // Go to last question of previous story (already finalized — view only)
    storyIdx -= 1;
    const prev = stories[storyIdx];
    stage = "question";
    qIdx = Math.max((prev.questions?.length || 1) - 1, 0);
    session.lastAnswerFeedback = null;
  }

  session.cursorStoryIndex = storyIdx;
  session.cursorQuestionIndex = qIdx;
  session.cursorStage = stage;
  await session.save();

  res.json({
    session: {
      id: session.id,
      status: session.status,
      cursorStoryIndex: session.cursorStoryIndex,
      cursorQuestionIndex: session.cursorQuestionIndex,
      cursorStage: session.cursorStage,
      lastAnswerFeedback: session.lastAnswerFeedback,
    },
  });
});

const listSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.findAll({
    where: { parentId: req.user.id },
    include: [{ model: Module, as: "module" }],
    order: [["createdAt", "DESC"]],
  });
  res.json({ sessions });
});

module.exports = {
  createSession,
  joinSession,
  getSession,
  getLiveSession,
  getSessionState,
  advanceSession,
  backSession,
  listSessions,
};
