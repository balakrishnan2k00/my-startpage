import type { Widget, BookmarkWidget as BW, TasksWidget as TW, Task, Bookmark } from "../api/types";
import { BookmarkWidget } from "./BookmarkWidget";
import { TasksWidget } from "./TasksWidget";
import "./WidgetGrid.css";

type Props = {
  widgets: Widget[];
  onWidgetsChange: (widgets: Widget[]) => void;
  onRenameWidget: (id: number, title: string) => void;
  onDeleteWidget: (id: number) => void;
  onError: (message: string) => void;
};

export function WidgetGrid({
  widgets,
  onWidgetsChange,
  onRenameWidget,
  onDeleteWidget,
  onError,
}: Props) {
  function updateWidget(id: number, updater: (w: Widget) => Widget) {
    onWidgetsChange(widgets.map((w) => (w.id === id ? updater(w) : w)));
  }

  return (
    <div className="widget-grid">
      {widgets.map((w) => {
        if (w.type === "bookmarks") {
          const widget = w as BW;
          return (
            <BookmarkWidget
              key={w.id}
              widget={widget}
              onRename={(title) => onRenameWidget(w.id, title)}
              onDelete={() => onDeleteWidget(w.id)}
              onBookmarkAdded={(bookmark: Bookmark) =>
                updateWidget(w.id, (curr) =>
                  curr.type === "bookmarks"
                    ? { ...curr, bookmarks: [...curr.bookmarks, bookmark] }
                    : curr,
                )
              }
              onBookmarkRemoved={(bookmarkId) =>
                updateWidget(w.id, (curr) =>
                  curr.type === "bookmarks"
                    ? {
                        ...curr,
                        bookmarks: curr.bookmarks.filter((b) => b.id !== bookmarkId),
                      }
                    : curr,
                )
              }
              onError={onError}
            />
          );
        }
        const widget = w as TW;
        return (
          <TasksWidget
            key={w.id}
            widget={widget}
            onRename={(title) => onRenameWidget(w.id, title)}
            onDelete={() => onDeleteWidget(w.id)}
            onTasksChange={(tasks: Task[]) =>
              updateWidget(w.id, (curr) =>
                curr.type === "tasks" ? { ...curr, tasks } : curr,
              )
            }
            onError={onError}
          />
        );
      })}
    </div>
  );
}
