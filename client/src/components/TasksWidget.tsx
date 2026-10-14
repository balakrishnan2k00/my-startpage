import { useState } from "react";
import type { TasksWidget as TasksWidgetType, Task } from "../api/types";
import { createTask, deleteTask, updateTask } from "../api/client";
import "./WidgetCard.css";
import "./TasksWidget.css";

type Props = {
  widget: TasksWidgetType;
  onRename: (title: string) => void;
  onDelete: () => void;
  onTasksChange: (tasks: Task[]) => void;
  onError: (message: string) => void;
};

export function TasksWidget({
  widget,
  onRename,
  onDelete,
  onTasksChange,
  onError,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(widget.title);
  const [newTask, setNewTask] = useState("");

  function commitRename() {
    const t = titleDraft.trim();
    if (t && t !== widget.title) onRename(t);
    setEditing(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    const optimisticId = -Date.now();
    const optimistic: Task = {
      id: optimisticId,
      widget_id: widget.id,
      title,
      completed: false,
      sort_order: widget.tasks.length,
    };
    const withOptimistic = [...widget.tasks, optimistic];
    onTasksChange(withOptimistic);
    setNewTask("");
    try {
      const created = await createTask({ widget_id: widget.id, title });
      onTasksChange(
        withOptimistic
          .filter((t) => t.id !== optimisticId)
          .concat(created),
      );
    } catch (err) {
      onTasksChange(widget.tasks.filter((t) => t.id !== optimistic.id));
      onError(err instanceof Error ? err.message : "Failed to add task");
    }
  }

  async function toggleTask(task: Task) {
    const next = !task.completed;
    const prev = widget.tasks;
    onTasksChange(
      prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t)),
    );
    try {
      await updateTask(task.id, { completed: next });
    } catch (err) {
      onTasksChange(prev);
      onError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  async function removeTask(task: Task) {
    const prev = widget.tasks;
    onTasksChange(prev.filter((t) => t.id !== task.id));
    if (task.id < 0) return;
    try {
      await deleteTask(task.id);
    } catch (err) {
      onTasksChange(prev);
      onError(err instanceof Error ? err.message : "Failed to delete task");
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
        <ul className="task-list">
          {widget.tasks.map((task) => (
            <li key={task.id} className="task-list__item">
              <label className="task-list__label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                />
                <span
                  className={
                    task.completed ? "task-list__text task-list__text--done" : "task-list__text"
                  }
                >
                  {task.title}
                </span>
              </label>
              <button
                type="button"
                className="task-list__remove"
                onClick={() => removeTask(task)}
                aria-label={`Remove ${task.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <form className="task-add" onSubmit={handleAdd}>
          <input
            placeholder="New task…"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      </div>
    </article>
  );
}
