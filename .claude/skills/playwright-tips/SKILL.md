---
name: playwright-tips
description: Workarounds and patterns for testing RAM-CDC with Playwright MCP.
  Use when asked to navigate the app, test flows, or interact with the browser.
---

# Playwright MCP — Tips for RAM-CDC

## Workflow: MCP ↔ e2e tests

Follow these 3 phases each time Playwright MCP is used to test an
app flow.

### Phase 1 — Pre-MCP: review existing coverage

Before opening the browser:

1. Read the `e2e/*.test.ts` files and check whether the flow to be
   tested already has coverage.
2. If a test covers the scenario, **run that test**
   (`npx playwright test <file>`) instead of using MCP.
3. If the test exists but is incomplete or broken, note what's
   missing and use MCP only to explore the uncovered part.
4. If there is no coverage, proceed with MCP.

### Phase 2 — During MCP: record interactions

While navigating with MCP, keep mental notes of:

- Which URLs were visited and in what order
- Which fields were filled and with what values
- What was verified visually (text, elements, redirects)
- Which workarounds were needed (React inputs, react-select, etc.)
- Bugs or unexpected behavior found

### Phase 3 — Post-MCP: evaluate and generate e2e tests

After finishing the exploration with MCP, evaluate:

- **Was a flow discovered that has no e2e test?** → Propose
  generating one.
- **Was a bug found that should have a regression test?** → Propose
  a test that reproduces it.
- **Is an existing test incomplete?** → Propose updating it.
- **Was the exploration one-off with no repeatable value?** → Don't
  generate a test, just report findings.

Ask the user before generating or modifying tests. The user reviews
and approves changes in PyCharm.

## Project e2e conventions

Tests live in `e2e/` and run with `npx playwright test`. Follow
these patterns when generating or modifying tests:

### File structure

- Tests: `e2e/<descriptiveName>.test.ts`
- Shared helpers: `e2e/helpers.ts` (reusable navigation and
  verification functions)
- Random data: `e2e/createRandom.ts` (uses `@faker-js/faker`)
- Per-module helpers: `e2e/<module>.ts` (e.g. `primaryConditions.ts`,
  `edasSecondaryConditions.ts`)

### Patterns to follow

```ts
// Standard imports
import { test, expect } from "@playwright/test";
import { createRandom } from "./createRandom";
import { enterCorrectLogin, findAndClickListitemLink,
         findByTextThenClick, findByTextExpectVisible } from "./helpers";

// Group related tests with serial (guaranteed order)
test.describe.serial("Group name", () => {
  test("case description", async ({ browser }) => {
    // Always create fresh context for a clean session
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/");
    // ...
  });
});
```

### Available helpers (in `e2e/helpers.ts`)

| Function | Use |
|---|---|
| `findAndClickListitemLink(page, text, beforeURL, afterURL)` | Click a link inside a listitem, wait for navigation |
| `findByTextThenClick(page, text, beforeURL, afterURL?)` | Find text, click it, optionally wait for target URL |
| `findByTextExpectVisible(page, text, exact?)` | Verify that a text is visible |
| `enterCorrectLogin(page, email, password, beforeURL)` | Fill login form (email, password, state) |

### Test data

- Existing user: `test@gmail.com` / `Password$123`
- Existing CURP: `AAAA000000AAAAAA00`
- For random data: use `createRandom()`, which generates CURP,
  names, passwords, states, etc. in valid format.

### When adding new fields to `createRandom.ts`

If a test needs random data that doesn't exist in `typeRandomData`,
add the field to the interface and to the `createRandom()` function
following the same pattern.

---

## Key tools

| Tool | Use |
|---|---|
| `browser_navigate` | Open URLs |
| `browser_snapshot` | Capture accessible DOM (prefer over screenshot) |
| `browser_click` | Click by ref from the snapshot |
| `browser_fill_form` | Fill multiple fields at once |
| `browser_run_code` | Run Playwright JS directly — the most flexible |
| `browser_type` | Type text, has `slowly: true` option |

## General workarounds

### React-controlled inputs
When `browser_type` or `browser_click` fail with "ref not found" on
inputs controlled by React (custom combobox, react-select), use
`browser_run_code`:

```js
async (page) => {
  const input = page.getByPlaceholder('field placeholder');
  await input.clear();
  await input.type('value', { delay: 50 });
}
```

The `delay` is needed so React detects the keystroke events.

### react-select dropdowns
- Open: `page.locator('#react-select-N-input').click()`
- Select: `page.getByText('partial text', { exact: false }).click()`
- Multi-select: open and click repeatedly.

## Known bug

After creating a new account, it redirects to `/rag/rag/...` (double
prefix). Manually navigate to the correct URL without the double
`/rag/`.

## Test user

| Field | Value |
|---|---|
| Email | `claudio.neuronal@ejemplo.com` |
| Password | `ClaudIA2025!` |

## Test CURP

Format: 4 letters + 6 date digits + H/M + 2 state letters + 3
consonants + 2 digits. Example: `NEUC900101HDFRAI09`

## References by module

| Module | File | Description |
|---|---|---|
| Auth | [references/auth-registro.md](references/auth-registro.md) | Signup and login flow |
| New registration | [references/nuevo-registro.md](references/nuevo-registro.md) | 4-step patient registration flow |