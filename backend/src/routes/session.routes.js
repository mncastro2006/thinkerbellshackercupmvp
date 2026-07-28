const router = require("express").Router();
const {
  createSession,
  joinSession,
  getSession,
  getLiveSession,
  getSessionState,
  advanceSession,
  backSession,
  listSessions,
} = require("../controllers/session.controller");
const { requireAuth } = require("../middleware/auth");

// Student device - register before /:id routes
router.post("/join", joinSession);

// Parent-only
router.post("/", requireAuth, createSession);
router.get("/", requireAuth, listSessions);
router.get("/:id/live", requireAuth, getLiveSession);
router.post("/:id/advance", requireAuth, advanceSession);
router.post("/:id/back", requireAuth, backSession);
router.get("/:id/state", getSessionState);
router.get("/:id", requireAuth, getSession);

module.exports = router;
