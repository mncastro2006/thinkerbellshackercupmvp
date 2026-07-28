const { Session, Module, Attempt, Answer, Question, Report } = require("../models");
const { buildReport } = require("../services/evaluation.service");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/reports/session/:sessionId  (parent, authenticated)
// Generates the report on first call, then returns the cached version.
const getSessionReport = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    where: { id: req.params.sessionId, parentId: req.user.id },
    include: [{ model: Module, as: "module" }, { model: Report, as: "report" }],
  });
  if (!session) return res.status(404).json({ message: "Session not found" });

  if (session.report) {
    return res.json({ report: session.report, session });
  }

  if (session.status !== "completed") {
    return res.status(400).json({ message: "The learner has not finished all 3 stories yet" });
  }

  const attempts = await Attempt.findAll({
    where: { sessionId: session.id },
    include: [{ model: Answer, as: "answers", include: [{ model: Question, as: "question" }] }],
  });

  const answerRecords = attempts.flatMap((att) =>
    att.answers.map((ans) => ({
      isCorrect: ans.isCorrect,
      skillTag: ans.question?.skillTag || "general",
    }))
  );

  const built = buildReport(answerRecords, session.studentName || "The learner");

  const report = await Report.create({
    sessionId: session.id,
    overallScore: built.overallScore,
    performanceLevel: built.performanceLevel,
    strengths: built.strengths,
    weaknesses: built.weaknesses,
    recommendations: built.recommendations,
    summary: built.summary,
  });

  res.json({ report, session, skillStats: built.skillStats });
});

// GET /api/reports/session/:sessionId/summary  (public - the student device that just
// finished the session needs to see its own results, e.g. "Module 1, 5/10, Average")
const getPublicSummary = asyncHandler(async (req, res) => {
  const session = await Session.findByPk(req.params.sessionId, {
    include: [{ model: Module, as: "module" }, { model: Report, as: "report" }],
  });
  if (!session) return res.status(404).json({ message: "Session not found" });

  let report = session.report;

  if (!report) {
    if (session.status !== "completed") {
      return res.status(400).json({ message: "The session is not finished yet" });
    }

    const attempts = await Attempt.findAll({
      where: { sessionId: session.id },
      include: [{ model: Answer, as: "answers", include: [{ model: Question, as: "question" }] }],
    });

    const answerRecords = attempts.flatMap((att) =>
      att.answers.map((ans) => ({
        isCorrect: ans.isCorrect,
        skillTag: ans.question?.skillTag || "general",
      }))
    );

    const built = buildReport(answerRecords, session.studentName || "You");

    report = await Report.create({
      sessionId: session.id,
      overallScore: built.overallScore,
      performanceLevel: built.performanceLevel,
      strengths: built.strengths,
      weaknesses: built.weaknesses,
      recommendations: built.recommendations,
      summary: built.summary,
    });
  }

  const totalQuestions = (await Attempt.findAll({ where: { sessionId: session.id } })).reduce(
    (sum, a) => sum + a.totalQuestions,
    0
  );
  const correct = Math.round((report.overallScore / 100) * totalQuestions);

  res.json({
    moduleTitle: session.module?.title,
    score: correct,
    totalQuestions,
    overallScore: report.overallScore,
    performanceLevel: report.performanceLevel,
    summary: report.summary,
  });
});

// GET /api/reports/history  (parent) - all past sessions + scores for the profile page
const getHistory = asyncHandler(async (req, res) => {
  const sessions = await Session.findAll({
    where: { parentId: req.user.id, status: "completed" },
    include: [{ model: Module, as: "module" }, { model: Report, as: "report" }],
    order: [["createdAt", "DESC"]],
  });
  res.json({ history: sessions });
});

module.exports = { getSessionReport, getHistory, getPublicSummary };
