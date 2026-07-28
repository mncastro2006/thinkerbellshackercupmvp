const router = require("express").Router();
const {
  createSession,
  joinSession,
  getSession,
  getLiveSession,
  listSessions,
} = require("../controllers/session.controller");
const { requireAuth } = require("../middleware/auth");

// Parent-only
router.post("/", requireAuth, createSession);
router.get("/", requireAuth, listSessions);
router.get("/:id", requireAuth, getSession);
router.get("/:id/live", requireAuth, getLiveSession);

// Student device - no login required, just the join code
router.post("/join", joinSession);

module.exports = router;
