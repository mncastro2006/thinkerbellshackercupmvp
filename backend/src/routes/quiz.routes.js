const router = require("express").Router();
const { submitAttempt, submitAnswer, getProgress } = require("../controllers/quiz.controller");

// Public - student device
router.post("/answer", submitAnswer);
router.post("/submit", submitAttempt);
router.get("/session/:sessionId/progress", getProgress);

module.exports = router;
