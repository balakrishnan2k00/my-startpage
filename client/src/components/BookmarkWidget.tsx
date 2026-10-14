import { useState } from "react";
import type { BookmarkWidget as BookmarkWidgetType } from "../api/types";
import { createBookmark, deleteBookmark } from "../api/client";
import "./WidgetCard.css";
import "./BookmarkWidget.css";

type Props = {
  widget: BookmarkWidgetType;
  onRename: (title: string) => void;
  onDelete: () => void;
  onBookmarkAdded: (bookmark: BookmarkWidgetType["bookmarks"][0]) => void;
  onBookmarkRemoved: (id: number) => void;
  onError: (message: string) => void;
};

function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return "https://www.google.com/s2/favicons?domain=example.com&sz=32";
  }
}

export function BookmarkWidget({
  widget,
  onRename,
  onDelete,
  onBookmarkAdded,
  onBookmarkRemoved,
  onError,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(widget.title);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function commitRename() {
    const t = titleDraft.trim();
    if (t && t !== widget.title) onRename(t);
    setEditing(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    let url = newUrl.trim();
    if (!title || !url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    setAdding(true);
    try {
      const bookmark = await createBookmark({
        widget_id: widget.id,
        title,
        url,
      });
      onBookmarkAdded(bookmark);
      setNewTitle("");
      setNewUrl("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: number) {
    const prev = widget.bookmarks;
    onBookmarkRemoved(id);
    try {
      await deleteBookmark(id);
    } catch (err) {
      prev.forEach((b) => {
        if (b.id === id) onBookmarkAdded(b);
      });
      onError(err instanceof Error ? err.message : "Failed to delete link");
    }
  }

  return (
    <article className="widget-card">
      <header className="widget-card__header">
        {editing ? (
          <input
            className="widget-card__title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === "Enter" && commitRename()}
            autoFocus
          />
        ) : (
          <h2 className="widget-card__title">{widget.title}</h2>
        )}
        <div className="widget-card__actions">
          <button type="button" onClick={() => setEditing(true)} title="Rename">
            ✏️
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete widget "${widget.title}"?`)) onDelete();
            }}
            title="Delete widget"
          >
            🗑️
          </button>
        </div>
      </header>
      <div className="widget-card__body">
        <ul className="bookmark-list">
          {widget.bookmarks.map((b) => (
            <li key={b.id} className="bookmark-list__item">
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bookmark-list__link"
              >
                <img
                  src={b.icon_url ?? faviconUrl(b.url)}
                  alt=""
                  width={16}
                  height={16}
                  className="bookmark-list__icon"
                />
                <span>{b.title}</span>
              </a>
              <button
                type="button"
                className="bookmark-list__remove"
                onClick={() => handleRemove(b.id)}
                aria-label={`Remove ${b.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <form className="bookmark-add" onSubmit={handleAdd}>
          <input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={adding}
          />
          <input
            placeholder="URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            disabled={adding}
          />
          <button type="submit" disabled={adding}>Add</button>
        </form>
      </div>
    </article>
  );
}
