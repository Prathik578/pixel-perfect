export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  client: string;
  deadline: string;
  notes: string;
  status: TaskStatus;
  createdAt: string;
}

export type TaskFields = Pick<Task, "title" | "client" | "deadline" | "notes">;

export interface TaskInputErrors {
  title?: string;
  client?: string;
  deadline?: string;
}

export interface TaskStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LoadedTasks {
  tasks: Task[];
  warning: string | null;
}

const STORAGE_KEY = "studio-board.tasks.v1";
const statuses = new Set<TaskStatus>(["todo", "in_progress", "done"]);

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    task.id.trim().length > 0 &&
    typeof task.title === "string" &&
    task.title.trim().length > 0 &&
    typeof task.client === "string" &&
    task.client.trim().length > 0 &&
    isCalendarDate(task.deadline) &&
    typeof task.notes === "string" &&
    typeof task.status === "string" &&
    statuses.has(task.status as TaskStatus) &&
    typeof task.createdAt === "string" &&
    !Number.isNaN(Date.parse(task.createdAt))
  );
}

export function validateTaskFields(fields: TaskFields): TaskInputErrors {
  const errors: TaskInputErrors = {};
  if (!fields.title.trim()) errors.title = "Add a task title.";
  if (!fields.client.trim()) errors.client = "Add a client name.";
  if (!fields.deadline) errors.deadline = "Choose a deadline.";
  else if (!isCalendarDate(fields.deadline)) errors.deadline = "Enter a valid date.";
  return errors;
}

export function parseStoredTasks(raw: string): LoadedTasks {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) {
      return { tasks: [], warning: "Saved tasks could not be read. A fresh board is ready." };
    }

    const ids = new Set<string>();
    const tasks = value.filter((entry): entry is Task => {
      if (!isTask(entry) || ids.has(entry.id)) return false;
      ids.add(entry.id);
      return true;
    });

    return {
      tasks,
      warning:
        tasks.length === value.length
          ? null
          : "Some saved tasks were incomplete and could not be loaded.",
    };
  } catch {
    return { tasks: [], warning: "Saved tasks could not be read. A fresh board is ready." };
  }
}

export function loadTasks(storage?: TaskStorage): LoadedTasks {
  try {
    const target = storage ?? globalThis.localStorage;
    const stored = target.getItem(STORAGE_KEY);
    return stored === null ? { tasks: [], warning: null } : parseStoredTasks(stored);
  } catch {
    return {
      tasks: [],
      warning: "Browser saving is unavailable. Changes may not survive a reload.",
    };
  }
}

export function saveTasks(tasks: Task[], storage?: TaskStorage): boolean {
  try {
    const target = storage ?? globalThis.localStorage;
    target.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function createTask(
  fields: TaskFields,
  id: string = crypto.randomUUID(),
  createdAt: string = new Date().toISOString(),
): Task {
  return {
    ...fields,
    title: fields.title.trim(),
    client: fields.client.trim(),
    notes: fields.notes.trim(),
    id,
    status: "todo",
    createdAt,
  };
}

export function updateTask(tasks: Task[], id: string, fields: TaskFields): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          ...fields,
          title: fields.title.trim(),
          client: fields.client.trim(),
          notes: fields.notes.trim(),
        }
      : task,
  );
}

export function moveTask(tasks: Task[], id: string, status: TaskStatus): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, status } : task));
}

export { STORAGE_KEY };