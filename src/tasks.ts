export const TASKS_STORAGE_KEY = "test-vue-vite:tasks";
export const EMPTY_TITLE_ERROR = "El título no puede estar vacío.";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskFilter = "all" | "active" | "completed";

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Task;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean"
  );
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function validateTitle(title: string): string | null {
  return title.trim() ? null : EMPTY_TITLE_ERROR;
}

export function addTaskToList(
  tasks: Task[],
  title: string,
): { tasks: Task[] } | { error: string } {
  const error = validateTitle(title);
  if (error) {
    return { error };
  }

  const task: Task = {
    id: createId(),
    title: title.trim(),
    completed: false,
  };

  return { tasks: [...tasks, task] };
}

export function updateTaskTitle(
  tasks: Task[],
  id: string,
  title: string,
): { tasks: Task[] } | { error: string } {
  const error = validateTitle(title);
  if (error) {
    return { error };
  }

  const trimmed = title.trim();
  return {
    tasks: tasks.map((task) =>
      task.id === id ? { ...task, title: trimmed } : task,
    ),
  };
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (filter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

export function countPending(tasks: Task[]): number {
  return tasks.filter((task) => !task.completed).length;
}

export function loadTasks(storage: Storage = localStorage): Task[] {
  try {
    const raw = storage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[], storage: Storage = localStorage): void {
  storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
