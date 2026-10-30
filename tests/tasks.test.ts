import { beforeEach, describe, expect, it } from "vitest";
import {
  addTaskToList,
  countPending,
  EMPTY_TITLE_ERROR,
  filterTasks,
  loadTasks,
  removeTask,
  saveTasks,
  TASKS_STORAGE_KEY,
  toggleTask,
  updateTaskTitle,
  validateTitle,
  type Task,
} from "../src/tasks";

const sample: Task[] = [
  { id: "1", title: "Pendiente", completed: false },
  { id: "2", title: "Hecha", completed: true },
];

beforeEach(() => {
  localStorage.clear();
});

describe("validación y mutaciones de tareas", () => {
  it("rechaza títulos vacíos o solo con espacios", () => {
    expect(validateTitle("")).toBe(EMPTY_TITLE_ERROR);
    expect(validateTitle("   ")).toBe(EMPTY_TITLE_ERROR);
    expect(addTaskToList([], "   ")).toEqual({ error: EMPTY_TITLE_ERROR });
  });

  it("crea una tarea recortando el título", () => {
    const result = addTaskToList([], "  Comprar pan  ");
    expect("tasks" in result).toBe(true);
    if ("tasks" in result) {
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0]?.title).toBe("Comprar pan");
      expect(result.tasks[0]?.completed).toBe(false);
    }
  });

  it("edita, completa y elimina tareas", () => {
    const edited = updateTaskTitle(sample, "1", "Nueva");
    expect("tasks" in edited).toBe(true);
    if ("tasks" in edited) {
      expect(edited.tasks[0]?.title).toBe("Nueva");
    }

    const emptyEdit = updateTaskTitle(sample, "1", " ");
    expect(emptyEdit).toEqual({ error: EMPTY_TITLE_ERROR });

    const toggled = toggleTask(sample, "1");
    expect(toggled[0]?.completed).toBe(true);

    const remaining = removeTask(sample, "2");
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe("1");
  });
});

describe("filtros y pendientes", () => {
  it("filtra por todas, pendientes y completadas", () => {
    expect(filterTasks(sample, "all")).toHaveLength(2);
    expect(filterTasks(sample, "active").map((task) => task.id)).toEqual(["1"]);
    expect(filterTasks(sample, "completed").map((task) => task.id)).toEqual(["2"]);
    expect(countPending(sample)).toBe(1);
  });
});

describe("persistencia local", () => {
  it("guarda y recupera tareas válidas", () => {
    saveTasks(sample);
    expect(loadTasks()).toEqual(sample);
    expect(localStorage.getItem(TASKS_STORAGE_KEY)).toContain("Pendiente");
  });

  it("ignora JSON inválido o formas incorrectas", () => {
    localStorage.setItem(TASKS_STORAGE_KEY, "{no-json");
    expect(loadTasks()).toEqual([]);

    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify({ title: "no array" }));
    expect(loadTasks()).toEqual([]);

    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([{ id: 1, title: "mala", completed: "sí" }]),
    );
    expect(loadTasks()).toEqual([]);
  });
});
