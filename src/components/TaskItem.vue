<script setup lang="ts">
import { ref } from "vue";
import { validateTitle, type Task } from "../tasks";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  toggle: [];
  save: [title: string];
  remove: [];
}>();

const isEditing = ref(false);
const draft = ref(props.task.title);
const editError = ref("");

function startEdit() {
  draft.value = props.task.title;
  editError.value = "";
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editError.value = "";
  draft.value = props.task.title;
}

function saveEdit() {
  const error = validateTitle(draft.value);
  if (error) {
    editError.value = error;
    return;
  }

  emit("save", draft.value.trim());
  isEditing.value = false;
  editError.value = "";
}
</script>

<template>
  <li
    class="task-item"
    :class="{ completed: task.completed }"
    :data-task-id="task.id"
    :data-completed="task.completed"
  >
    <input
      type="checkbox"
      :checked="task.completed"
      :aria-label="`Marcar como ${task.completed ? 'pendiente' : 'completada'}: ${task.title}`"
      @change="emit('toggle')"
    >

    <form v-if="isEditing" class="edit-form" @submit.prevent="saveEdit">
      <label class="sr-only" :for="`edit-${task.id}`">Editar título</label>
      <input
        :id="`edit-${task.id}`"
        v-model="draft"
        type="text"
        :aria-invalid="Boolean(editError)"
        :aria-describedby="editError ? `edit-error-${task.id}` : undefined"
      >
      <button type="submit">Guardar</button>
      <button type="button" class="button-secondary" @click="cancelEdit">
        Cancelar
      </button>
      <p
        v-if="editError"
        :id="`edit-error-${task.id}`"
        class="form-error"
        role="alert"
      >
        {{ editError }}
      </p>
    </form>

    <template v-else>
      <p class="task-title">{{ task.title }}</p>
      <div class="task-actions">
        <button type="button" class="button-secondary" @click="startEdit">
          Editar
        </button>
        <button type="button" class="button-danger" @click="emit('remove')">
          Eliminar
        </button>
      </div>
    </template>
  </li>
</template>
