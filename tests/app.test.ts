import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../src/App.vue";
import { EMPTY_TITLE_ERROR, TASKS_STORAGE_KEY, type Task } from "../src/tasks";

function mountApp() {
  return mount(App, { attachTo: document.body });
}

async function addTask(wrapper: ReturnType<typeof mountApp>, title: string) {
  await wrapper.get("#task-title").setValue(title);
  await wrapper.get("form.task-form").trigger("submit");
}

function storedTasks(): Task[] {
  const raw = localStorage.getItem(TASKS_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Task[]) : [];
}

beforeEach(() => {
  localStorage.clear();
});

describe("lista de tareas", () => {
  it("crea una tarea válida y actualiza el recuento de pendientes", async () => {
    const wrapper = mountApp();

    await addTask(wrapper, "Comprar pan");

    expect(wrapper.text()).toContain("Comprar pan");
    expect(wrapper.get("#pending-count").attributes("data-count")).toBe("1");
    expect(wrapper.get("#pending-count").text()).toBe("1 tarea pendiente");
    expect(storedTasks()).toHaveLength(1);
    expect(storedTasks()[0]?.title).toBe("Comprar pan");
  });

  it("valida que el título no esté vacío", async () => {
    const wrapper = mountApp();

    await addTask(wrapper, "   ");

    expect(wrapper.get("#task-error").text()).toBe(EMPTY_TITLE_ERROR);
    expect(wrapper.find(".task-item").exists()).toBe(false);
    expect(storedTasks()).toEqual([]);
  });

  it("marca una tarea como completada", async () => {
    const wrapper = mountApp();
    await addTask(wrapper, "Estudiar Vue");

    await wrapper.get('input[type="checkbox"]').setValue(true);

    expect(wrapper.get(".task-item").classes()).toContain("completed");
    expect(wrapper.get("#pending-count").attributes("data-count")).toBe("0");
    expect(storedTasks()[0]?.completed).toBe(true);
  });

  it("edita una tarea existente", async () => {
    const wrapper = mountApp();
    await addTask(wrapper, "Título inicial");

    await wrapper.get("button.button-secondary").trigger("click");
    await wrapper.get(".edit-form input").setValue("Título actualizado");
    await wrapper.get(".edit-form").trigger("submit");

    expect(wrapper.text()).toContain("Título actualizado");
    expect(wrapper.text()).not.toContain("Título inicial");
    expect(storedTasks()[0]?.title).toBe("Título actualizado");
  });

  it("no guarda una edición vacía", async () => {
    const wrapper = mountApp();
    await addTask(wrapper, "Mantener");

    await wrapper.get("button.button-secondary").trigger("click");
    await wrapper.get(".edit-form input").setValue("  ");
    await wrapper.get(".edit-form").trigger("submit");

    expect(wrapper.get(".form-error").text()).toBe(EMPTY_TITLE_ERROR);
    expect(wrapper.get(".edit-form").exists()).toBe(true);
    expect(storedTasks()[0]?.title).toBe("Mantener");
  });

  it("elimina una tarea", async () => {
    const wrapper = mountApp();
    await addTask(wrapper, "Borrar");

    await wrapper.get("button.button-danger").trigger("click");

    expect(wrapper.text()).not.toContain("Borrar");
    expect(wrapper.get("#empty-state").exists()).toBe(true);
    expect(storedTasks()).toEqual([]);
  });

  function visibleTitles(wrapper: ReturnType<typeof mountApp>): string[] {
    return wrapper.findAll(".task-title").map((item) => item.text());
  }

  it("filtra por todas, pendientes y completadas", async () => {
    const wrapper = mountApp();
    await addTask(wrapper, "Leer documentación");
    await addTask(wrapper, "Pagar factura");
    await wrapper
      .findAll(".task-item")
      .at(1)
      ?.get('input[type="checkbox"]')
      .setValue(true);

    await wrapper.get('[data-filter="active"]').trigger("click");
    expect(visibleTitles(wrapper)).toEqual(["Leer documentación"]);
    expect(wrapper.get('[data-filter="active"]').attributes("aria-pressed")).toBe(
      "true",
    );

    await wrapper.get('[data-filter="completed"]').trigger("click");
    expect(visibleTitles(wrapper)).toEqual(["Pagar factura"]);

    await wrapper.get('[data-filter="all"]').trigger("click");
    expect(visibleTitles(wrapper)).toEqual(["Leer documentación", "Pagar factura"]);
  });

  it("recupera las tareas guardadas en localStorage", async () => {
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([{ id: "stored-1", title: "Persistida", completed: false }]),
    );

    const wrapper = mountApp();

    expect(wrapper.text()).toContain("Persistida");
    expect(wrapper.get("#pending-count").attributes("data-count")).toBe("1");
  });
});

describe("metadatos", () => {
  it("muestra los metadatos de despliegue y no inventa identificadores Git", () => {
    const wrapper = mountApp();

    expect(wrapper.get("#app-name").text()).toBe("test-vue-vite");
    expect(wrapper.get("#app-version").text()).toBe("v0.1.0");
    expect(wrapper.get("#app-framework").text()).toBe("Vue 3");
    expect(wrapper.get("#deploy-name").text()).toBe("test-vue-vite");
    expect(wrapper.get("#deploy-version").text()).toBe("v0.1.0");
    expect(wrapper.get("#deploy-framework").text()).toBe("Vue 3");
    expect(wrapper.get("#deploy-branch").text()).toBe("No disponible");
    expect(wrapper.get("#deploy-commit").text()).toBe("No disponible");
    expect(wrapper.get("#deploy-build-date").text()).toBe("No disponible");
  });
});
