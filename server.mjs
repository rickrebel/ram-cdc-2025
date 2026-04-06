import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "";

const app = express();

app.use(compression());
app.use(morgan("short"));

// Router que contiene static files + Remix handler.
// Se monta en "/" o en "/<BASE_PATH>" segun la variable de entorno.
const router = express.Router();

// Assets con hash en el nombre (inmutables, cache 1 anio).
router.use(
  "/assets",
  express.static("build/client/assets", {
    immutable: true,
    maxAge: "1y",
  })
);

// Otros archivos estaticos (favicon, etc.) — cache 1 hora.
router.use(express.static("build/client", { maxAge: "1h" }));

// Remix maneja todo lo demas (SSR, loaders, actions).
const build = await import("./build/server/index.js");
router.all("*", createRequestHandler({ build }));

// Montar el router en la ruta base.
if (BASE_PATH) {
  app.use(`/${BASE_PATH}`, router);
} else {
  app.use(router);
}

app.listen(PORT, () => {
  const url = BASE_PATH
    ? `http://localhost:${PORT}/${BASE_PATH}/`
    : `http://localhost:${PORT}/`;
  console.log(`Servidor corriendo en ${url}`);
});
