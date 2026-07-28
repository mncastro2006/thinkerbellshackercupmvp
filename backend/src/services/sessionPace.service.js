const { Module, Story, Question, Attempt, Answer } = require("../models");

async function loadModuleStories(moduleId) {
  const module_ = await Module.findByPk(moduleId, {
    include: [{ model: Story, as: "stories", include: [{ model: Question, as: "questions" }] }],
  });
  if (!module_) return null;
  const json = module_.toJSON();
  json.stories = (json.stories || [])
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((s) => ({
      ...s,
      questions: (s.questions || []).sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  return json;
}

async function finalizeStoryAttempt(session, story) {
  const pending = (session.pendingAnswers || []).filter((a) => a.storyId === story.id);
  if (!pending.length) return null;

  const existing = await Attempt.findOne({ where: { sessionId: session.id, storyId: story.id } });
  if (existing) return existing;

  const attempt = await Attempt.create({
    sessionId: session.id,
    storyId: story.id,
    totalQuestions: story.questions.length,
    completedAt: new Date(),
  });

  let correctCount = 0;
  const rows = pending.map((a) => {
    if (a.isCorrect) correctCount += 1;
    return {
      attemptId: attempt.id,
      questionId: a.questionId,
      givenAnswer: String(a.givenAnswer),
      isCorrect: !!a.isCorrect,
    };
  });
  await Answer.bulkCreate(rows);
  attempt.score = correctCount;
  await attempt.save();

  session.pendingAnswers = (session.pendingAnswers || []).filter((a) => a.storyId !== story.id);
  await session.save();
  return attempt;
}

async function maybeCompleteSession(session, stories) {
  const attempts = await Attempt.findAll({ where: { sessionId: session.id } });
  const done = new Set(attempts.map((a) => a.storyId));
  if (stories.every((s) => done.has(s.id))) {
    session.status = "completed";
    session.cursorStage = "done";
    await session.save();
    return true;
  }
  return false;
}

module.exports = { loadModuleStories, finalizeStoryAttempt, maybeCompleteSession };
