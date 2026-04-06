# Refactor: Eliminar dependencia de Zustand en rutas define

> **Estado:** En progreso
> **Fecha de inicio:** 2026-04-06
> **Contexto:** Las rutas `define.iras.tsx`, `define.its.tsx` y `define.alpha.tsx`
> dependen de stores de Zustand para IDs, condición primaria y síntomas.
> Esto rompe en SSR y en recarga de página. La solución es migrar a URL
> params + DB loaders + estado local (`useState`), el patrón que
> `revise.tsx` ya usa.

---

## Progreso por sesión

- [x] **Sesión 1** — Infraestructura (Fases 1-2)
- [x] **Sesión 2** — Migrar ITS + IRAS (Fases 3-4)
- [x] **Sesión 3** — Migrar Alpha + DefineCondition (Fases 5-6)
- [ ] **Sesión 4** — Limpieza + eliminar useStepStore (Fases 7-8)

---

## Sesión 1: Infraestructura (Fases 1-2)

### Fase 1: Crear `app/utilities/buildSymptomCatalog.ts`

Archivo nuevo. Extrae la lógica de `store.ts` (líneas 24-28 y 204-219):

- `flattenNestedSymptoms(nestedSymptoms)` — aplana objetos anidados de
  síntomas en un array plano de strings
- `buildSymptomCatalog(id, primary, symptoms, labels)` — retorna un
  objeto `SecondarySymptom` con: `id`, `primary`, `additional` (síntomas
  aplanados + "Ninguno(a)"), `additional_details` (labels aplanados +
  texto default), `checked` (array de booleans, todos false)
- Exporta el tipo `SecondarySymptom` (actualmente solo en `store.ts`)

Cero riesgo — no toca archivos existentes.

### Fase 2: Refactorizar `app/utilities/SelectSecondaries.tsx`

Actualmente lee `useSecondarySymptomStore()` internamente (líneas 63-64).

Cambios:
- Agregar 2 parámetros nuevos al final de la firma:
  `secondarySymptoms: SecondarySymptom[]` y
  `setSecondarySymptoms: (ss: SecondarySymptom[]) => void`
- Eliminar el import y la llamada a `useSecondarySymptomStore()`
- Pasar los nuevos parámetros a la función `carrot()` en vez de los
  valores del store
- **Riesgo de mutación:** `carrot()` muta `checked[]` directamente.
  Con `useState` esto no funciona (React compara por referencia).
  Solución: copiar el array antes de mutar:
  `const newChecked = [...secSympt.checked]`

**Verificación:** `npm run typecheck` debe pasar.

---

## Sesión 2: Migrar ITS + IRAS (Fases 3-4)

### Fase 3: Migrar `app/routes/_app.add._new.define.its.tsx`

Su loader YA lee `cID`/`vID` de URL params y trae `clinicos` +
`visitation` de la BD. Solo cambia el componente:

- **Quitar:** imports de `usePrimaryConditionStore`,
  `useSecondarySymptomStore`, `useClinicalIDStore`,
  `useVisitationIDStore`, `hasPrimaryCondition`
- **Agregar:** `useState` de React, `buildSymptomCatalog`, imports de
  `ALL_ITS_SYMPTOMS` y `ALL_ITS_LABELS` desde
  `~/algorithms/ITS/utilitiesSymptoms`
- Construir catálogo localmente:
  `buildSymptomCatalog("02", "ITS", ALL_ITS_SYMPTOMS, ALL_ITS_LABELS)`
- Estado de checkboxes:
  `const [symptomData, setSymptomData] = useState(initialSymptoms)`
- IDs para form submission: de `loaderData.clinicos.id` /
  `loaderData.visitation.id` (ya disponibles en el loader)
- Eliminar `findIndex(hasPrimaryCondition)` — la ruta ya sabe que es ITS
- Actualizar llamadas a `SelectSecondaries` con los 2 parámetros nuevos

### Fase 4: Migrar `app/routes/_app.add._new.define.iras.tsx`

**Loader:** Reemplazar el actual (retorna `null`) por uno que:
- Lee `cID` y `vID` de `request.url` searchParams
- Retorna `Response.json({ clinicosId, visitationId })`
- No necesita consultar BD (IRAS no usa `sexo_al_nacer`)

**Componente:** Mismo patrón que ITS:
- Quitar stores de Zustand, agregar `useState` + `buildSymptomCatalog`
- Catálogo:
  `buildSymptomCatalog("03", "IRAS", ALL_IRAS_SYMPTOMS, ALL_IRAS_LABELS)`
- IDs de loader data
- Eliminar la validación `selectedPrimaryCondition !== 2`
- Actualizar `SelectSecondaries` y `getSymptomsDropdowns` para usar
  datos locales

**Verificación:** Flujo completo ITS y IRAS (características → primary
→ define → revise). Recarga de página en define. Datos en BD.

---

## Sesión 3: Migrar Alpha + DefineCondition (Fases 5-6)

### Fase 5: Refactorizar `app/components/inputgroups/DefineCondition.tsx`

Actualmente lee `usePrimaryConditionStore` y
`useSecondarySymptomStore` internamente.

Cambios:
- Expandir `IProps` con:
  - `primaryConditionName: string` — reemplaza
    `primaryConditions[idx].name`
  - `handleSecondarySymptomsClick: (primaryId: number, secondaryId:
    number) => void` — pasa desde padre
- Eliminar lecturas de stores internos

### Fase 6: Migrar `app/routes/_app.add._new.define.alpha.tsx`

Maneja IVU y EDAS — necesita saber cuál condición desde la BD.

**Loader nuevo** (patrón de `revise.tsx`):
- Lee `cID`/`vID` de URL params
- Trae `getVisitation(vID)` para leer `primaryConditions`
- Determina si es IVU o EDAS
- Retorna `{ clinicosId, visitationId, primaryConditionName }`

**Componente:**
- Construir catálogo según `primaryConditionName` (IVU o EDAS)
- `handleSecondarySymptomsClick` como función local con `useState`
  (replicando lógica de store.ts líneas 221-242, con copia del array
  `checked` antes de mutar)
- Pasar nuevos props a `<Define>`: `primaryConditionName`,
  `handleSecondarySymptomsClick`
- IDs de loader data

**Verificación:** Flujo IVU y EDAS. Campos evacuaciones/vomitos.
Recarga de página.

---

## Sesión 4: Limpieza + eliminar useStepStore (Fases 7-8)

### Fase 7: Limpieza de stores no usados

**`app/state/store.ts`:**
- Eliminar `useSecondarySymptomStore` y datos asociados
  (`secondarySymptomsData`, `flattenNestedSymptoms`)
- Eliminar imports de `ALL_*_SYMPTOMS` y `ALL_*_LABELS` no usados

**`app/algorithms/IRAS/utilitiesForDiagnosis.ts`:**
- Actualizar import de `SecondarySymptom`: de `~/state/store` a
  `~/utilities/buildSymptomCatalog`

**`app/components/patients/CreatePatient.tsx`:**
- Reemplazar `KeyToString(value)` por `value ?? "null"` en las 5
  llamadas (clinicosID, contactoID, otrosID, ocupacionID, visitationID)
- Eliminar import de `KeyToString`

**`app/utilities/KeyToString.tsx`:**
- Eliminar archivo — era un helper para serializar ObjectIds de MongoDB,
  innecesario con cuid() de PostgreSQL. Tras las fases anteriores,
  `CreatePatient.tsx` era el último consumidor.

### Fase 8: Eliminar `useStepStore`

El step tracker se deriva de la ruta actual:

```ts
const { pathname } = useLocation();
const currentStep =
  pathname.includes("/define") ? "03" :
  pathname.includes("/revise") ? "04" :
  pathname.includes("/primary") ? "02" : "01";
```

**Archivos a modificar:**
- `app/components/inputgroups/PrevioSiguiente.tsx` — quitar
  `handleStepChange`
- `app/routes/_app.add._new.primary.tsx` — quitar `handleStepChange`
- `app/components/inputgroups/PrimaryConditionState.tsx` — quitar
  `handleStepChange`
- Componente que renderiza la barra de progreso — reemplazar lectura
  del store con lógica derivada de `useLocation()`
- `app/state/store.ts` — eliminar `useStepStore`

**`CLAUDE.md` línea 88:** Actualizar la nota sobre "los stores se
vacían y el flujo se rompe".

**Verificación:** `npm run typecheck`, `npm run lint`, `npm run test`.
Flujo completo de las 4 condiciones. Barra de progreso correcta.

---

## Riesgos transversales

1. **Mutación de estado con `useState`:** Las funciones `carrot()` y
   `handleSecondarySymptomsClick` mutan `checked[]` directamente.
   Con `useState` React no detecta la mutación (compara por
   referencia, a diferencia de Vue que usa proxies). Solución: copiar
   array antes de mutar: `const newChecked = [...checked]`.

2. **Import de `SecondarySymptom`:** `utilitiesForDiagnosis.ts` importa
   este tipo de `~/state/store`. Al moverlo a `buildSymptomCatalog.ts`,
   actualizar el import (fase 7).

3. **Navegación atrás desde revise:** `useState` se reinicia con
   checkboxes vacíos. No es regresión — Zustand actual también pierde
   estado en recarga. El action de `define.alpha.tsx` ya maneja merge
   con datos existentes de BD.