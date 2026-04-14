# RAM CDC 2025

Plataforma de vigilancia epidemiológica de **resistencia antimicrobiana (RAM)** para la Secretaría de Salud (SSA) de México. Aplicación web full-stack construida con [Remix](https://remix.run/) + **TypeScript**, **Prisma** y **PostgreSQL** en el backend, con **React + Tailwind CSS + DaisyUI** en el frontend.

Esta guía está escrita para alguien que configura el proyecto por primera vez, incluso si nunca antes ha instalado Node.js.

---

## 1. Instalar requisitos previos

### Node.js y npm

* El proyecto requiere **Node.js versión 18 o superior**.
* Instala [Node.js](https://nodejs.org/en/download). Esto también instalará **npm** (Node Package Manager).
* Verifica la instalación:

  ```bash
  node -v
  npm -v
  ```

  Debes ver Node >= 18 y npm >= 9.

### Git

```bash
git --version
```

Si no está instalado, descárgalo de [git-scm.com](https://git-scm.com/).

### PostgreSQL

Necesitas una instancia de PostgreSQL (local o remota). Puedes:

* Instalar [PostgreSQL](https://www.postgresql.org/download/) localmente.
* Usar un servicio administrado (AWS RDS, Supabase, Railway, etc.).

Asegúrate de tener a la mano: usuario, contraseña, host, puerto y nombre de la base de datos.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/Proyecto-RAM-CDC/ram-cdc-2025
cd ram-cdc-2025
```

---

## 3. Configurar variables de entorno

Copia el archivo de estructura y renómbralo a `.env`:

```bash
cp .env-structure .env
```

Edita `.env` con tus valores:

```dotenv
# Cadena de conexión a PostgreSQL
DATABASE_URL="postgresql://usuario:contrasena@host:puerto/nombre_bd?schema=public"

# Cadena secreta aleatoria para firmar la cookie de sesión
SESSION_SECRET="elige_una_cadena_secreta_larga_aleatoria"

# Sub-path de la app (sin slashes). Ej: "ram" → la app vive en /ram/
# Dejar vacío para que la app viva en la raíz /.
# IMPORTANTE: es una variable de build-time. Cambiarla requiere rebuild.
BASE_PATH=""

# Puerto del servidor Express (default: 3001)
PORT=3001
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL en formato Prisma |
| `SESSION_SECRET` | Cadena aleatoria para seguridad de sesiones (puedes generarla con cualquier generador de contraseñas) |
| `BASE_PATH` | Permite montar la app en un sub-path (ej. `ram` → `http://host/ram/`). Dejar vacío para `/` |
| `PORT` | Puerto del servidor Express en producción (default: 3001) |

---

## 4. Instalar dependencias

```bash
npm install
```

Esto lee `package.json` e instala todo lo necesario. Además, el script `postinstall` aplica automáticamente los patches necesarios vía `patch-package`.

---

## 5. Configurar Prisma

Prisma es el ORM que traduce código TypeScript a consultas SQL contra PostgreSQL.

### Generar el cliente Prisma

```bash
npx prisma generate
```

Esto genera el cliente TypeScript a partir del esquema en `prisma/schema.prisma`. **Es obligatorio ejecutarlo después de clonar el repo o de modificar el schema.**

### Aplicar migraciones

```bash
npx prisma migrate dev
```

Esto aplica las migraciones pendientes en `prisma/migrations/` y sincroniza tu base de datos con el schema actual.

### Explorar la base de datos (opcional)

```bash
npx prisma studio
```

Abre una interfaz web para navegar las tablas de PostgreSQL.

---

## 6. Sembrar la base de datos

El proyecto incluye scripts para precargar datos de referencia (bacterias, antimicrobianos, hospitales, estados, etc.). Ejecútalos todos de una vez:

```bash
npm run seedall
```

Esto ejecuta los siguientes seeds en orden:

1. `seedSusceptibilidades` — categorías de susceptibilidad (SENSIBLE, RESISTENTE, etc.)
2. `seedBacterias` — catálogo de bacterias
3. `seedGeneFamilies` — familias de genes de resistencia
4. `seedResistanceMechanisms` — mecanismos de resistencia
5. `seedHospitals` — hospitales del sistema de salud (claves CLUES)
6. `seedStates` — entidades federativas
7. `seedAntiMicrobianos` — catálogo de antimicrobianos y sus relaciones

También puedes ejecutar cada seed individualmente con `npm run seed<nombre>` (ej. `npm run seedbacterias`).

---

## 7. Crear un usuario

La app requiere autenticación. Para crear el primer usuario:

```bash
npm run createuser
```

Es un prompt interactivo similar al `createsuperuser` de Django. Crea un registro `Profile` en la base de datos.

---

## 8. Ejecutar la app en desarrollo

```bash
npm run dev
```

* El sitio estará disponible en [http://localhost:5173](http://localhost:5173/) (puerto por defecto de Vite).
* Si configuraste `BASE_PATH="ram"`, la URL será `http://localhost:5173/ram/`.
* Los cambios en el código se recargan automáticamente (hot reload).

---

## 9. Compilar y ejecutar en producción

```bash
npm run build
npm start
```

* `npm run build` genera los archivos optimizados en `build/`.
* `npm start` levanta un servidor Express (`server.mjs`) que sirve la app.
* El servidor escucha en el puerto definido por `PORT` (default: 3001).
* Si `BASE_PATH` está definido, la app se monta automáticamente en ese sub-path.

---

## 10. Otros comandos útiles

```bash
npm run lint         # ESLint — verifica estilo y errores en JS/TS
npm run typecheck    # TypeScript — verificación de tipos sin compilar
npm run test         # Vitest — pruebas unitarias/integración (test/)
npx playwright test  # Playwright — pruebas end-to-end (e2e/)
```

---

## 11. Resolución de problemas

* **Versión incorrecta de Node**: si ves errores como "unsupported engine", verifica que uses Node >= 18.
* **Errores de Prisma**: asegúrate de que `.env` tenga un `DATABASE_URL` válido, que PostgreSQL esté en línea, y que hayas corrido `npx prisma migrate dev`.
* **Puerto en uso**: detén cualquier otro proceso que use el puerto 5173 (dev) o 3001 (producción).
* **Patches**: si ves errores después de `npm install`, verifica que `patch-package` haya aplicado los patches en `patches/`.

---

## Tour por archivos clave

### Configuración

| Archivo | Descripción |
|---|---|
| `vite.config.ts` | Configuración de Vite (build tool). Maneja `BASE_PATH` y los future flags de Remix |
| `tsconfig.json` | Configuración de TypeScript. Define el alias `~/` → `app/` |
| `tailwind.config.ts` | Configuración de Tailwind CSS y temas de DaisyUI |
| `postcss.config.mjs` | PostCSS (Tailwind + Autoprefixer) |
| `.prettierrc` | Reglas de formato automático de código |
| `.eslintrc.cjs` | Configuración de ESLint |
| `server.mjs` | Servidor Express para producción (compresión, archivos estáticos, Remix SSR) |

### Núcleo del proyecto

| Archivo | Descripción |
|---|---|
| `package.json` | Dependencias, scripts y requisitos del proyecto |
| `package-lock.json` | Versiones exactas de dependencias |
| `prisma/schema.prisma` | Definición de modelos y relaciones de la base de datos |
| `prisma/migrations/` | Archivos SQL de migración generados por Prisma |

### Entorno

| Archivo | Descripción |
|---|---|
| `.env` | Variables de entorno (no se sube a Git) |
| `.env-structure` | Plantilla con la estructura de `.env` |
| `env.d.ts` | Tipos de TypeScript para las variables de entorno |
| `global.d.ts` | Definiciones de tipos globales de TypeScript |

### Estructura de la aplicación

```
app/
  routes/          ← un archivo = una URL (o layout)
  components/      ← componentes React reutilizables
  server/          ← lógica de servidor (Prisma, auth, validación)
  state/store.ts   ← stores de Zustand (estado compartido en cliente)
  algorithms/      ← lógica clínica de los cuatro síndromes
  utilities/       ← tipos TypeScript compartidos y datos de referencia
prisma/
  schema.prisma    ← definición de modelos y relaciones
  migrations/      ← migraciones SQL
scripts/           ← seeds y gestión de usuarios
data/              ← archivos JSON fuente para los seeds
docs/              ← documentación adicional del proyecto
patches/           ← patches aplicados vía patch-package
```

El alias `~/` siempre apunta a `app/`. Es decir, `~/server/database.server` equivale a `app/server/database.server.ts`.

---

## Documentación adicional

* `docs/ONBOARDING.md` — cómo funcionan las tecnologías del stack aplicadas a este proyecto
* `docs/PLATAFORMA.md` — contexto clínico y epidemiológico de la plataforma
* `docs/MIGRATION-RR7.md` — plan de migración de Remix v2 a React Router v7