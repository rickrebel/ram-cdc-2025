import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { createRandom } from "./createRandom";

/** Base path de la app (debe coincidir con BASE_PATH en .env) */
export const BASE = "/rag";

/** Prefija una URL string con BASE. No modifica RegExp ni null. */
function withBase(
  url: string | RegExp | null
): string | RegExp | null {
  if (url === null || url instanceof RegExp) return url;
  return url.startsWith("/")
    ? BASE + url
    : BASE + "/" + url;
}

export async function findAndClickListitemLink(
  page: Page,
  linkText: string,
  beforeURL: string,
  afterURL: string
) {
  await page.waitForURL(withBase(beforeURL) as string);

  const link = page
    .getByRole("listitem")
    .filter({ hasText: linkText })
    .getByRole("link");

  // Check if the login link is visible
  await expect(link).toBeVisible({ timeout: 5000, visible: true });

  // Click the login link
  await link.click();

  await page.waitForURL(withBase(afterURL) as string);
}

export async function findByTextThenClick(
  page: Page,
  text: string,
  beforeURL: string | RegExp,
  afterURL: string | RegExp | null = null
) {
  const resolvedBefore = withBase(beforeURL)!;
  await Promise.all([
    page.waitForURL(resolvedBefore, {
      timeout: 10000,
    }),
    page.waitForLoadState("domcontentloaded"),
    expect(page).toHaveURL(resolvedBefore, { timeout: 10000 }),
  ]);

  // Find the item to be clicked.
  const item = page.getByText(text, { exact: true });

  // Check if the item is visible
  await expect(item).toBeVisible({ timeout: 5000, visible: true });

  await Promise.all([item.click(), page.waitForLoadState("domcontentloaded")]);

  if (afterURL) {
    const resolvedAfter = withBase(afterURL)!;
    await page.waitForURL(resolvedAfter, {
      timeout: 10000,
    });
    page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(resolvedAfter, { timeout: 10000 });
  }
}

export async function findByTextExpectVisible(
  page: Page,
  text: string,
  exact: boolean = true
) {
  // Find the item to be clicked.
  const item = page.getByText(text, { exact: exact });

  // Check if the login link is visible
  await expect(item).toBeVisible({ timeout: 5000, visible: true });
}

export async function enterCorrectLogin(
  page: Page,
  correctEmail: string,
  correctPassword: string,
  beforeURL: string
) {
  const randomData = createRandom();
  await page.waitForURL(withBase(beforeURL) as string);
  await page
    .locator('input[name="email"]')
    .pressSequentially(correctEmail, { delay: 100 });
  await page
    .locator('input[name="password"]')
    .pressSequentially(correctPassword, { delay: 100 });
  await page.selectOption('select[name="whichEstado"]', {
    label: randomData.randomState,
  });
  await page.waitForURL(withBase(beforeURL) as string);
}
