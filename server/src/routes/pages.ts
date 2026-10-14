import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/:pageId/dashboard", async (req, res, next) => {
  const pageId = Number(req.params.pageId);
  if (!Number.isInteger(pageId) || pageId < 1) {
    res.status(400).json({ error: "Invalid page id" });
    return;
  }

  try {
    const pageResult = await pool.query(
      "SELECT id, title, sort_order, created_at FROM pages WHERE id = $1",
      [pageId],
    );
    if (pageResult.rows.length === 0) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const widgetsResult = await pool.query(
      `SELECT id, page_id, type, title, sort_order, column_span
       FROM widgets WHERE page_id = $1 ORDER BY sort_order, id`,
      [pageId],
    );

    const widgets = [];
    for (const w of widgetsResult.rows) {
      if (w.type === "bookmarks") {
        const bookmarks = await pool.query(
          `SELECT id, widget_id, title, url, icon_url, sort_order
           FROM bookmarks WHERE widget_id = $1 ORDER BY sort_order, id`,
          [w.id],
        );
        widgets.push({ ...w, bookmarks: bookmarks.rows });
      } else if (w.type === "tasks") {
        const tasks = await pool.query(
          `SELECT id, widget_id, title, completed, sort_order
           FROM tasks WHERE widget_id = $1 ORDER BY sort_order, id`,
          [w.id],
        );
        widgets.push({ ...w, tasks: tasks.rows });
      } else {
        widgets.push(w);
      }
    }

    res.json({ page: pageResult.rows[0], widgets });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, sort_order FROM pages ORDER BY sort_order, id",
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
