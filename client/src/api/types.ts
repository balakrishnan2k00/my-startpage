export type Bookmark = {
  id: number;
  widget_id: number;
  title: string;
  url: string;
  icon_url: string | null;
  sort_order: number;
};

export type Task = {
  id: number;
  widget_id: number;
  title: string;
  completed: boolean;
  sort_order: number;
};

export type BookmarkWidget = {
  id: number;
  page_id: number;
  type: "bookmarks";
  title: string;
  sort_order: number;
  column_span: number;
  bookmarks: Bookmark[];
};

export type TasksWidget = {
  id: number;
  page_id: number;
  type: "tasks";
  title: string;
  sort_order: number;
  column_span: number;
  tasks: Task[];
};

export type Widget = BookmarkWidget | TasksWidget;

export type Dashboard = {
  page: {
    id: number;
    title: string;
    sort_order: number;
    created_at: string;
  };
  widgets: Widget[];
};
