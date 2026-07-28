const router = require("express").Router();
const { uploadModule, getModule, listModules } = require("../controllers/module.controller");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", requireAuth, upload.single("file"), uploadModule);
router.get("/", requireAuth, listModules);
router.get("/:id", requireAuth, getModule);

module.exports = router;
