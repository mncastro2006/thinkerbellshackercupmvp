const router = require("express").Router();
const {
  createSession,
  joinSession,
  getSession,
  listSessions,
} = require("../controllers/session.controller");
const { requireAuth } = require("../middleware/auth");

// Parent-only
router.post("/", requireAuth, createSession);
router.get("/", requireAuth, listSessions);
router.get("/:id", requireAuth, getSession);

// Student device - no login required, just the join code
router.post("/join", joinSession);

module.exports = router;
