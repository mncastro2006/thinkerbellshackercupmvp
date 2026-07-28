const router = require("express").Router();
const { getSessionReport, getHistory, getPublicSummary } = require("../controllers/report.controller");
const { requireAuth } = require("../middleware/auth");

// Public - the student device reads its own results right after finishing
router.get("/session/:sessionId/summary", getPublicSummary);

router.get("/history", requireAuth, getHistory);
router.get("/session/:sessionId", requireAuth, getSessionReport);

module.exports = router;
