import { defineConfig } from "vitest/config";

const ignorePaths = [
  "examples/**",
  "node_modules",
  "dist",
  "scripts",
  "vitest.config.ts",
  "eslint.config.ts",
  "tsup.config.ts",
];

export default defineConfig({
  root: ".",
  test: {
    exclude: ignorePaths,
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ignorePaths,
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 },
    },
  },
});
