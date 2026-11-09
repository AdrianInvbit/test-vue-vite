import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  APP_FRAMEWORK,
  APP_NAME,
  APP_VERSION,
  getDeployMeta,
  UNAVAILABLE,
} from "../src/deploy-meta";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "README.md",
  ".gitignore",
  ".env.example",
  "package.json",
  "package-lock.json",
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "src/main.ts",
  "src/App.vue",
  "src/index.css",
  "src/tasks.ts",
  "src/composables/useTasks.ts",
  "public/favicon.svg",
  "tests/app.test.ts",
];

function readProjectFile(relativePath: string): string {
  return readFileSync(join(rootDir, relativePath), "utf8");
}

describe("estructura del proyecto", () => {
  it("incluye los archivos necesarios", () => {
    const missing = requiredFiles.filter(
      (relativePath) => !existsSync(join(rootDir, relativePath)),
    );
    expect(missing).toEqual([]);
  });

  it("declara el nombre, la versión y los scripts de compilación", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      name: string;
      version: string;
      scripts: Record<string, string>;
    };
    const envExample = readProjectFile(".env.example");
    const viteConfig = readProjectFile("vite.config.ts");

    expect(packageJson.name).toBe("test-vue-vite");
    expect(packageJson.version).toBe("0.2.0");
    expect(packageJson.scripts.dev).toBe("vite");
    expect(packageJson.scripts.build).toContain("vite build");
    expect(packageJson.scripts.preview).toBe("vite preview");
    expect(packageJson.scripts.test).toBe("vitest run");
    expect(viteConfig).toContain('base: "./"');
    expect(viteConfig).toContain('outDir: "dist"');
    expect(envExample).toContain("VITE_APP_NAME=");
    expect(envExample).toContain("VITE_APP_VERSION=");
    expect(envExample).toContain("VITE_GIT_BRANCH=");
    expect(envExample).toContain("VITE_GIT_COMMIT=");
    expect(envExample).toContain("VITE_BUILD_DATE=");
  });

  it("usa rutas relativas en el HTML de origen", () => {
    const html = readProjectFile("index.html");

    expect(html).toContain('lang="es"');
    expect(html).toContain('href="./favicon.svg"');
    expect(html).toContain('src="./src/main.ts"');
    expect(html).not.toMatch(/href="\//);
    expect(html).not.toMatch(/src="\//);
  });
});

describe("metadatos de despliegue", () => {
  it("usa valores conocidos de la aplicación y No disponible si faltan variables Git", () => {
    expect(APP_NAME).toBe("test-vue-vite");
    expect(APP_VERSION).toBe("v0.2.0");
    expect(APP_FRAMEWORK).toBe("Vue 3");

    const emptyMeta = getDeployMeta({} as ImportMetaEnv);
    expect(emptyMeta.name).toBe("test-vue-vite");
    expect(emptyMeta.version).toBe("v0.2.0");
    expect(emptyMeta.framework).toBe("Vue 3");
    expect(emptyMeta.branch).toBe(UNAVAILABLE);
    expect(emptyMeta.commit).toBe(UNAVAILABLE);
    expect(emptyMeta.buildDate).toBe(UNAVAILABLE);
  });

  it("incorpora las variables VITE_* cuando existen", () => {
    const meta = getDeployMeta({
      VITE_APP_NAME: "test-vue-vite",
      VITE_APP_VERSION: "v0.2.0",
      VITE_GIT_BRANCH: "main",
      VITE_GIT_COMMIT: "abc1234",
      VITE_BUILD_DATE: "2026-10-30T12:00:00Z",
    } as ImportMetaEnv);

    expect(meta.branch).toBe("main");
    expect(meta.commit).toBe("abc1234");
    expect(meta.buildDate).toBe("2026-10-30T12:00:00Z");
  });
});

describe("compilación de producción", () => {
  it("genera dist/ con recursos relativos", () => {
    const distHtmlPath = join(rootDir, "dist", "index.html");
    expect(existsSync(distHtmlPath), "Ejecuta npm run build antes de esta prueba").toBe(
      true,
    );

    const distHtml = readFileSync(distHtmlPath, "utf8");
    expect(distHtml).not.toMatch(/(?:src|href)="\//);
    expect(distHtml).toMatch(/src="\.\/assets\//);
  });
});
