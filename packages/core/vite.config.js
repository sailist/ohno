import { defineConfig } from "vite";
import path, { resolve } from "path";
import { builtinEnvironments, populateGlobal } from "vitest/environments";

const root = resolve(__dirname, "src/");
export const isDev = process.env.__DEV__ === "true";

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    // environment: "happy-dom",
    environment: "jsdom",
    // environment: "edge-runtime",
  },
});