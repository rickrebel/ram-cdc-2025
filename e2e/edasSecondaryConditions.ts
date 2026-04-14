import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { typeRandomData } from "./createRandom";
import { findByTextThenClick, findByTextExpectVisible } from "./helpers";

export async function edasSecondaryConditions(
  page: Page,
  randomData: typeRandomData,
  urlRegExp: RegExp
) {
  if (
    randomData.EDASSecondaryConditions.includes(
      "Ninguno(a) - No se muestra ninguno de los síntomas anteriores."
    )
  ) {
    await page
      .locator(
        'input[name="Ninguno(a) - No se muestra ninguno de los síntomas anteriores."]'
      )
      .check();
  } else {
    for (const condition of randomData.EDASSecondaryConditions) {
      const checkbox = page.locator(`input[name="${condition}"]`);
      await checkbox.check();
      await expect(checkbox).toBeChecked(); // Ensure it is actually checked
    }
    if (
      randomData.EDASSecondaryConditions.includes(
        "Diarrea - Cuántas evacuaciones en 24 horas."
      )
    ) {
      // Wait for input field to appear and become editable
      page.waitForLoadState("domcontentloaded");
      // Wait for input field to appear and become editable
      await page.waitForSelector('input[name="evacuaciones"]', {
        state: "visible",
        timeout: 10000,
      });
      const evacInput = page.locator('input[name="evacuaciones"]');
      await expect(evacInput).toBeVisible({ timeout: 5000 });
      await expect(evacInput).toBeEditable({ timeout: 5000 }); // Ensure it's interactable

      await evacInput.fill(randomData.randomEvacuaciones);

      await expect(evacInput).toHaveValue(randomData.randomEvacuaciones); // Ensure value is set
    }
    if (
      randomData.EDASSecondaryConditions.includes(
        "Vómito - Cuántos vómitos en 24 horas."
      )
    ) {
      // Wait for input field to appear and become editable
      page.waitForLoadState("domcontentloaded");
      await page.waitForSelector('input[name="vomitos"]', {
        state: "visible",
        timeout: 10000,
      });

      const vomInput = page.locator('input[name="vomitos"]');
      await expect(vomInput).toBeVisible({ timeout: 5000 });
      await expect(vomInput).toBeEditable({ timeout: 5000 }); // Ensure it's interactable

      await vomInput.fill(randomData.randomVomitos);

      await expect(vomInput).toHaveValue(randomData.randomVomitos); // Ensure value is set
    }
  }

  page.waitForLoadState("domcontentloaded");
  await page.screenshot({ path: "debug-after-EDAS.png", fullPage: true });
  await findByTextThenClick(
    page,
    "Siguiente",
    urlRegExp,
    /add\/revise\?vID=[a-f0-9]+&cID=[a-f0-9]+/
  );
  await findByTextExpectVisible(page, "Resumen del Paciente");
}
