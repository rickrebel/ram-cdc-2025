import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import reactVitest from "@vitejs/plugin-react";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

// defineConfig recibe una función para poder llamar a loadEnv()
// antes de que se construya la config. Vite carga .env DESPUÉS
// de los hooks de plugins, así que sin esto BASE_PATH no estaría
// disponible a tiempo.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const basePath = env.BASE_PATH || "";

  return {
  base: basePath ? `/${basePath}/` : "/",
  plugins: [
    process.env.VITEST
      ? reactVitest()
      : remix({
          basename: basePath ? `/${basePath}/` : "/",
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
};
});
