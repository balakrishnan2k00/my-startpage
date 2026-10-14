import { useCallback, useEffect, useState } from "react";
import {
  createWidget,
  deleteWidget,
  fetchDashboard,
  updateWidget,
} from "./api/client";
import type { Widget } from "./api/types";
import { AddWidgetModal } from "./components/AddWidgetModal";
import { SearchBar } from "./components/SearchBar";
import { TopBar } from "./components/TopBar";
import { WidgetGrid } from "./components/WidgetGrid";
import "./App.css";

const DEFAULT_PAGE_ID = 1;
const THEME_KEY = "my-startpage-theme";

export default function App() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [pageTitle, setPageTitle] = useState("My startpage");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(
    () => localStorage.getItem(THEME_KEY) === "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkTheme ? "dark" : "light";
    localStorage.setItem(THEME_KEY, darkTheme ? "dark" : "light");
  }, [darkTheme]);

  const showError = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard(DEFAULT_PAGE_ID);
      setPageTitle(data.page.title);
      setWidgets(data.widgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRenameWidget(id: number, title: string) {
    const prev = widgets;
    setWidgets((w) =>
      w.map((item) => (item.id === id ? { ...item, title } : item)),
    );
    try {
      await updateWidget(id, { title });
    } catch (err) {
      setWidgets(prev);
      showError(err instanceof Error ? err.message : "Failed to rename");
    }
  }

  async function handleDeleteWidget(id: number) {
    const prev = widgets;
    setWidgets((w) => w.filter((item) => item.id !== id));
    try {
      await deleteWidget(id);
    } catch (err) {
      setWidgets(prev);
      showError(err instanceof Error ? err.message : "Failed to delete widget");
    }
  }

  async function handleCreateWidget(body: {
    page_id: number;
    type: "bookmarks" | "tasks";
    title: string;
  }) {
    try {
      const widget = await createWidget(body);
      setWidgets((w) => [...w, widget]);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create widget");
      throw err;
    }
  }

  return (
    <div className="app">
      <TopBar
        pageTitle={pageTitle}
        onAddWidget={() => setModalOpen(true)}
        darkTheme={darkTheme}
        onToggleTheme={() => setDarkTheme((d) => !d)}
      />
      <div className="app__search-wrap">
        <SearchBar />
      </div>
      {loading && <p className="app__status">Loading…</p>}
      {error && (
        <p className="app__status app__status--error">
          {error}. Is the API running? Try <code>npm run dev</code> and{" "}
          <code>docker compose up -d</code>.
        </p>
      )}
      {!loading && !error && (
        <WidgetGrid
          widgets={widgets}
          onWidgetsChange={setWidgets}
          onRenameWidget={handleRenameWidget}
          onDeleteWidget={handleDeleteWidget}
          onError={showError}
        />
      )}
      <AddWidgetModal
        open={modalOpen}
        pageId={DEFAULT_PAGE_ID}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateWidget}
      />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
