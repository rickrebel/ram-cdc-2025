import { test, expect } from "@playwright/test";
import { createRandom } from "./createRandom";
import {
  BASE,
  enterCorrectLogin,
  findAndClickListitemLink,
  findByTextThenClick,
  findByTextExpectVisible,
} from "./helpers";
import { edasSecondaryConditions } from "./edasSecondaryConditions";
import { primaryConditions } from "./primaryConditions";

const correctEmail = "test@gmail.com";
const correctPassword = "Password$123";

test.describe.serial("Finding CURPs", () => {
  test("User can create new @clinico", async ({ browser }) => {
    const randomData = createRandom();

    // Create a new browser context to ensure a fresh session.
    const context = await browser.newContext();
    // Open a new page within that context.
    const page = await context.newPage();
    await page.goto(BASE + "/");

    // Navigate to "Acceso" page.
    await findAndClickListitemLink(page, "Acceso", "/", "auth");

    // Login as the test user.
    await enterCorrectLogin(page, correctEmail, correctPassword, "auth");

    // Find and click the login button and expect to be redirected to "add/characteristics" page.
    await findByTextThenClick(
      page,
      "Iniciar sesión",
      "auth",
      "add/characteristics"
    );

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

    let item = page
      .locator("p")
      .filter({ hasText: "¿Le gustaría crear un nuevo paciente con CURP" });
    await expect(item).toBeVisible({ timeout: 5000 });

    const newCurp = page.locator("p").filter({ hasText: randomCurp });
    await expect(newCurp).toBeVisible({ timeout: 5000 });

    // Find and click the continue button.
    await findByTextThenClick(
      page,
      "Continuar",
      "add/characteristics",
      `add/characteristics/create?curp=${randomCurp}`
    );

    await page.fill(
      'input[name="dob"]',
      randomData.randomDateInPast.toISOString().slice(0, 10)
    );
    const sexonacer = randomData.randomSexoNacer;
    await page.selectOption('select[name="sexonacer"]', {
      label: sexonacer,
    });
    await page.selectOption('select[name="genero"]', {
      label: randomData.randomGenero,
    });

    await page.fill('input[name="peso"]', randomData.randomPeso);
    await page.fill('input[name="talla"]', randomData.randomTalla);

    if (randomData.randomYesNoDynamic() === "Sí") {
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="diabetes"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="inmunosupresion"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="cardiovasculares"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="hasRenalIssues"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="hepaticos"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí" && sexonacer === "Mujer") {
        await page.locator('input[name="embarazo"]').check();
      }
    }

    if (randomData.randomYesNoDynamic() === "Sí") {
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="penicilinas"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="quinolonas"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="macrolidos"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="cefalosporinas"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="tetraciclinas"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="sulfonamidas"]').check();
      }
      if (randomData.randomYesNoDynamic() === "Sí") {
        await page.locator('input[name="aminoglucosidos"]').check();
      }
    }

    await page.selectOption('select[name="hospitalized"]', {
      label: randomData.randomYesNoDynamic(),
    });
    await page.selectOption('select[name="takenMedication"]', {
      label: randomData.randomYesNoDynamic(),
    });
    await page.selectOption('select[name="disability"]', {
      label: randomData.randomYesNoDynamic(),
    });
    const isMigrant = randomData.randomYesNoDynamic();
    await page.selectOption('select[name="migrant"]', {
      label: isMigrant,
    });
    if (isMigrant === "Sí") {
      await page.waitForSelector("#countrySelection", {
        state: "visible",
        timeout: 10000,
      });

      // Convert "randomData.setMigrationCountries" to an array.
      await page.selectOption(
        'select[name="countriesMigration"]',
        randomData.migrationCountries
      );

      // Verify the selections
      const selectedOptions = await page
        .locator('select[name="countriesMigration"] option:checked')
        .allTextContents();

      // Confirm that the selected options match the expected options - the order may vary.
      expect(selectedOptions.sort()).toEqual(
        randomData.migrationCountries.sort()
      );
    }
    await page.selectOption('select[name="indigenous"]', {
      label: randomData.randomYesNoDynamic(),
    });
    await page.selectOption('select[name="afrodescendant"]', {
      label: randomData.randomYesNoDynamic(),
    });

    // Find and click the "Guardar" button.
    await findByTextThenClick(
      page,
      "Guardar",
      `add/characteristics/create?curp=${randomCurp}`
    );

    // Ensure "Guardar" is replaced by "Actualizar"
    await page.waitForSelector('button:has-text("Actualizar")', {
      timeout: 15000,
    });

    await page.screenshot({ path: "debug-after-guardar.png", fullPage: true });

    // Find and click the "Siguiente" button. Notice that after coming back from the
    // server-side to the client-side, that the URL is now "add/characteristics/create".
    await findByTextThenClick(
      page,
      "Siguiente",
      "add/characteristics/create",
      "add/primary"
    );

    // Choose the primary condition.
    const { primaryCondition, urlRegExp } = await primaryConditions(
      page,
      randomData
    );

    // Choose the secondary conditions based on the primary condition.
    if (primaryCondition == "EDAS") {
      await edasSecondaryConditions(page, randomData, urlRegExp);
    }
  });
});
