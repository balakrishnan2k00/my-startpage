import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";
import bookmarksRouter from "./routes/bookmarks.js";
import pagesRouter from "./routes/pages.js";
import tasksRouter from "./routes/tasks.js";
import widgetsRouter from "./routes/widgets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
const isProd = process.env.NODE_ENV === "production";

function corsOrigins(): string[] | boolean {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }
  if (raw === "*") {
    return true;
  }
  return raw.split(",").map((value) => value.trim()).filter(Boolean);
}

app.use(cors({ origin: corsOrigins() }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "disconnected" });
  }
});

app.use("/api/pages", pagesRouter);
app.use("/api/widgets", widgetsRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/tasks", tasksRouter);

if (isProd) {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(port, () => {
  console.log(
    isProd
      ? `App listening on http://localhost:${port}`
      : `API listening on http://localhost:${port}`,
  );
});
