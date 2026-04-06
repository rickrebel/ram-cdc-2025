// Prefija rutas con BASE_PATH para que los redirect() server-side
// funcionen correctamente cuando la app vive en un sub-path.
//
// Uso: redirect(appPath("/auth?mode=login"))
//
// Sin BASE_PATH definido, appPath("/x") retorna "/x" sin cambios.

const BASE_PATH = process.env.BASE_PATH || "";

export function appPath(path: string): string {
  if (!BASE_PATH) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${BASE_PATH}${normalizedPath}`;
}
