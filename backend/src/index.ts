import "express-async-errors";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import petsRouter from "./routes/pets.js";
import dailyLogsRouter from "./routes/dailyLogs.js";
import reportsRouter from "./routes/reports.js";
import analyticsRouter from "./routes/analytics.js";
import usersRouter from "./routes/users.js";
import settingsRouter from "./routes/settings.js";
import { initializeScheduler } from "./scheduler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/pets", petsRouter);
app.use("/api/daily-logs", dailyLogsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/users", usersRouter);
app.use("/api/settings", settingsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  initializeScheduler();
  console.log(`Backend listening on :${config.port}`);
});
