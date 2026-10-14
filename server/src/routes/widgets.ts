import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res, next) => {
  const { page_id, type, title, sort_order, column_span } = req.body ?? {};
  if (!page_id || !type || !title) {
    res.status(400).json({ error: "page_id, type, and title are required" });
    return;
  }
  if (type !== "bookmarks" && type !== "tasks") {
    res.status(400).json({ error: "type must be bookmarks or tasks" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO widgets (page_id, type, title, sort_order, column_span)
       VALUES ($1, $2, $3, COALESCE($4, 0), COALESCE($5, 1))
       RETURNING id, page_id, type, title, sort_order, column_span`,
      [page_id, type, title, sort_order ?? null, column_span ?? null],
    );
    const widget = result.rows[0];
    res.status(201).json({
      ...widget,
      bookmarks: type === "bookmarks" ? [] : undefined,
      tasks: type === "tasks" ? [] : undefined,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  const { title, sort_order, column_span } = req.body ?? {};
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(title);
  }
  if (sort_order !== undefined) {
    fields.push(`sort_order = $${i++}`);
    values.push(sort_order);
  }
  if (column_span !== undefined) {
    fields.push(`column_span = $${i++}`);
    values.push(column_span);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(id);
  try {
    const result = await pool.query(
      `UPDATE widgets SET ${fields.join(", ")} WHERE id = $${i}
       RETURNING id, page_id, type, title, sort_order, column_span`,
      values,
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Widget not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      "DELETE FROM widgets WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Widget not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
