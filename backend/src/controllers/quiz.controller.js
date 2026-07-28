const { Session, Story, Question, Attempt, Answer, Module } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/quiz/submit
// body: { sessionId, storyId, answers: [{ questionId, givenAnswer }] }
// public route - called from the student device
const submitAttempt = asyncHandler(async (req, res) => {
  const { sessionId, storyId, answers } = req.body;
  if (!sessionId || !storyId || !Array.isArray(answers)) {
    return res.status(400).json({ message: "sessionId, storyId and answers[] are required" });
  }

  const session = await Session.findByPk(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });

  const story = await Story.findOne({
    where: { id: storyId },
    include: [{ model: Question, as: "questions" }],
  });
  if (!story) return res.status(404).json({ message: "Story not found" });

  const questionsById = Object.fromEntries(story.questions.map((q) => [q.id, q]));

  const attempt = await Attempt.create({
    sessionId: session.id,
    storyId: story.id,
    totalQuestions: story.questions.length,
    completedAt: new Date(),
  });

  let correctCount = 0;
  const answerRows = [];
  for (const a of answers) {
    const question = questionsById[a.questionId];
    if (!question) continue;
    const isCorrect = String(a.givenAnswer).trim() === String(question.correctAnswer).trim();
    if (isCorrect) correctCount += 1;
    answerRows.push({
      attemptId: attempt.id,
      questionId: question.id,
      givenAnswer: String(a.givenAnswer),
      isCorrect,
    });
  }
  await Answer.bulkCreate(answerRows);

  attempt.score = correctCount;
  await attempt.save();

  // has the student now completed all stories in this module?
  const module_ = await Module.findByPk(story.moduleId, { include: [{ model: Story, as: "stories" }] });
  const completedAttempts = await Attempt.findAll({ where: { sessionId: session.id } });
  const distinctStoryIds = new Set(completedAttempts.map((a) => a.storyId));
  const isModuleComplete = module_.stories.every((s) => distinctStoryIds.has(s.id));

  if (isModuleComplete) {
    session.status = "completed";
    await session.save();
  }

  res.status(201).json({
    attempt: {
      id: attempt.id,
      score: correctCount,
      totalQuestions: story.questions.length,
    },
    isModuleComplete,
  });
});

// GET /api/quiz/session/:sessionId/progress - which stories are done
const getProgress = asyncHandler(async (req, res) => {
  const attempts = await Attempt.findAll({ where: { sessionId: req.params.sessionId } });
  res.json({ attempts });
});

module.exports = { submitAttempt, getProgress };
