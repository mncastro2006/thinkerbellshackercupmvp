const router = require("express").Router();
const { uploadModule, getModule, listModules, deleteModule } = require("../controllers/module.controller");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", requireAuth, upload.single("file"), uploadModule);
router.get("/", requireAuth, listModules);
router.get("/:id", requireAuth, getModule);
router.delete("/:id", requireAuth, deleteModule);

module.exports = router;
