const { Module, Story, Question, sequelize } = require("../models");
const { resolvePack } = require("../content/modules.config");
const { loadPredeterminedModule, listSupportedFilenames } = require("../services/content.service");
const { extractTextFromPdf } = require("../services/pdf.service");
const { generateStoriesWithAI, generateStoriesFallback } = require("../services/ai.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Turns an uploaded PDF into { packKey, topic, title, stories, feedback }.
 * Generation order:
 *   1. Real AI generation from the extracted PDF text (tries every
 *      configured provider - see services/providers - before giving up).
 *   2. If AI is unavailable/fails AND the filename matches one of the
 *      demo packs (MATH3_Mod1/Mod2), fall back to that hand-authored pack
 *      so the guided demo experience still works without any AI key.
 *   3. Otherwise, fall back to the fully offline template generator so an
 *      arbitrary PDF upload never hard-fails even without AI configured.
 */
async function buildModulePack(file, title) {
  const extractedText = await extractTextFromPdf(file.path);

  try {
    const aiResult = await generateStoriesWithAI(extractedText);
    return {
      packKey: null,
      topic: aiResult.topic,
      title: title || aiResult.topic,
      stories: aiResult.stories,
      feedback: null,
      extractedText,
      source: "ai",
    };
  } catch (err) {
    console.warn("[module.controller] AI generation unavailable, checking fallbacks:", err.message);
  }

  const matchedPack = resolvePack(file.originalname, title);
  if (matchedPack) {
    const pack = await loadPredeterminedModule(file.originalname, title);
    return {
      packKey: pack.packKey,
      topic: pack.topic,
      title: pack.title,
      stories: pack.stories,
      feedback: pack.feedback,
      extractedText,
      source: "hardcoded-pack",
    };
  }

  const offline = generateStoriesFallback(extractedText);
  return {
    packKey: null,
    topic: offline.topic,
    title: title || offline.topic,
    stories: offline.stories,
    feedback: null,
    extractedText,
    source: "offline-fallback",
  };
}

// POST /api/modules/upload  (multipart/form-data, field name: "file")
const uploadModule = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "PDF file is required (field 'file')" });

  let pack;
  try {
    pack = await buildModulePack(req.file, req.body.title || "");
  } catch (err) {
    return res.status(400).json({
      message: "Could not process this PDF. Please try a different file.",
      supported: listSupportedFilenames(),
    });
  }

  const module_ = await Module.create({
    title: req.body.title || pack.title || req.file.originalname.replace(/\.pdf$/i, ""),
    sourceFileName: req.file.originalname,
    parentId: req.user.id,
    packKey: pack.packKey,
    topic: pack.topic,
    extractedText: pack.extractedText,
    status: "processing",
  });

  try {
    const t = await sequelize.transaction();
    try {
      for (const s of pack.stories) {
        const story = await Story.create(
          {
            moduleId: module_.id,
            orderIndex: s.orderIndex,
            title: s.title,
            content: s.content,
            theme: s.theme,
            visualAssets: s.visualAssets || [],
            beats: s.beats || [],
            scene: s.scene || {},
            parentGuide: s.parentGuide || "",
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
              answerScene: q.answerScene || [],
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
  const module_ = await Module.findOne({
    where: { id: req.params.id, parentId: req.user.id },
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
