import { test, expect } from "@playwright/test";
import {
  BASE,
  enterCorrectLogin,
  findAndClickListitemLink,
  findByTextThenClick,
} from "./helpers";

const correctEmail = "test@gmail.com";
const correctPassword = "Password$123";

// Rutas _app: comparten el AppNavigation con navbar autenticado.
// Se pueden recorrer en secuencia sin perder el navbar.
const appLinks = [
  { name: "Añadir Nuevo Registro", href: "/add/characteristics" },
  { name: "InDRE", href: "/indre" },
  { name: "Analizar Resultados", href: "/analyse" },
  { name: "Capacitación", href: "/training" },
];

// Rutas _public: usan PublicNavigation, así que al navegar
// se pierde el navbar de _app. Se prueban por separado.
const publicLinks = [
  { name: "Sobre Nosotros", href: "/about" },
];

test.describe("Navbar navigation after login", () => {
  test("App navbar links load without ErrorBoundary", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE + "/");

    // Login
    await findAndClickListitemLink(page, "Acceso", "/", "auth");
    await enterCorrectLogin(
      page, correctEmail, correctPassword, "auth"
    );
    await findByTextThenClick(page, "Iniciar sesión", "auth");
    await page.waitForURL(BASE + "/add/characteristics");

    for (const link of appLinks) {
      // Click the navbar link text inside the desktop menu
      const navBtn = page
        .locator(".navbar-center menu.menu-horizontal")
        .getByText(link.name, { exact: true });
      await expect(navBtn).toBeVisible({ timeout: 5000 });
      await navBtn.click();

      // Wait for navigation
      const expectedURL = BASE + link.href;
      await page.waitForURL(expectedURL, { timeout: 10000 });
      await expect(page).toHaveURL(expectedURL);

      // Verify no ErrorBoundary rendered
      await expect(
        page.getByText("An error occurred")
      ).not.toBeVisible();
    }

    await context.close();
  });

  test("Public navbar links load without ErrorBoundary", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE + "/");

    // Login
    await findAndClickListitemLink(page, "Acceso", "/", "auth");
    await enterCorrectLogin(
      page, correctEmail, correctPassword, "auth"
    );
    await findByTextThenClick(page, "Iniciar sesión", "auth");
    await page.waitForURL(BASE + "/add/characteristics");

    for (const link of publicLinks) {
      // Navigate directly — these routes use PublicNavigation
      await page.goto(BASE + link.href);
      await page.waitForURL(BASE + link.href, {
        timeout: 10000,
      });
      await expect(page).toHaveURL(BASE + link.href);

      // Verify no ErrorBoundary rendered
      await expect(
        page.getByText("An error occurred")
      ).not.toBeVisible();
    }

    await context.close();
  });
});