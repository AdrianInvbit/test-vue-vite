<script setup lang="ts">
import { computed, ref } from "vue";
import DeployCard from "./components/DeployCard.vue";
import TaskItem from "./components/TaskItem.vue";
import { getDeployMeta } from "./deploy-meta";
import { useTasks } from "./composables/useTasks";
import type { TaskFilter } from "./tasks";

const meta = getDeployMeta();
const {
  filter,
  errorMessage,
  pendingCount,
  visibleTasks,
  addTask,
  editTask,
  toggleTask,
  removeTask,
  setFilter,
} = useTasks();

const newTitle = ref("");

const pendingLabel = computed(() =>
  pendingCount.value === 1
    ? "1 tarea pendiente"
    : `${pendingCount.value} tareas pendientes`,
);

function onSubmit() {
  if (addTask(newTitle.value)) {
    newTitle.value = "";
  }
}

function isCurrentFilter(value: TaskFilter): boolean {
  return filter.value === value;
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <p class="eyebrow">Laboratorio de pruebas</p>
      <h1>ClonVercel Test Lab</h1>
      <p class="lede">
        Lista de tareas en Vue 3 para validar detección de frameworks, instalación
        de dependencias, compilación y despliegue estático.
      </p>
    </header>

    <main>
      <section class="card" aria-labelledby="app-info-title">
        <h2 id="app-info-title">Aplicación</h2>
        <dl class="meta-list">
          <div>
            <dt>Nombre</dt>
            <dd id="app-name">{{ meta.name }}</dd>
          </div>
          <div>
            <dt>Versión</dt>
            <dd id="app-version">{{ meta.version }}</dd>
          </div>
          <div>
            <dt>Framework</dt>
            <dd id="app-framework">{{ meta.framework }}</dd>
          </div>
        </dl>
      </section>

      <section class="card" aria-labelledby="tasks-title">
        <div class="tasks-header">
          <h2 id="tasks-title">Tareas</h2>
          <p id="pending-count" :data-count="pendingCount">{{ pendingLabel }}</p>
        </div>

        <form class="task-form" @submit.prevent="onSubmit">
          <label class="sr-only" for="task-title">Título de la tarea</label>
          <input
            id="task-title"
            v-model="newTitle"
            type="text"
            name="title"
            placeholder="Nueva tarea"
            :aria-invalid="Boolean(errorMessage)"
            :aria-describedby="errorMessage ? 'task-error' : undefined"
            autocomplete="off"
          >
          <button type="submit">Añadir</button>
        </form>
        <p v-if="errorMessage" id="task-error" class="form-error" role="alert">
          {{ errorMessage }}
        </p>

        <div class="filters" role="group" aria-label="Filtros de tareas">
          <button
            type="button"
            data-filter="all"
            :aria-pressed="isCurrentFilter('all')"
            @click="setFilter('all')"
          >
            Todas
          </button>
          <button
            type="button"
            data-filter="active"
            :aria-pressed="isCurrentFilter('active')"
            @click="setFilter('active')"
          >
            Pendientes
          </button>
          <button
            type="button"
            data-filter="completed"
            :aria-pressed="isCurrentFilter('completed')"
            @click="setFilter('completed')"
          >
            Completadas
          </button>
        </div>

        <p v-if="visibleTasks.length === 0" id="empty-state" class="empty-state">
          No hay tareas para este filtro.
        </p>
        <ul v-else class="task-list">
          <TaskItem
            v-for="task in visibleTasks"
            :key="task.id"
            :task="task"
            @toggle="toggleTask(task.id)"
            @save="editTask(task.id, $event)"
            @remove="removeTask(task.id)"
          />
        </ul>
      </section>
    </main>

    <footer class="site-footer">
      <DeployCard :meta="meta" />
    </footer>
  </div>
</template>
