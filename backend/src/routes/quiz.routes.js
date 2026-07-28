const router = require("express").Router();
const { submitAttempt, getProgress } = require("../controllers/quiz.controller");

// Public - student device submits answers using the session it joined
router.post("/submit", submitAttempt);
router.get("/session/:sessionId/progress", getProgress);

module.exports = router;
