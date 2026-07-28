const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const moduleRoutes = require("./routes/module.routes");
const sessionRoutes = require("./routes/session.routes");
const quizRoutes = require("./routes/quiz.routes");
const reportRoutes = require("./routes/report.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
