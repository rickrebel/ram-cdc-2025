# Migración pendiente: Remix v2 → React Router v7

## Por qué migrar

Remix v2 está en **modo sunset** — solo recibe fixes de seguridad.
React Router v7 es el sucesor oficial y resuelve bugs conocidos como
el de `basename` + `singleFetch` (remix-run/remix#10212), actualmente
parcheado localmente con `patch-package`.

## Estado actual del proyecto

- `@remix-run/react`: 2.15.3
- `react-router`: 6.29.0
- Future flags habilitados: `v3_fetcherPersist`, `v3_relativeSplatPath`,
  `v3_throwAbortReason`, `v3_lazyRouteDiscovery`, `v3_singleFetch`
- `v3_routeConfig`: **false** (se reemplaza con `app/routes.ts`)
- No hay `entry.server.tsx` ni `entry.client.tsx` custom
- No hay Netlify adapter (se usa Express via `server.mjs`)
- Node 22 (mínimo requerido: Node 20)

## Pasos de migración

Guía oficial: https://reactrouter.com/upgrading/remix

### 1. Ejecutar el codemod (automatiza imports)

```bash
npx codemod remix/2/react-router/upgrade
npm install
```

### 2. Mapeo de paquetes

| Remix v2                | React Router v7          |
|-------------------------|--------------------------|
| `@remix-run/dev`        | `@react-router/dev`      |
| `@remix-run/express`    | `@react-router/express`  |
| `@remix-run/node`       | `@react-router/node`     |
| `@remix-run/react`      | `react-router`           |
| `@remix-run/serve`      | `@react-router/serve`    |
| `@remix-run/testing`    | `react-router`           |

### 3. Crear `app/routes.ts`

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

### 4. Crear `react-router.config.ts`

```ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
} satisfies Config;
```

### 5. Actualizar `vite.config.ts`

```diff
-import { vitePlugin as remix } from "@remix-run/dev";
+import { reactRouter } from "@react-router/dev/vite";

 plugins: [
-  remix({ basename: ..., future: { ... } }),
+  reactRouter(),
 ]
```

### 6. Actualizar `tsconfig.json`

- Agregar `".react-router/types/**/*"` a `include`
- Cambiar `"types": ["@react-router/node", "vite/client"]`
- Agregar `"rootDirs": [".", "./.react-router/types"]`
- Agregar `.react-router/` a `.gitignore`

### 7. Actualizar scripts en `package.json`

```json
{
  "dev": "react-router dev",
  "build": "react-router build",
  "start": "node server.mjs",
  "typecheck": "react-router typegen && tsc"
}
```

### 8. Actualizar `server.mjs`

Cambiar import de `@remix-run/express` a `@react-router/express`.

### 9. Eliminar el patch

Borrar `patches/@remix-run+react+2.15.3.patch` y el script
`postinstall` de `package.json`.

## Riesgos conocidos

- **TypeScript más estricto** — React Router v7 genera tipos por ruta.
  Puede requerir ajustes en loaders/actions.
- **Zustand, Prisma, bcryptjs** — no se ven afectados.
- El `basename` para sub-path sigue siendo soportado y funciona
  correctamente desde v7.3.0.

## Referencias

- Guía oficial: https://reactrouter.com/upgrading/remix
- Anuncio: https://remix.run/blog/react-router-v7
- Bug resuelto: https://github.com/remix-run/react-router/pull/12898
