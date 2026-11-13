// Playwright helpers for driving a verification instance like a phone user.
// Used by smoke.mjs and by the per-task checks in .flow/<slug>/check.mjs:
//
//   import { openDriver } from "../../scripts/verify/driver.mjs";
//   const app = await openDriver({ id: "before" });
//   await app.goto("/recipes");
//   await app.hydrated(page.getByRole("heading", { name: "Opskrifter" }));
//   ...
//   await app.shot("recipes-list");
//   await app.close();          // returns { problems, evidence }
import path from "node:path";
import { chromium } from "playwright";
import { evidenceDir, readInstance } from "./lib.mjs";

export async function openDriver({ id, viewport = { width: 390, height: 844 } }) {
  const instance = readInstance(id);
  if (instance.status !== "ready") throw new Error(`Instance ${id} is ${instance.status}`);
  const dir = evidenceDir(id);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport, locale: "da-DK" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Console errors, uncaught exceptions and failing API calls all count as
  // problems a check should report, even when the page looks fine.
  const problems = [];
  const where = () => page.url().replace(instance.url, "");
  page.on("console", (message) => {
    if (message.type() === "error" || /hydrat/i.test(message.text())) {
      problems.push(`[${where()}] console: ${message.text().slice(0, 300)}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`[${where()}] pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.url().includes("/api/") && response.status() >= 400) {
      problems.push(`HTTP ${response.status()} ${response.url().replace(instance.url, "")}`);
    }
  });

  return {
    page,
    url: instance.url,
    goto: (route) => page.goto(instance.url + route),
    // React marks hydrated DOM nodes with a __reactFiber$... property. Until it
    // is there the page is server HTML only: inputs ignore typing and hydration
    // warnings have not been reported. Wait for it before asserting either.
    // Re-finds the element on every poll, in case React replaced the server DOM.
    hydrated: async (locator, timeout = 30000) => {
      const isHydrated = () =>
        locator
          .first()
          .evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactFiber")))
          .catch(() => false);
      const deadline = Date.now() + timeout;
      while (!(await isHydrated())) {
        if (Date.now() > deadline) throw new Error(`Not hydrated after ${timeout} ms`);
        await page.waitForTimeout(100);
      }
    },
    api: async (route, init) => {
      const response = await fetch(instance.url + route, init);
      return response.json();
    },
    shot: async (name) => {
      const file = path.join(dir, `${name}.png`);
      await page.screenshot({ path: file });
      return file;
    },
    close: async () => {
      await browser.close();
      return { problems, evidence: dir };
    },
  };
}
