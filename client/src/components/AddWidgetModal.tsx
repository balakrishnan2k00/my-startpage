import { useState } from "react";
import "./AddWidgetModal.css";

type Props = {
  open: boolean;
  pageId: number;
  onClose: () => void;
  onCreate: (body: {
    page_id: number;
    type: "bookmarks" | "tasks";
    title: string;
  }) => Promise<void>;
};

export function AddWidgetModal({ open, pageId, onClose, onCreate }: Props) {
  const [type, setType] = useState<"bookmarks" | "tasks">("bookmarks");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim() || (type === "tasks" ? "Tasks" : "Bookmarks");
    setSaving(true);
    try {
      await onCreate({ page_id: pageId, type, title: t });
      setTitle("");
      setType("bookmarks");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="add-widget-title"
      >
        <h2 id="add-widget-title">Add widget</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal__field">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "bookmarks" | "tasks")}
            >
              <option value="bookmarks">Bookmarks</option>
              <option value="tasks">Tasks</option>
            </select>
          </label>
          <label className="modal__field">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "tasks" ? "Tasks" : "My links"}
            />
          </label>
          <div className="modal__actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
