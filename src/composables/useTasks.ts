import { computed, ref, watch } from "vue";
import {
  addTaskToList,
  countPending,
  filterTasks,
  loadTasks,
  removeTask as removeTaskFromList,
  saveTasks,
  toggleTask as toggleTaskInList,
  updateTaskTitle,
  type Task,
  type TaskFilter,
} from "../tasks";

export function useTasks() {
  const tasks = ref<Task[]>(loadTasks());
  const filter = ref<TaskFilter>("all");
  const errorMessage = ref("");

  const pendingCount = computed(() => countPending(tasks.value));
  const visibleTasks = computed(() => filterTasks(tasks.value, filter.value));

  watch(
    tasks,
    (value) => {
      saveTasks(value);
    },
    { deep: true },
  );

  function addTask(title: string): boolean {
    const result = addTaskToList(tasks.value, title);
    if ("error" in result) {
      errorMessage.value = result.error;
      return false;
    }

    tasks.value = result.tasks;
    errorMessage.value = "";
    return true;
  }

  function editTask(id: string, title: string): boolean {
    const result = updateTaskTitle(tasks.value, id, title);
    if ("error" in result) {
      errorMessage.value = result.error;
      return false;
    }

    tasks.value = result.tasks;
    errorMessage.value = "";
    return true;
  }

  function toggleTask(id: string): void {
    tasks.value = toggleTaskInList(tasks.value, id);
  }

  function removeTask(id: string): void {
    tasks.value = removeTaskFromList(tasks.value, id);
  }

  function setFilter(value: TaskFilter): void {
    filter.value = value;
  }

  return {
    tasks,
    filter,
    errorMessage,
    pendingCount,
    visibleTasks,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    setFilter,
  };
}
