import { describe, expect, it } from "vitest";

import {
  createTask,
  loadTasks,
  moveTask,
  parseStoredTasks,
  saveTasks,
  validateTaskFields,
  type Task,
} from "@/lib/tasks";

const fields = {
  title: "Refresh portfolio",
  client: "Northstar Studio",
  deadline: "2026-10-20",
  notes: "Review the new case study.",
};

const sampleTask: Task = {
  ...fields,
  id: "task-1",
  status: "in_progress",
  createdAt: "2026-10-01T10:00:00.000Z",
};

describe("task data and browser persistence", () => {
  it("requires a title, client, and valid deadline", () => {
    expect(validateTaskFields({ ...fields, title: "  " }).title).toBe("Add a task title.");
    expect(validateTaskFields({ ...fields, client: "" }).client).toBe("Add a client name.");
    expect(validateTaskFields({ ...fields, deadline: "2026-02-30" }).deadline).toBe(
      "Enter a valid date.",
    );
  });

  it("creates tasks with stable fields and the initial To Do status", () => {
    expect(createTask(fields, "task-1", "2026-10-16T10:00:00.000Z")).toEqual({
      ...fields,
      id: "task-1",
      status: "todo",
      createdAt: "2026-10-16T10:00:00.000Z",
    });
  });

  it("moves a task without changing its other data", () => {
    const moved = moveTask([sampleTask], sampleTask.id, "done");
    expect(moved[0]).toEqual({ ...sampleTask, status: "done" });
    expect(sampleTask.status).toBe("in_progress");
  });

  it("skips invalid stored rows and reports malformed saved data", () => {
    const parsed = parseStoredTasks(JSON.stringify([sampleTask, { ...sampleTask, title: " " }]));
    expect(parsed.tasks).toEqual([sampleTask]);
    expect(parsed.warning).toMatch(/incomplete/i);
    expect(parseStoredTasks("not-json").tasks).toEqual([]);
    expect(parseStoredTasks("not-json").warning).toMatch(/could not be read/i);
  });

  it("handles unavailable storage on reads and writes", () => {
    const brokenStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(loadTasks(brokenStorage).warning).toMatch(/unavailable/i);
    expect(saveTasks([sampleTask], brokenStorage)).toBe(false);
  });

  it("persists and restores validated task data", () => {
    let stored: string | null = null;
    const storage = {
      getItem: () => stored,
      setItem: (_key: string, value: string) => {
        stored = value;
      },
    };
    expect(saveTasks([sampleTask], storage)).toBe(true);
    expect(loadTasks(storage).tasks).toEqual([sampleTask]);
  });
});