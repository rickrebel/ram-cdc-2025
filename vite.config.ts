import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import reactVitest from "@vitejs/plugin-react";

// Sub-path configurable vía variable de entorno (build-time).
// Ej: BASE_PATH=rag → la app vive en /rag/
// Sin definir o vacío → la app vive en /
const basePath = process.env.BASE_PATH || "";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  base: basePath ? `/${basePath}/` : "/",
  plugins: [
    process.env.VITEST
      ? reactVitest()
      : remix({
          basename: basePath ? `/${basePath}` : undefined,
          future: {
            v3_fetcherPersist: true,
            v3_relativeSplatPath: true,
            v3_throwAbortReason: true,
            v3_lazyRouteDiscovery: true,
            v3_singleFetch: true,
            v3_routeConfig: false,
          },
        }),
    tsconfigPaths(),
    visualizer(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{ts,tsx}"], // Ensures only test files are included
    exclude: ["node_modules", "e2e/**", "dist", "build", "tests-examples/**"], // Exclude unwanted directories
  },
  server: {
    strictPort: true,
    // Specify a desired port, but Vite will use a different available one if needed
    port: 5173,
  },
});
