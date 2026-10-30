# ClonVercel Test Lab — `test-vue-vite`

Aplicación Vue 3 de prueba, versión **v0.1.0**, para validar la detección de frameworks, la instalación de dependencias, la compilación, la publicación de archivos estáticos y la actualización mediante Git en ClonVercel.

## Objetivo

Disponer de una lista de tareas sencilla, predecible y compilable que se pueda importar en ClonVercel como proyecto Vue 3 + Vite, sin backend, sin base de datos y sin servicios externos.

## Tecnologías

- Vue 3 con Composition API y `<script setup>`
- TypeScript
- Vite
- CSS nativo
- Node.js 20 o superior
- Vitest y Vue Test Utils para las pruebas locales

## Funcionalidades

La aplicación permite gestionar tareas en el navegador:

1. Añadir tareas mediante un formulario.
2. Validar que el título no esté vacío.
3. Marcar tareas como completadas o pendientes.
4. Editar tareas existentes.
5. Eliminar tareas.
6. Filtrar por todas, pendientes y completadas.
7. Guardar las tareas en `localStorage`.
8. Mostrar el número de tareas pendientes.

La identificación del despliegue aparece en la interfaz:

- Nombre `test-vue-vite`
- Versión `v0.1.0`
- Framework Vue 3
- Rama Git
- Identificador del commit
- Fecha de compilación

Esos tres últimos datos salen de variables `VITE_*`. Si no están definidas, la interfaz muestra **No disponible**. El código no inventa identificadores de Git.

## Estructura

```text
test-vue-vite/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   ├── composables/
│   ├── App.vue
│   ├── deploy-meta.ts
│   ├── index.css
│   ├── main.ts
│   ├── tasks.ts
│   └── vite-env.d.ts
├── tests/
│   ├── app.test.ts
│   ├── project.test.ts
│   ├── setup.ts
│   └── tasks.test.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Variables de entorno

Copiar `.env.example` a `.env.local` si se quiere probar la inyección local. Durante el despliegue, ClonVercel puede definir:

```bash
VITE_APP_NAME=test-vue-vite
VITE_APP_VERSION=v0.1.0
VITE_GIT_BRANCH=
VITE_GIT_COMMIT=
VITE_BUILD_DATE=
```

Solo se usan variables con prefijo `VITE_`, para que Vite las incorpore en tiempo de compilación.

## Ejecución local

```bash
npm ci
npm run dev
```

La URL habitual es `http://localhost:5173`.

Vista previa de la carpeta de producción:

```bash
npm run build
npm run preview
```

## Pruebas

```bash
npm run build
npm test
```

Las pruebas comprueban:

- la creación y validación de tareas
- la edición y eliminación
- el cambio de estado
- los filtros
- la persistencia en `localStorage`
- la visualización de metadatos del despliegue
- que la salida de producción en `dist/` usa rutas relativas

## Despliegue estático

1. Instalar dependencias con `npm ci`.
2. Compilar con `npm run build`.
3. Publicar el contenido de `dist/`.
4. El directorio de salida es `dist` y el archivo de entrada es `index.html`.
5. `vite.config.ts` define `base: "./"` para que los recursos funcionen en la raíz o bajo un subdirectorio.

## Matriz de pruebas previstas para ClonVercel

| Caso | Resultado esperado |
| --- | --- |
| Importación Git del repositorio | El proyecto se reconoce como aplicación Vue 3/Vite `test-vue-vite`. |
| Instalación de dependencias | `npm ci` instala a partir de `package-lock.json`. |
| Compilación | `npm run build` genera `dist/`. |
| Publicación de estáticos | Se sirve `dist/index.html` con sus recursos relativos. |
| Tareas | Se pueden crear, validar, editar, completar y eliminar. |
| Filtros | Todas, pendientes y completadas muestran el subconjunto correcto. |
| Persistencia | Las tareas se conservan en `localStorage` al recargar. |
| Metadatos sin inyección | Rama, commit y fecha aparecen como `No disponible`. |
| Metadatos con `VITE_*` | Se muestran la rama, el commit y la fecha reales inyectados al compilar. |
| Despliegue bajo subdirectorio | Los recursos de `dist/` siguen cargando por las rutas relativas. |

## Limitaciones conocidas

- No hay backend, autenticación ni persistencia de servidor.
- Las tareas viven solo en el navegador (`localStorage`).
- Rama, commit y fecha de compilación permanecen en `No disponible` hasta que el proceso de despliegue inyecte las variables `VITE_*`.

## Versión

- Aplicación: `v0.1.0`
- Commit: `No disponible`
