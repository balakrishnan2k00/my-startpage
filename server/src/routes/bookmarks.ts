import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res, next) => {
  const { widget_id, title, url, icon_url, sort_order } = req.body ?? {};
  if (!widget_id || !title || !url) {
    res.status(400).json({ error: "widget_id, title, and url are required" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookmarks (widget_id, title, url, icon_url, sort_order)
       VALUES ($1, $2, $3, $4, COALESCE($5, 0))
       RETURNING id, widget_id, title, url, icon_url, sort_order`,
      [widget_id, title, url, icon_url ?? null, sort_order ?? null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  const { title, url, icon_url, sort_order } = req.body ?? {};
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(title);
  }
  if (url !== undefined) {
    fields.push(`url = $${i++}`);
    values.push(url);
  }
  if (icon_url !== undefined) {
    fields.push(`icon_url = $${i++}`);
    values.push(icon_url);
  }
  if (sort_order !== undefined) {
    fields.push(`sort_order = $${i++}`);
    values.push(sort_order);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(id);
  try {
    const result = await pool.query(
      `UPDATE bookmarks SET ${fields.join(", ")} WHERE id = $${i}
       RETURNING id, widget_id, title, url, icon_url, sort_order`,
      values,
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Bookmark not found" });
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
      "DELETE FROM bookmarks WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
