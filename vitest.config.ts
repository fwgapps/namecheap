import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const ignorePaths = ["examples/**/*", "node_modules", "dist"];

export default defineConfig({
  plugins: [tsconfigPaths()],
  root: ".",
  test: {
    exclude: ignorePaths,
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ignorePaths,
    },
  },
});
