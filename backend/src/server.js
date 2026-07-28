require("dotenv").config();
const app = require("./app");
const { initDb } = require("./models");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[server] ThinkerBells backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
})();
