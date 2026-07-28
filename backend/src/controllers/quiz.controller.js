const { Session, Story, Question, Attempt, Answer, Module } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { loadModuleStories } = require("../services/sessionPace.service");

// POST /api/quiz/answer
// body: { sessionId, storyId, questionId, givenAnswer }
// Student taps one choice; does not advance — parent owns Next.
const submitAnswer = asyncHandler(async (req, res) => {
  const { sessionId, storyId, questionId, givenAnswer } = req.body;
  if (!sessionId || !storyId || !questionId || givenAnswer == null) {
    return res.status(400).json({ message: "sessionId, storyId, questionId and givenAnswer are required" });
  }

  const session = await Session.findByPk(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.status !== "active") {
    return res.status(400).json({ message: "Session is not active" });
  }

  if (session.cursorStage !== "question") {
    return res.status(400).json({ message: "It is not time to answer yet. Wait for your parent." });
  }

  const story = await Story.findOne({
    where: { id: storyId },
    include: [{ model: Question, as: "questions" }],
  });
  if (!story) return res.status(404).json({ message: "Story not found" });

  const question = story.questions.find((q) => q.id === questionId);
  if (!question) return res.status(404).json({ message: "Question not found" });

  // Ensure this matches the parent's current cursor
  const module_ = await loadModuleStories(session.moduleId);
  const currentStory = module_.stories[session.cursorStoryIndex];
  const currentQ = currentStory?.questions?.[session.cursorQuestionIndex];
  if (!currentStory || currentStory.id !== storyId || !currentQ || currentQ.id !== questionId) {
    return res.status(400).json({ message: "This is not the current question. Wait for your parent." });
  }

  const isCorrect = String(givenAnswer).trim() === String(question.correctAnswer).trim();
  const entry = {
    storyId: story.id,
    questionId: question.id,
    givenAnswer: String(givenAnswer),
    isCorrect,
  };

  const pending = [...(session.pendingAnswers || [])].filter(
    (a) => !(a.storyId === story.id && a.questionId === question.id)
  );
  pending.push(entry);
  session.pendingAnswers = pending;
  session.lastAnswerFeedback = entry;
  await session.save();

  res.status(201).json({
    isCorrect,
    givenAnswer: entry.givenAnswer,
    questionId: question.id,
  });
});

// Legacy full-story submit (kept for compatibility)
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

  const module_ = await Module.findByPk(story.moduleId, { include: [{ model: Story, as: "stories" }] });
  const completedAttempts = await Attempt.findAll({ where: { sessionId: session.id } });
  const distinctStoryIds = new Set(completedAttempts.map((a) => a.storyId));
  const isModuleComplete = module_.stories.every((s) => distinctStoryIds.has(s.id));

  if (isModuleComplete) {
    session.status = "completed";
    session.cursorStage = "done";
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

const getProgress = asyncHandler(async (req, res) => {
  const attempts = await Attempt.findAll({ where: { sessionId: req.params.sessionId } });
  res.json({ attempts });
});

module.exports = { submitAttempt, submitAnswer, getProgress };
