# CLAUDE.md

## What this platform does

**RAM-CDC-2025** is a clinical surveillance platform for antibiotic resistance in Mexico, developed for SSA (Secretaría de Salud). It has two main functions:

1. **Patient management with clinical algorithms** — Healthcare professionals register patients (using CURP), log clinical visits, and run diagnostic algorithms for four syndromes: IRAS (respiratory), ITS (sexually transmitted), IVU (urinary), EDAS (diarrheal). The algorithms run on the client side and guide diagnosis.

2. **InDRE resistome surveillance** — Professionals enter bacteriological data from laboratory culture results: bacteria species, resistance mechanisms, antibiotic susceptibility, and resistance genes. This data feeds epidemiological dashboards and maps.

---

## Developer context

The developer (Ricardo) did **not** write this codebase and is **not** fluent in React or Remix. He has 12 years of programming experience (Python/Django/Vue/SQL/d3.js), so he understands general patterns, TypeScript syntax, and data logic — but has low experience with: 
- React
Not familiar with:
- Remix's conventions
- Zustand (client-side state management)

**When explaining non-trivial code blocks, walk through the logic section by section. Name patterns explicitly (e.g., "this is a Remix loader", "this is a Zustand store"). Ask if Ricardo understands the concept before proceeding with changes.**

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Remix 2 (full-stack React, file-based routing) |
| Styling | Tailwind CSS 3 + DaisyUI 4 |
| ORM | Prisma 6 (PostgreSQL) |
| State (client) | Zustand 5 |
| Charts | Recharts 2 |
| Maps | OpenLayers 10 |
| Auth | bcryptjs + Remix cookie sessions |
| Testing | Vitest (unit) + Playwright (e2e) |
| Deployment | Netlify (via `@netlify/remix-adapter`) |

---

## Commands

```bash
# Development
npm run dev          # Starts Vite dev server at localhost:5173

# Production
npm run build        # Remix + Vite production build
npm run start        # Netlify local server (simulates prod)

# Code quality
npm run lint         # ESLint
npm run typecheck    # tsc (TypeScript check, no emit)

# Testing
npm run test         # Vitest (unit/integration tests in test/)
npx playwright test  # E2E tests in e2e/

# Prisma
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma studio    # Visual DB browser (opens in browser)

# Database seeding (run in order or use seedall)
npm run seedall      # Seeds all reference data into PostgreSQL

# User management
npm run createuser   # Interactive prompt to create a Profile (like Django's createsuperuser)
```

---

## Routing conventions

All routes under `_app.` require authentication (`requireUserSession()` in loader). All under `_public.` are open. Files in `app/server/` are server-only — the `.server.ts` suffix is enforced by Remix/Vite.

---

## Patient registration flow

Multi-step form under `_app.add._new/`:
1. `characteristics.tsx` → búsqueda por CURP
2. `characteristics_.create.tsx` → crea registro `Clinicos` en la BD
3. `primary.tsx` → selección de condición (IRAS, ITS, IVU, EDAS)
4. `define.tsx` / `define.iras.tsx` / etc. → síntomas secundarios
5. `revise.tsx` → crea `Visitation` vinculada al `Clinicos`

Los IDs generados en cada paso se guardan en Zustand stores (`app/state/store.ts`). Las rutas `define.*` ya fueron migradas a URL params + DB loaders + `useState` local (sesiones 1-3 del refactor). La barra de progreso (Steps.tsx) se deriva de `useLocation()`, no de un store. Los ID stores (`useClinicalIDStore`, etc.) y `usePrimaryConditionStore` siguen activos para el flujo de características → primary.

---

## Authentication

Cookie session de 30 días via `createCookieSessionStorage`. El `profileId` se almacena en la cookie firmada. `requireUserSession()` redirige a `/auth` si la sesión no existe o expiró.

---

## Documentación para el desarrollador

Ver `docs/` para guías en español:
- `docs/ONBOARDING.md` — cómo funcionan las tecnologías del stack en este proyecto
- `docs/PLATAFORMA.md` — contexto clínico/epidemiológico de la plataforma

---

## Database schema overview (Prisma/PostgreSQL)

Key models in `prisma/schema.prisma`:

- **Clinicos** — Patient static record. Unique on `CURP`. Has one-to-many `Visitation` and optional one-to-one relations to `Contacto`, `Otros`, `Ocupacion`.
- **Visitation** — Each clinical visit. Contains weight, height, symptoms, primary/secondary condition flags, linked to a `Clinicos`.
- **Profile** — Healthcare professional (user account). Unique on `email` and `cedula`.
- **Indreobj** — InDRE resistome record. Contains embedded data about bacteria, antibiotics, resistance mechanisms, genes, and hospital.
- **Hospital** — Reference table for Mexican health facilities (CLUES code, lat/long, tier).
- **Bacteria / Resistance / Gene / Antibiotic** — Reference lookup tables, seeded via `npm run seedall`.
- **Susceptibilidad** — Catalog of susceptibility categories (PRESENTE, RESISTENTE, SENSIBLE, INTERMEDIO) with associated colors.
- **Antimicrobiano** — Catalog of 73 unique antimicrobial agents, each with `tables Int[]` indicating which CLSI tables it appears in.
- **AntimicrobianoSusceptibilidad** — Junction table linking Antimicrobiano + Bacteria + Susceptibilidad. Unique on `[antimicrobianoId, bacteriaId]`.
- **StateGeoJson** — Mexican state boundaries as GeoJSON, used by OpenLayers maps.

PostgreSQL with `cuid()` primary keys. Foreign key constraints are enforced at the database level.

---

## Path alias

`~/` maps to `./app/` throughout the codebase (configured in `tsconfig.json`). So `import { db } from "~/server/database.server"` resolves to `app/server/database.server.ts`.

---

## Environment variables

Required in `.env` (see `.env-structure` for template):

```
DATABASE_URL="postgresql://..."    # PostgreSQL connection string
SESSION_SECRET="..."               # Random string for cookie signing
```

---

## Deployment

Deployed to Netlify. The `netlify.toml` runs `npx prisma generate && npm run build` on deploy. Static assets are fingerprinted and cached with `max-age=31536000, immutable`.

The Netlify adapter wraps Remix so it runs as Netlify Functions (serverless) rather than a long-running Node server.