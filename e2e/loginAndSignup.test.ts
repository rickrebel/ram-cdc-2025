import { test, expect } from "@playwright/test";
import { createRandom } from "./createRandom";
import {
  enterCorrectLogin,
  findAndClickListitemLink,
  findByTextThenClick,
  findByTextExpectVisible,
} from "./helpers";

const correctEmail = "test@gmail.com";
const correctPassword = "Password$123";

test.describe.serial("Login and Signup Testing", () => {
  test("User can log in", async ({ browser }) => {
    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Login as the test user.
    await enterCorrectLogin(page, correctEmail, correctPassword, "auth");

    // Find and click the login button.
    await findByTextThenClick(page, "Iniciar sesión", "auth");

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/add/characteristics");
    await expect(page).toHaveURL("/add/characteristics");
  });

  test("User can sign up", async ({ browser }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    await page.fill('input[name="nombre"]', randomData.randomFirstName);
    await page.fill('input[name="apellidoPaterno"]', randomData.randomLastName);
    await page.fill('input[name="license"]', randomData.randomLicense);
    await page.fill('input[name="institution"]', randomData.randomInstitution);
    await page.selectOption('select[name="whichEstado"]', {
      label: randomData.randomState,
    });
    await page.fill('input[name="email"]', randomData.randomEmail);
    await page.fill('input[name="password"]', randomData.randomPassword);

    // Find and click the "Crear cuenta" button.
    await findByTextThenClick(page, "Crear cuenta", "auth?mode=signup");

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/add/characteristics");
    await expect(page).toHaveURL("/add/characteristics");
  });

  test("Sign up failure ill formed password", async ({ browser }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    await page.fill('input[name="nombre"]', randomData.randomFirstName);
    await page.fill('input[name="apellidoPaterno"]', randomData.randomLastName);
    await page.fill('input[name="license"]', randomData.randomLicense);
    await page.fill('input[name="institution"]', randomData.randomInstitution);
    await page.selectOption('select[name="whichEstado"]', {
      label: randomData.randomState,
    });
    await page.fill('input[name="email"]', randomData.randomEmail);
    await page.fill('input[name="password"]', "abc");

    // Find and click the "Crear cuenta" button.
    await findByTextThenClick(page, "Crear cuenta", "auth?mode=signup");

    // General: expect to see the error text in an alert.
    await expect(page.locator('li[role="alert"]')).toBeVisible();
    // Precise: expect to see the error text.
    await expect(page.locator('li[role="alert"]')).toHaveText(
      "La contraseña debe tener al menos 7 caracteres."
    );

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/auth?mode=signup");
    await expect(page).toHaveURL("/auth?mode=signup");
  });

  test("Sign up failure using an existing email", async ({ browser }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    await page.fill('input[name="nombre"]', randomData.randomFirstName);
    await page.fill('input[name="apellidoPaterno"]', randomData.randomLastName);
    await page.fill('input[name="license"]', randomData.randomLicense);
    await page.fill('input[name="institution"]', randomData.randomInstitution);
    await page.selectOption('select[name="whichEstado"]', {
      label: randomData.randomState,
    });
    await page.fill('input[name="email"]', "test@gmail.com");
    await page.fill('input[name="password"]', randomData.randomPassword);

    // Find and click the "Crear cuenta" button.
    await findByTextThenClick(page, "Crear cuenta", "auth?mode=signup");

    // General: expect to see the error text in an alert.
    await expect(page.locator('li[role="alert"]')).toBeVisible();
    // Precise: expect to see the error text.
    await expect(page.locator('li[role="alert"]')).toHaveText(
      "Ya existe una cuenta con la dirección de correo electrónico proporcionada."
    );

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/auth?mode=signup");
    await expect(page).toHaveURL("/auth?mode=signup");
  });

  test("Sign up failure using an existing Cédula profesional", async ({
    browser,
  }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    await page.fill('input[name="nombre"]', randomData.randomFirstName);
    await page.fill('input[name="apellidoPaterno"]', randomData.randomLastName);
    await page.fill('input[name="license"]', "123456");
    await page.fill('input[name="institution"]', randomData.randomInstitution);
    await page.selectOption('select[name="whichEstado"]', {
      label: randomData.randomState,
    });
    await page.fill('input[name="email"]', randomData.randomEmail);
    await page.fill('input[name="password"]', randomData.randomPassword);

    // Find and click the "Crear cuenta" button.
    await findByTextThenClick(page, "Crear cuenta", "auth?mode=signup");

    // General: expect to see the error text in an alert.
    await expect(page.locator('li[role="alert"]')).toBeVisible();
    // Precise: expect to see the error text.
    await expect(page.locator('li[role="alert"]')).toHaveText(
      "Ya existe una cuenta con la Cédula Profesional proporcionada."
    );

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/auth?mode=signup");
    await expect(page).toHaveURL("/auth?mode=signup");
  });

  test("Sign up failure using a Cédula profesional that is too long", async ({
    browser,
  }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    await page.fill('input[name="nombre"]', randomData.randomFirstName);
    await page.fill('input[name="apellidoPaterno"]', randomData.randomLastName);
    await page.fill('input[name="license"]', "12345456456");
    await page.fill('input[name="institution"]', randomData.randomInstitution);
    await page.selectOption('select[name="whichEstado"]', {
      label: randomData.randomState,
    });
    await page.fill('input[name="email"]', randomData.randomEmail);
    await page.fill('input[name="password"]', randomData.randomPassword);

    // Find and click the "Crear cuenta" button.
    await findByTextThenClick(page, "Crear cuenta", "auth?mode=signup");

    // General: expect to see the error text in an alert.
    await expect(page.locator('li[role="alert"]')).toBeVisible();
    // Precise: expect to see the error text.
    await expect(page.locator('li[role="alert"]')).toHaveText(
      "Por favor ingrese un válido Cédula profesional."
    );

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/auth?mode=signup");
    await expect(page).toHaveURL("/auth?mode=signup");
  });

  test("Sign up failure using a Cédula profesional that is too short", async ({
    browser,
  }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    await page.fill('input[name="nombre"]', randomData.randomFirstName);
    await page.fill('input[name="apellidoPaterno"]', randomData.randomLastName);
    await page.fill('input[name="license"]', "1234");
    await page.fill('input[name="institution"]', randomData.randomInstitution);
    await page.selectOption('select[name="whichEstado"]', {
      label: randomData.randomState,
    });
    await page.fill('input[name="email"]', randomData.randomEmail);
    await page.fill('input[name="password"]', randomData.randomPassword);

    // Find and click the "Crear cuenta" button.
    await findByTextThenClick(page, "Crear cuenta", "auth?mode=signup");

    // General: expect to see the error text in an alert.
    await expect(page.locator('li[role="alert"]')).toBeVisible();
    // Precise: expect to see the error text.
    await expect(page.locator('li[role="alert"]')).toHaveText(
      "Por favor ingrese un válido Cédula profesional."
    );

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/auth?mode=signup");
    await expect(page).toHaveURL("/auth?mode=signup");
  });

  test("User can navigate around various login, signup, about, and privacy pages", async ({
    browser,
  }) => {
    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Navigate to signup page and create a user
    await findByTextThenClick(page, "Crear un nuevo usuario", "auth");

    // Navigate back to login page.
    await findByTextThenClick(
      page,
      "Iniciar sesión con el usuario existente",
      "auth?mode=signup"
    );

    // Expect to be at "auth?mode=login" page.
    await page.waitForURL("/auth?mode=login");
    await expect(page).toHaveURL("/auth?mode=login");

    // Navigate to forgot password page.
    await findByTextThenClick(
      page,
      "¿Has olvidado tu contraseña?",
      "/auth?mode=login"
    );

    // Expect to be at "auth?mode=login" page.
    await page.waitForURL("/auth?mode=forgot-password");
    await expect(page).toHaveURL("/auth?mode=forgot-password");

    // Navigate back to login page.
    await findByTextThenClick(
      page,
      "Iniciar sesión",
      "/auth?mode=forgot-password"
    );

    // Expect to be at "auth?mode=login" page.
    await page.waitForURL("/auth?mode=login");
    await expect(page).toHaveURL("/auth?mode=login");

    // Navigate to about page via the Nav bar.
    await findAndClickListitemLink(
      page,
      "Sobre Nosotros",
      "/auth?mode=login",
      "/about"
    );

    // Expect to be at "about" page.
    await page.waitForURL("/about");
    await expect(page).toHaveURL("/about");

    // Navigate to privacy page on the footer.
    await findByTextThenClick(page, "Política de Privacidad", "/about");

    // Expect to be at "privacy" page.
    await page.waitForURL("/privacy");
    await expect(page).toHaveURL("/privacy");

    const aboutFooterLink = page.locator(
      'nav[aria-label="Footer"] a[href="/about"]'
    );
    await expect(aboutFooterLink).toBeVisible();
    await aboutFooterLink.click();
  });

  test("User can change the CSS theme", async ({ browser }) => {
    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Open the theme dropdown by clicking the button
    await page.locator('div[role="button"]').click();

    // Select the "Night" theme
    await page.locator('button[data-set-theme="night"]').click();

    // Expect the theme to be applied (assuming it updates `data-theme` on `<html>`)
    await expect(page.locator("html")).toHaveAttribute("data-theme", "night");

    // Select the "Coffee" theme
    await page.locator('div[role="button"]').click(); // Open the dropdown again
    await page.locator('button[data-set-theme="coffee"]').click();

    // Expect the new theme to be applied
    await expect(page.locator("html")).toHaveAttribute("data-theme", "coffee");
  });
});

test.describe.serial("Finding CURPs", () => {
  test("User can login and find an existing CURP to work with", async ({
    browser,
  }) => {
    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Login as the test user.
    await enterCorrectLogin(page, correctEmail, correctPassword, "auth");

    // Find and click the login button.
    await findByTextThenClick(page, "Iniciar sesión", "auth");

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/add/characteristics");
    await expect(page).toHaveURL("/add/characteristics");

    // Type in a CURP.
    // "delay" here represents the time to wait between key presses in milliseconds. Defaults to 0.
    await page
      .locator('input[name="curpSearch"]')
      .pressSequentially("AAAA000000AAAAAA00", { delay: 100 });

    // Wait for the CURP details to be shown to the user.
    await page.waitForSelector("data-testid=existing-clinico", {
      timeout: 5000,
    });

    // Expect the CURP details to be shown to the user.
    await findByTextExpectVisible(page, "Detalles del paciente");
    await findByTextExpectVisible(page, "basado en CURP seleccionado");
    await findByTextExpectVisible(page, "CURP: AAAA000000AAAAAA00");
    await findByTextExpectVisible(page, "Fecha de naciamento: 01/03/1990");
    await findByTextExpectVisible(page, "Sex al nacer: Mujer");
    await findByTextExpectVisible(page, "Primera visita: 13/02/2025");
    await findByTextExpectVisible(page, "¿Es este el paciente que visita?");
  });

  test("User login, find an existing CURP, clicks cancel", async ({
    browser,
  }) => {
    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Login as the test user.
    await enterCorrectLogin(page, correctEmail, correctPassword, "auth");

    // Find and click the login button.
    await findByTextThenClick(page, "Iniciar sesión", "auth");

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/add/characteristics");
    await expect(page).toHaveURL("/add/characteristics");

    // Type in a CURP.
    // "delay" here represents the time to wait between key presses in milliseconds. Defaults to 0.
    await page
      .locator('input[name="curpSearch"]')
      .pressSequentially("AAAA000000AAAAAA00", { delay: 100 });

    // Wait for the CURP details to be shown to the user.
    await page.waitForSelector("data-testid=existing-clinico", {
      timeout: 5000,
    });

    // Expect the CURP details to be shown to the user.
    await findByTextExpectVisible(page, "Detalles del paciente");
    await findByTextExpectVisible(page, "basado en CURP seleccionado");
    await findByTextExpectVisible(page, "CURP: AAAA000000AAAAAA00");
    await findByTextExpectVisible(page, "Fecha de naciamento: 01/03/1990");
    await findByTextExpectVisible(page, "Sex al nacer: Mujer");
    await findByTextExpectVisible(page, "Primera visita: 13/02/2025");
    await findByTextExpectVisible(page, "¿Es este el paciente que visita?");

    // Find and click the cancel button.
    await findByTextThenClick(page, "Cancelar", "add/characteristics");

    // Wait for the CURP details to not be shown.
    await page.waitForSelector("data-testid=existing-clinico", {
      state: "detached",
      timeout: 5000,
    });
  });

  test("User can login and enter a new CURP to work with", async ({
    browser,
  }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Login as the test user.
    await enterCorrectLogin(page, correctEmail, correctPassword, "auth");

    // Find and click the login button.
    await findByTextThenClick(page, "Iniciar sesión", "auth");

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/add/characteristics");
    await expect(page).toHaveURL("/add/characteristics");

    // Type in a CURP.
    // "delay" here represents the time to wait between key presses in milliseconds. Defaults to 0.
    const randomCurp = randomData.randomCURP;
    await page
      .locator('input[name="curpSearch"]')
      .pressSequentially(randomCurp, { delay: 100 });

    // Wait for the CURP details to be shown to the user.
    await page.waitForSelector("data-testid=new-clinico", {
      timeout: 5000,
    });

    // Expect the CURP details to be shown to the user.
    await findByTextExpectVisible(page, "¿Es este un nuevo paciente?");
    await findByTextExpectVisible(page, "basado en CURP seleccionado");

    const item = page
      .locator("p")
      .filter({ hasText: "¿Le gustaría crear un nuevo paciente con CURP" });
    await expect(item).toBeVisible({ timeout: 5000 });

    const newCurp = page.locator("p").filter({ hasText: randomCurp });
    await expect(newCurp).toBeVisible({ timeout: 5000 });
  });

  test("User login, enter a new CURP, clicks cancel", async ({ browser }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto("/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Login as the test user.
    await enterCorrectLogin(page, correctEmail, correctPassword, "auth");

    // Find and click the login button.
    await findByTextThenClick(page, "Iniciar sesión", "auth");

    // Expect to be redirected to "add/characteristics" page.
    await page.waitForURL("/add/characteristics");
    await expect(page).toHaveURL("/add/characteristics");

    // Type in a CURP.
    // "delay" here represents the time to wait between key presses in milliseconds. Defaults to 0.
    const randomCurp = randomData.randomCURP;
    await page
      .locator('input[name="curpSearch"]')
      .pressSequentially(randomCurp, { delay: 100 });

    // Wait for the CURP details to be shown to the user.
    await page.waitForSelector("data-testid=new-clinico", {
      timeout: 5000,
    });

    // Expect the CURP details to be shown to the user.
    await findByTextExpectVisible(page, "¿Es este un nuevo paciente?");
    await findByTextExpectVisible(page, "basado en CURP seleccionado");

    const item = page
      .locator("p")
      .filter({ hasText: "¿Le gustaría crear un nuevo paciente con CURP" });
    await expect(item).toBeVisible({ timeout: 5000 });

    const newCurp = page.locator("p").filter({ hasText: randomCurp });
    await expect(newCurp).toBeVisible({ timeout: 5000 });

    // Find and click the cancel button.
    await findByTextThenClick(page, "Cancelar", "add/characteristics");

    // Wait for the CURP details to not be shown.
    await page.waitForSelector("data-testid=new-clinico", {
      state: "detached",
      timeout: 5000,
    });
  });
});
