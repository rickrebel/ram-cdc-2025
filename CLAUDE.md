# RAM-CDC-2025

Clinical surveillance platform for antibiotic resistance in Mexico (SSA). Two modules: patient registration with diagnostic algorithms (IRAS, ITS, IVU, EDAS) and InDRE resistome surveillance (bacteria, susceptibility, resistance genes).

## Developer context

The developer is **not** fluent in React, Remix, or Zustand. When explaining non-trivial code blocks, walk through the logic section by section. Name patterns explicitly (e.g., "this is a Remix loader", "this is a Zustand store").

## Commands

```bash
npm run dev          # Vite dev server at localhost:5173
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc (no emit)
npm run test         # Vitest (test/)
npx playwright test  # E2E (e2e/)
npx prisma generate  # Regenerate client after schema changes
npx prisma studio    # Visual DB browser
npm run seedall      # Seed all reference tables
npm run createuser   # Create a Profile (interactive)
```

## Architecture

- **Routing:** `_app.*` routes require auth (`requireUserSession()` in loader); `_public.*` are open. Server-only files use `.server.ts` suffix.
- **Patient flow:** multi-step form under `_app.add._new/` — see files there for sequence.
- **Styling:** Tailwind CSS 3 + DaisyUI 4 component classes.
- **Maps:** OpenLayers 10 with `StateGeoJson` for state boundaries.
- **State:** Zustand stores in `app/state/store.ts` (being migrated to URL params + loaders).
- **DB schema:** see `prisma/schema.prisma` (models documented with `///` comments). PostgreSQL, `cuid()` PKs.
- **Path alias:** `~/` → `./app/` (tsconfig.json).

## Gotchas

- **Patch activo:** `patches/@remix-run+react+2.15.3.patch` fixes basename bug in `singleFetchUrl()` ([remix-run/remix#10212](https://github.com/remix-run/remix/issues/10212)). Goes away with React Router v7 migration — see `docs/MIGRATION-RR7.md`.
- **Env vars:** see `.env-structure` for required `DATABASE_URL` and `SESSION_SECRET`.
- **Deploy:** Netlify serverless via `@netlify/remix-adapter`. Build: `npx prisma generate && npm run build`.

## Docs

- `docs/ONBOARDING.md` — stack technologies in this project
- `docs/PLATAFORMA.md` — clinical/epidemiological context