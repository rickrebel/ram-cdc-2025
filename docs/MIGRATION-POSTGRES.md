# Migración MongoDB → PostgreSQL

**Rama:** `sql-alternative`
**Estado general:** Subtarea 1 completada ✅

---

## Contexto y decisiones

Este proyecto migra de MongoDB Atlas a PostgreSQL en un servidor Debian propio.
No hay datos de producción que preservar — la migración es limpia.

### Decisiones tomadas

| Decisión | Opción elegida | Razón |
|---|---|---|
| Tipo de PK | `String @default(cuid())` | Mínimo impacto en TypeScript; todos los IDs siguen siendo `string` |
| `BactStructure` en Antimicrobianos | Columnas individuales tipadas como `Json` | Sin cambios en seed scripts; TypeScript solo necesita casting |
| `contactoId/otrosId/ocupacionId` en `Clinicos` | **Eliminados** | Redundantes — las FKs reales viven en las tablas hijas (`Contacto.clinicosId`, etc.) |
| `visitationIds String[]` en `Clinicos` | **Eliminado** | Patrón MongoDB denormalizado — la relación real es `Visitation.clinicosId` |

---

## Reglas de la casa (aprendidas en Subtareas 2–3)

Antes de dar por cerrada cualquier subtarea, verificar:

1. **Grep en `test/`** — cada vez que se elimine o renombre un campo de un tipo exportado (`typeClinicosStringified`, `ClinicalDataType`, etc.), buscar ese campo en `test/*.tsx` y limpiar los fixtures.
2. **Grep global del campo eliminado** — no solo en los archivos del scope declarado; usar `grep -r "campoEliminado" app/` para encontrar usos en rutas no listadas.
3. **Consistencia schema ↔ código** — cuando se agrega un campo requerido a un modelo en el schema, buscar todas las llamadas a `prisma.<modelo>.create(` y verificar que proveen los nuevos campos.
4. **`npx prisma generate` antes del typecheck** — cualquier cambio al schema requiere regenerar el cliente antes de correr `tsc`.

---

## Checklist de subtareas

### ✅ Subtarea 1 — Schema (`prisma/schema.prisma`)

**Completada en la rama `sql-alternative`.**

Cambios realizados:
- `datasource db.provider` → `"postgresql"`
- Todos los `id`: removido `@default(auto()) @map("_id") @db.ObjectId`, reemplazado por `@default(cuid())`
- Todos los `@db.ObjectId` en campos de relación: eliminados
- `type BactStructure { ... }`: eliminado (no existe en PostgreSQL)
- Los 4 modelos `AntimicrobianoTabla*`: cada campo de bacteria pasa de `BactStructure` a `Json`
- `Clinicos`: eliminados `visitationIds`, `contactoId`, `otrosId`, `ocupacionId`
- `Contacto`, `Otros`, `Ocupacion`: relaciones restructuradas — FK vive solo en el lado hijo
- `Profile.correoElectronico`: agregado `@unique` (era implícito, ahora explícito)
- `npx prisma generate` ejecutado — cliente regenerado con nuevos tipos
- **Corrección posterior (detectada en Subtarea 3):** el modelo `Antibiotic` fue omitido accidentalmente — re-agregado con la misma estructura que `Bacteria`/`Resistance`/`Gene`.
- **Decisión posterior:** `addHospital` en `additions.server.ts` comentada — los hospitales se gestionan exclusivamente vía catálogo oficial (`seedHospitales.js`); no se permite crear hospitales desde la UI.

**Errores de TypeScript pendientes** (guía para Subtareas 2–4):
- `upsert.server.ts`: referencias a `visitationIds`, `contactoId`, `otrosId`, `ocupacionId`
- `getters.server.ts`: `getAllVisitationIdsForClinicos` consulta `visitationIds` que ya no existe
- `_app.add._new.*` routes: pasan `contactoId/otrosId/ocupacionId` entre pasos del flujo
- `_app.indre.antimicrobianos.tsx`: usa tipos de `AntimicrobianoTabla*` — `BactStructure` ya no existe, los campos son `JsonValue`
- `app/utilities/bacteriaReplacer.ts`: posiblemente referencia `BactStructure`

---

### ✅ Subtarea 2 — Server core

**Archivos:** `app/server/upsert.server.ts`, `app/server/getters.server.ts`, `app/server/additions.server.ts`

**Cambios necesarios:**
1. `upsert.server.ts` → `upsertClinicos`: eliminar toda gestión de `visitationIds`, `contactoId`, `otrosId`, `ocupacionId` del objeto `Clinicos`. El upsert de Clinicos se simplifica notablemente.
2. `upsert.server.ts` → `upsertContacto/Otros/Ocupacion`: el `upsert` con `where: { id }` sigue funcionando, pero el `connect` ya no actualiza `Clinicos.contactoId` — ya no es necesario.
3. `getters.server.ts` → `getAllVisitationIdsForClinicos`: reemplazar con consulta a `Visitation` (`prisma.visitation.findMany({ where: { clinicosId }, select: { id: true } })`).

**Prompt sugerido para nueva conversación:**
```
Estoy migrando de MongoDB a PostgreSQL en la rama sql-alternative.
La Subtarea 1 (schema) ya está completa — ver docs/MIGRATION-POSTGRES.md.
Ahora necesito actualizar app/server/upsert.server.ts y app/server/getters.server.ts
para reflejar que Clinicos ya no tiene visitationIds, contactoId, otrosId, ocupacionId.
Lee el MIGRATION-POSTGRES.md y los archivos relevantes antes de proponer cambios.
```

---

### ✅ Subtarea 3 — Rutas del flujo _app.add._new.*

**Archivos:** `app/routes/_app.add._new.*` (características, create, primary, define, revise)

**Cambios necesarios:**
- El flujo multi-paso pasa `contactoId/otrosId/ocupacionId` entre rutas via Zustand store
  y los incluye en el `ClinicalDataType` enviado a upsert.
- Con la migración, estas IDs siguen siendo necesarias en el flujo para hacer upsert
  de los registros hijo, pero ya **no se almacenan en `Clinicos`**.
- Revisar qué rutas leen/escriben estos campos y ajustar para que solo sean IDs de trabajo
  en el store, sin intentar persistirlos en `Clinicos`.

**Prompt sugerido:**
```
Estoy migrando de MongoDB a PostgreSQL en la rama sql-alternative.
Las Subtareas 1 y 2 ya están completas — ver docs/MIGRATION-POSTGRES.md.
Ahora necesito revisar las rutas bajo app/routes/_app.add._new.* que usan
contactoId, otrosId, ocupacionId en el flujo multi-paso.
Lee el MIGRATION-POSTGRES.md y los archivos de rutas antes de proponer cambios.
```

---

### ⬜ Subtarea 4 — InDRE + tipos BactStructure

**Archivos:** `app/routes/_app.indre.antimicrobianos.tsx`, `app/utilities/bacteriaReplacer.ts`, `app/utilities/types.ts`

**Cambios necesarios:**
- Los campos de `AntimicrobianoTabla*` retornan `JsonValue` (tipo Prisma para `Json`)
  en lugar de `BactStructure`.
- Agregar un tipo local `BactStructure = { present: boolean; colour: string }` en
  `types.ts` o en el archivo de la ruta, y castear los valores al leerlos.
- Revisar `bacteriaReplacer.ts` por referencias al tipo `BactStructure` del cliente Prisma.

**Checks preventivos (ver Reglas de la casa):**
- `grep -r "BactStructure" test/` — verificar que ningún fixture de test use ese tipo.
- `grep -r "BactStructure" app/` — encontrar todos los usos antes de empezar, no solo los del scope declarado.
- Después de cambios en `types.ts`, verificar que ningún otro archivo importe los tipos modificados sin estar en el scope.

**Prompt sugerido:**
```
Estoy migrando de MongoDB a PostgreSQL en la rama sql-alternative.
Las Subtareas 1, 2 y 3 están completas — ver docs/MIGRATION-POSTGRES.md.
Ahora necesito actualizar app/routes/_app.indre.antimicrobianos.tsx y los
archivos de utilities que usaban el tipo BactStructure del cliente Prisma
(que ya no existe — los campos son JsonValue).
Lee el MIGRATION-POSTGRES.md y los archivos relevantes antes de proponer cambios.
```

---

### ⬜ Subtarea 5 — Seed scripts

**Archivos:** `scripts/seed*.js`

**Cambios necesarios:**
- `seedAntiMicrobianos.js`: construye objetos `{ present, colour }` para cada bacteria.
  Con `Json` en PostgreSQL, Prisma acepta objetos JS planos directamente — el seed
  debería funcionar sin cambios o con mínimos ajustes.
- Verificar que todos los seeds corren contra la nueva BD con `npm run seedall`.
- Ajustar `DATABASE_URL` en `.env` antes de ejecutar.

**Prompt sugerido:**
```
Estoy migrando de MongoDB a PostgreSQL en la rama sql-alternative.
Las Subtareas 1–4 están completas — ver docs/MIGRATION-POSTGRES.md.
Necesito verificar y ajustar los scripts en scripts/seed*.js para que
funcionen contra PostgreSQL. Empieza leyendo el MIGRATION-POSTGRES.md
y luego revisa cada script.
```

---

### ⬜ Subtarea 6 — Infraestructura y primer migrate

**Pasos:**
1. Instalar PostgreSQL en el servidor Debian (`apt install postgresql postgresql-contrib`)
2. Crear base de datos y usuario para la app
3. Actualizar `.env` con el nuevo `DATABASE_URL` (formato: `postgresql://user:pass@host:5432/dbname`)
4. Correr `npx prisma migrate dev --name init` para crear las tablas
5. Correr `npm run seedall` para poblar catálogos
6. Verificar con `npx prisma studio`

**Nota:** Si se usa conexión pooling (PgBouncer o similar en Debian), configurar
`directUrl` en el datasource para que Prisma Migrate use conexión directa.

---

## Notas técnicas

### Por qué se eliminó `visitationIds` de `Clinicos`
En MongoDB, era un array de ObjectIds que denormalizaba las referencias a `Visitation`
para evitar joins. En PostgreSQL, `Visitation.clinicosId` es la FK real y se puede
consultar con `WHERE clinicosId = X` — la denormalización no tiene sentido y crea
riesgo de inconsistencia.

### Por qué `BactStructure` pasa a `Json`
`type BactStructure` es un tipo embebido de Prisma/MongoDB (se almacena como subdocumento).
PostgreSQL no tiene este concepto — el equivalente es `jsonb`. Prisma mapea el tipo `Json`
a `jsonb` en PostgreSQL, que soporta indexación y consultas sobre los campos internos.

### Integridad referencial
La ventaja principal de este cambio: PostgreSQL **sí** aplica FK constraints a nivel de BD.
Si se borra un `Clinicos`, la BD rechaza la operación si tiene `Visitation` asociadas,
a menos que se configure `onDelete: Cascade` explícitamente.
Por ahora el schema no define `onDelete` — el comportamiento por defecto es `RESTRICT`
(error en delete si hay hijos). Si se necesita cascade, se agrega en Subtarea 2 o 3.
