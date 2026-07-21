import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveBuildId(): string {
  const fromEnv =
    process.env.VITE_BUILD_ID?.trim() ||
    process.env.CI_COMMIT_SHORT_SHA?.trim() ||
    process.env.GITHUB_SHA?.trim().slice(0, 7) ||
    "";
  if (fromEnv) return fromEnv;
  return Date.now().toString(36);
}

function emitVersionJsonPlugin(buildId: string): Plugin {
  return {
    name: "emit-version-json",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(
        path.join(outDir, "version.json"),
        JSON.stringify({ build: buildId }),
        "utf8",
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const buildId = command === "serve" ? "dev" : resolveBuildId();

  return {
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    plugins: [
      ...(command === "build" ? [emitVersionJsonPlugin(buildId)] : []),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
