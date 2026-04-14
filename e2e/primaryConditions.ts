import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { typeRandomData } from "./createRandom";
import { findByTextThenClick } from "./helpers";

export async function primaryConditions(
  page: Page,
  randomData: typeRandomData
) {
  let primaryCondition: string = randomData.randomPrimary;
  primaryCondition = "EDAS";
  let urlRegExp: RegExp;

  if (primaryCondition == "EDAS") {
    urlRegExp = /add\/define\/alpha\?vID=[a-f0-9]+&cID=[a-f0-9]+/;
  } else if (primaryCondition == "ITS") {
    urlRegExp = /add\/define\/its\?vID=[a-f0-9]+&cID=[a-f0-9]+/;
  } else if (primaryCondition == "IRAS") {
    urlRegExp = /add\/define\/iras\?vID=[a-f0-9]+&cID=[a-f0-9]+/;
  } else {
    urlRegExp = /add\/define\/alpha\?vID=[a-f0-9]+&cID=[a-f0-9]+/;
  }

  await findByTextThenClick(page, primaryCondition, "add/primary", urlRegExp);

  const url = page.url();
  const urlParams = new URL(url).searchParams;
  const vID = urlParams.get("vID");
  const cID = urlParams.get("cID");
  // Validate their format
  expect(vID).toMatch(/[a-f0-9]+/);
  expect(cID).toMatch(/[a-f0-9]+/);

  await page.screenshot({ path: "debug-after-primary.png", fullPage: true });
  return { primaryCondition, urlRegExp };
}
