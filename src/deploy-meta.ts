export const APP_NAME = "test-vue-vite";
export const APP_VERSION = "v0.2.0";
export const APP_FRAMEWORK = "Vue 3";
export const UNAVAILABLE = "No disponible";

export type DeployMeta = {
  name: string;
  version: string;
  framework: string;
  branch: string;
  commit: string;
  buildDate: string;
};

function readEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function getDeployMeta(
  env: ImportMetaEnv = import.meta.env,
): DeployMeta {
  return {
    name: readEnv(env.VITE_APP_NAME, APP_NAME),
    version: readEnv(env.VITE_APP_VERSION, APP_VERSION),
    framework: APP_FRAMEWORK,
    branch: readEnv(env.VITE_GIT_BRANCH, UNAVAILABLE),
    commit: readEnv(env.VITE_GIT_COMMIT, UNAVAILABLE),
    buildDate: readEnv(env.VITE_BUILD_DATE, UNAVAILABLE),
  };
}
