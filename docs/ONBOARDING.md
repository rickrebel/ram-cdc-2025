# Guía de onboarding técnico — RAM-CDC-2025

Este documento es para Ricardo: explica cómo funcionan las tecnologías del stack y cómo están aplicadas concretamente en este proyecto.

---

## El stack y por qué esta combinación

| Tecnología | Rol en el proyecto |
|---|---|
| **Remix** | Framework web full-stack: maneja rutas, formularios y la separación servidor/cliente |
| **React** | Librería de UI: los componentes visuales |
| **TypeScript** | Tipado estático sobre JavaScript |
| **Tailwind + DaisyUI** | Estilos utilitarios + componentes prearmados |
| **Prisma** | ORM: la capa que traduce código TypeScript a consultas MongoDB |
| **MongoDB Atlas** | Base de datos en la nube (documentos, no tablas) |
| **Zustand** | Estado compartido en el cliente entre componentes React |
| **Recharts** | Gráficas en React (barras, radar, pastel) |
| **OpenLayers** | Mapas interactivos con datos geográficos |

La combinación Remix + Prisma + MongoDB es una arquitectura "full-stack en un solo repo": el mismo archivo de ruta puede tener código de servidor (queries a la BD) y código de cliente (componentes visuales). No hay un backend separado como en Django.

---

## Remix — el concepto central

📖 Documentación oficial: https://remix.run/docs/en/main

### Qué es

Remix es un framework para React que resuelve algo que React puro no resuelve: cómo conectar el servidor (base de datos, sesiones, validaciones) con la UI de forma ordenada. En Django lo harías con views + templates; en Remix lo haces con **loaders**, **actions** y **componentes React** dentro del mismo archivo.

### El patrón loader / action / component

Cada archivo de ruta en `app/routes/` puede exportar hasta tres cosas:

```
loader   → se ejecuta en el SERVIDOR cuando el usuario hace GET a la URL
           (equivalente a un view de Django que solo lee datos)

action   → se ejecuta en el SERVIDOR cuando el usuario envía un formulario
           (equivalente a un view de Django que procesa POST/PUT/DELETE)

default  → es el COMPONENTE React que se renderiza en el NAVEGADOR
           (equivalente al template HTML, pero interactivo)
```

Ejemplo real del proyecto (`_app.add._new.characteristics.tsx`):

```ts
// SERVIDOR — corre cuando el usuario navega a /add/characteristics
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);  // redirige si no está autenticado
  // lee parámetros de la URL y consulta la BD...
}

// SERVIDOR — corre cuando el formulario de búsqueda de CURP es enviado
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);
  const curp = formData.get("/add/characteristics?curp") || "";
  const clinicos = await getPatientByCurp(curp); // consulta MongoDB vía Prisma
  return Response.json({ selected: clinicos });
}

// NAVEGADOR — el componente que el usuario ve
export default function Characteristics() {
  return (
    <main>
      <CurpSearch />  {/* componente React */}
    </main>
  );
}
```

### Routing por archivo

El nombre del archivo determina la URL. Las convenciones son:

| Archivo | URL | Notas |
|---|---|---|
| `_public._index.tsx` | `/` | Página de inicio |
| `_public.auth.tsx` | `/auth` | Login / Signup |
| `_app.tsx` | layout padre | No tiene URL propia, envuelve las rutas `_app.*` |
| `_app.add._new.characteristics.tsx` | `/add/characteristics` | Los puntos son separadores de segmentos |
| `_app.analyse.tsx` | `/analyse` | Dashboard |
| `$.tsx` | cualquier ruta no encontrada | 404 |

El prefijo `_` (guión bajo) en `_public` y `_app` indica que son **layouts**: archivos que envuelven visualmente a sus rutas hijas pero no tienen URL propia.

### La convención `.server.ts`

Los archivos en `app/server/` tienen el sufijo `.server.ts`. Remix/Vite usa  esto para garantizar que ese código **nunca se envíe al navegador**. Si importas accidentalmente algo de `.server.ts` en un componente de cliente,  el build falla con error. Es la forma de proteger credenciales y lógica sensible.

---

## Prisma + MongoDB Atlas

📖 Prisma con MongoDB: https://www.prisma.io/docs/orm/overview/databases/mongodb
📖 Referencia del schema: https://www.prisma.io/docs/orm/reference/prisma-schema-reference

### Qué hace Prisma aquí

Prisma es el intermediario entre el código TypeScript y MongoDB. Tú escribes  TypeScript; Prisma lo traduce a operaciones de MongoDB. Define los modelos en
`prisma/schema.prisma`.

### Cómo está configurada la conexión

`app/server/database.server.ts` exporta un singleton de `PrismaClient`:

```ts
// En desarrollo, reutiliza la misma conexión entre hot-reloads
// (evita agotar las conexiones disponibles en MongoDB Atlas)
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalWithPrisma.__db) {
    globalWithPrisma.__db = new PrismaClient();
  }
  prisma = globalWithPrisma.__db;
}
```

Todos los archivos en `app/server/` importan este `prisma` y hacen consultas con él. Ejemplo de lectura (`getters.server.ts`):

```ts
import { prisma } from "~/server/database.server";
const patient = await prisma.clinicos.findUnique({ where: { curp } });
```

### Comandos de mantenimiento de Prisma

```bash
npx prisma generate   # OBLIGATORIO después de cambiar schema.prisma
                      # Regenera el cliente TypeScript con los nuevos tipos

npx prisma studio     # Abre un explorador visual de la BD en el navegador
                      # Útil para inspeccionar datos sin escribir queries
```

### Diferencia importante con SQL

MongoDB no tiene tablas ni foreign keys reales. Prisma declara las relaciones en el schema, pero MongoDB las implementa guardando el ID del documento relacionado como un campo string. Si borras un documento padre, los hijos
no se borran automáticamente — Prisma gestiona esto en el código de la app.

El campo ID en MongoDB se llama `_id` (ObjectId), mapeado así en el schema:

```prisma
id String @id @default(auto()) @map("_id") @db.ObjectId
```

---

## Zustand — estado compartido en el cliente

📖 Documentación: https://zustand.pmnd.rs/

### Qué problema resuelve

El flujo de registro de pacientes tiene 5 pasos en rutas distintas. Cuando el usuario termina el paso 1 y crea un registro `Clinicos`, el ID generado por MongoDB necesita estar disponible en el paso 2, 3, 4 y 5. No se puede pasar por URL (es un ID interno) ni por el servidor (el usuario aún no termina).

Zustand guarda ese ID en memoria del navegador mientras la sesión está abierta.

### Cómo leer un store

```ts
// En app/state/store.ts:
export const useClinicalIDStore = create<ClinicalIDStore>((set) => ({
  clinicosID: "",                              // estado inicial
  setClinicalID: (clinicosID) => set({ clinicosID }), // función para actualizarlo
}));

// En cualquier componente React:
const { clinicosID, setClinicalID } = useClinicalIDStore();
setClinicalID("abc123");  // guarda el ID
console.log(clinicosID);  // lee el ID
```

### Stores disponibles en este proyecto

| Store | Qué guarda |
|---|---|
| `useClinicalIDStore` | ID del documento `Clinicos` creado en el paso 1 |
| `useContactoIDStore` | ID del documento `Contacto` |
| `useOtrosIDStore` | ID del documento `Otros` |
| `useOcupacionIDStore` | ID del documento `Ocupacion` |
| `useVisitationIDStore` | ID de la última `Visitation` |
| `usePrimaryConditionStore` | Cuál síndrome está seleccionado (IRAS/ITS/IVU/EDAS) |
| `useSecondarySymptomStore` | Síntomas secundarios marcados por el usuario |
| `useStepStore` | Estado de progreso del wizard (paso actual, completado, próximo) |

**Limitación conocida:** estos stores viven en memoria del navegador. Si el  usuario recarga la página a mitad del flujo, los stores se vacían y pierde el progreso. No se ha implementado persistencia (localStorage) intencionalmente.

---

## Tailwind CSS + DaisyUI

📖 Tailwind: https://tailwindcss.com/docs
📖 DaisyUI: https://daisyui.com/components/

### Cómo leer las clases de Tailwind

Tailwind reemplaza el CSS tradicional con clases utilitarias directamente en el HTML/JSX. Ejemplos:

```
mt-6        → margin-top: 1.5rem
mx-auto     → margin-left: auto; margin-right: auto
max-w-7xl   → max-width: 80rem
px-4        → padding-left: 1rem; padding-right: 1rem
bg-base-100 → background-color: valor definido por el tema activo
```

Los valores `base-100`, `primary`, `secondary`, `accent` son variables de color de DaisyUI, no de Tailwind puro.

### DaisyUI y los temas del proyecto

DaisyUI agrega componentes prearmados (botones, modales, tablas, badges) y un sistema de temas. El proyecto tiene cuatro temas personalizados definidos en `tailwind.config.ts`: `mexico`, `issste`, `sonora`, `mytheme`. El usuario puede cambiarlos con el componente `theme-change`.

Las clases de DaisyUI siguen este patrón:
```
btn btn-primary    → botón con color primario del tema activo
badge badge-error  → badge rojo
modal modal-open   → modal visible
```

---

## Recharts

📖 Documentación: https://recharts.org/en-US/api

### Cómo se usa en el proyecto

Las gráficas están en `app/components/charts/`. Recharts funciona con componentes React declarativos: describes la estructura de la gráfica y le pasas los datos como props.

```tsx
<BarChart data={myData}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

Los datos los prepara `app/server/charting.server.ts` y los recibe el componente vía el `loader` de `_app.analyse.tsx`.

---

## OpenLayers

📖 Documentación: https://openlayers.org/doc/

### Cómo se usa en el proyecto

OpenLayers renderiza el mapa de estados de México y la ubicación de hospitales.  Los datos geográficos (polígonos de estados) están en MongoDB como documentos `StateGeoJson` y se cargan vía loader. Las coordenadas de hospitales vienen del modelo `Hospital` (campos `latitude` y `longitude`).

OpenLayers es una librería imperativa (no declarativa como Recharts), por lo que interactúa con un elemento `<canvas>` del DOM directamente dentro de un `useEffect` de React.

---

## Cómo está construido el proyecto

```
app/
  routes/          ← un archivo = una URL (o layout)
  components/      ← componentes React reutilizables, organizados por dominio
  server/          ← toda la lógica de servidor (Prisma, auth, validación)
  state/store.ts   ← todos los stores de Zustand
  algorithms/      ← lógica clínica de los cuatro síndromes
  utilities/       ← tipos TypeScript compartidos y datos de referencia
prisma/
  schema.prisma    ← definición de modelos y relaciones
scripts/           ← seeds para poblar datos de referencia en MongoDB
data/              ← archivos JSON fuente usados por los seeds
docs/              ← esta documentación
```

El alias `~/` siempre apunta a `app/`. Es decir, `~/server/database.server` equivale a `app/server/database.server.ts`.

---

## Cómo navegar el código eficientemente

**Si quieres entender una pantalla específica:**
→ Busca el archivo de ruta en `app/routes/` que corresponda a la URL.
→ Lee el `loader` (qué datos trae del servidor) y el `action` (qué hace con los formularios). El componente `default` te dice qué se renderiza.

**Si quieres entender cómo se guardan los datos:**
→ El `action` de la ruta llama a funciones en `app/server/additions.server.ts` (crear) o `app/server/updates.server.ts` (actualizar) o `app/server/upsert.server.ts` (crear o actualizar).

**Si quieres entender cómo se leen los datos:**
→ El `loader` llama a funciones en `app/server/getters.server.ts`.

**Si quieres entender un componente visual:**
→ Empieza en `app/components/` buscando por el dominio (patients, inDRE, charts, auth, navigation).

**Si quieres cambiar el schema de la BD:**
→ Edita `prisma/schema.prisma`, luego corre `npx prisma generate`.
→ MongoDB no requiere migraciones (es schema-less), pero el cliente Prisma sí necesita regenerarse para que TypeScript reconozca los nuevos campos.

**Si quieres entender la lógica de los algoritmos clínicos:**
→ Ver `docs/PLATAFORMA.md` para el contexto médico, luego `app/algorithms/` para la implementación.
