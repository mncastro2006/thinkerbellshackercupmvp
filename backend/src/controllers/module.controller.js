const { Module, Story, Question, sequelize } = require("../models");
const { extractTextFromPdf } = require("../services/pdf.service");
const { generateStories } = require("../services/ai.service");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/modules/upload  (multipart/form-data, field name: "file")
const uploadModule = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "PDF file is required (field 'file')" });

  const module_ = await Module.create({
    title: req.body.title || req.file.originalname.replace(/\.pdf$/i, ""),
    sourceFileName: req.file.originalname,
    parentId: req.user.id,
    status: "processing",
  });

  try {
    const text = await extractTextFromPdf(req.file.path);
    module_.extractedText = text;

    const { topic, stories } = await generateStories(text);
    module_.topic = topic;

    const t = await sequelize.transaction();
    try {
      for (const s of stories) {
        const story = await Story.create(
          {
            moduleId: module_.id,
            orderIndex: s.orderIndex,
            title: s.title,
            content: s.content,
            theme: s.theme,
            visualAssets: s.visualAssets || [],
          },
          { transaction: t }
        );

        for (const q of s.questions) {
          await Question.create(
            {
              storyId: story.id,
              orderIndex: q.orderIndex,
              text: q.text,
              choices: q.choices,
              correctAnswer: String(q.correctAnswer),
              skillTag: q.skillTag,
              visualAssets: q.visualAssets || [],
            },
            { transaction: t }
          );
        }
      }
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }

    module_.status = "ready";
    await module_.save();

    const full = await Module.findByPk(module_.id, {
      include: [{ model: Story, as: "stories", include: [{ model: Question, as: "questions" }] }],
    });

    res.status(201).json({ module: full });
  } catch (err) {
    module_.status = "failed";
    await module_.save();
    throw err;
  }
});

const getModule = asyncHandler(async (req, res) => {
  const module_ = await Module.findByPk(req.params.id, {
    include: [{ model: Story, as: "stories", include: [{ model: Question, as: "questions" }] }],
  });
  if (!module_) return res.status(404).json({ message: "Module not found" });
  res.json({ module: module_ });
});

const listModules = asyncHandler(async (req, res) => {
  const modules = await Module.findAll({
    where: { parentId: req.user.id },
    order: [["createdAt", "DESC"]],
  });
  res.json({ modules });
});

module.exports = { uploadModule, getModule, listModules };
