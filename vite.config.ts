import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // on GitHub Pages, the app is served from "/<repo-name>/" 
  base: process.env.GITHUB_ACTIONS ? "/weather-forecast/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true
  }
});
