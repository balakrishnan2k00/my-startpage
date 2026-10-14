import type { Bookmark, Dashboard, Task, Widget } from "./types";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Request failed: ${res.status}`,
    );
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function fetchDashboard(pageId: number) {
  return request<Dashboard>(`/api/pages/${pageId}/dashboard`);
}

export function createWidget(body: {
  page_id: number;
  type: "bookmarks" | "tasks";
  title: string;
}) {
  return request<Widget>("/api/widgets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateWidget(
  id: number,
  body: { title?: string; sort_order?: number },
) {
  return request<Widget>(`/api/widgets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteWidget(id: number) {
  return request<void>(`/api/widgets/${id}`, { method: "DELETE" });
}

export function createBookmark(body: {
  widget_id: number;
  title: string;
  url: string;
}) {
  return request<Bookmark>("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteBookmark(id: number) {
  return request<void>(`/api/bookmarks/${id}`, { method: "DELETE" });
}

export function createTask(body: { widget_id: number; title: string }) {
  return request<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTask(
  id: number,
  body: { title?: string; completed?: boolean },
) {
  return request<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteTask(id: number) {
  return request<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
