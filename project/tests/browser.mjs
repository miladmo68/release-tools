import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const baseURL = "http://127.0.0.1:4173/tandem-device-studio/";
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], { stdio: "inherit" });

async function ready() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try { if ((await fetch(baseURL)).ok) return; } catch { /* wait for preview */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("Production preview did not start");
}

async function noOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  assert.equal(overflow, false, `${label} has horizontal overflow`);
}

async function imagesLoaded(page) {
  await page.locator(".hero-art img").waitFor();
  assert.equal(await page.locator(".hero-art img").evaluate((image) => image.complete && image.naturalWidth > 0), true, "Hero photograph is missing");
  await page.locator("#service img").scrollIntoViewIfNeeded();
  assert.equal(await page.locator("#service img").evaluate((image) => image.complete && image.naturalWidth > 0), true, "Service photograph is missing");
}

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await imagesLoaded(page);
  await page.getByRole("button", { name: "How it works" }).click();
  assert.equal(await page.getByRole("dialog", { name: /A repair plan/ }).isVisible(), true);
  assert.equal(await page.getByRole("button", { name: "Close dialog" }).evaluate((button) => button === document.activeElement), true, "Dialog should receive keyboard focus");
  await page.keyboard.press("Shift+Tab");
  assert.equal(await page.getByRole("button", { name: "Got it" }).evaluate((button) => button === document.activeElement), true, "Dialog should trap reverse tabbing");
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0, "Escape should close the dialog");
  await page.getByRole("button", { name: "Saved plans" }).click();
  await page.getByText("Nothing on the bench yet.").waitFor();
  await page.getByRole("button", { name: /Start a repair/ }).last().click();
  await page.getByRole("button", { name: "Laptop", exact: true }).click();
  assert.equal(await page.locator(".device-card").count(), 1);
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await page.getByRole("button", { name: /Compact phone/ }).click();
  await page.getByRole("button", { name: /Continue to symptoms/ }).click();
  await page.getByRole("button", { name: /Cracked display/ }).click();
  await page.getByRole("button", { name: /Short battery life/ }).click();
  await page.getByRole("button", { name: /See my estimate/ }).click();
  assert.equal(await page.locator(".estimate-line").count(), 2, "Estimate must itemise both issues");
  await noOverflow(page, "Desktop estimate");
  await page.getByRole("button", { name: "Plan a visit", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: /Wednesday window 11:00 AM/ }).isDisabled(), true, "Full demo window must be disabled");
  await page.getByRole("button", { name: /Save visit preview/ }).click();
  await page.getByRole("alert").getByText(/window/i).waitFor();
  await page.getByRole("button", { name: /Tuesday window 2:00 PM/ }).click();
  await page.getByLabel("Your name").fill("Avery Chen");
  await page.getByLabel("Email for this draft").fill("avery@example.com");
  await page.getByRole("button", { name: /Save visit preview/ }).click();
  await page.getByText("Your plan is ready.").waitFor();
  await noOverflow(page, "Desktop confirmation");
  await page.getByRole("button", { name: /Plan another repair/ }).click();
  assert.equal(await page.getByRole("button", { name: /Tuesday window 2:00 PM/ }).isDisabled(), true, "Local draft should consume one demo opening");
  await page.getByRole("button", { name: "Saved plans" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download plan/ }).click();
  const savedFile = await download;
  assert.match(savedFile.suggestedFilename(), /^td-.*-repair-plan\.json$/);
  const exported = JSON.parse(await readFile(await savedFile.path(), "utf8"));
  assert.equal(exported.deviceId, "phone-02");
  assert.equal(exported.symptoms.length, 2);
  assert.equal(exported.status, "draft");
  await page.getByRole("button", { name: "Remove draft" }).click();
  await page.getByText("Nothing on the bench yet.").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button", { name: /Tuesday window 2:00 PM/ }).isEnabled(), true, "Removing a draft must release its demo window");
  await page.evaluate(() => localStorage.setItem("tandem.visit-plans.v1", "broken-json"));
  await page.getByRole("button", { name: "Saved plans" }).click();
  await page.getByText("Nothing on the bench yet.").waitFor();
  await page.keyboard.press("Escape");
  await page.evaluate(() => localStorage.clear());
  await page.getByRole("link", { name: "Our approach" }).click();
  assert.equal(await page.getByRole("heading", { name: /Less mystery/ }).isVisible(), true);
  await page.getByRole("button", { name: /Back to the workbench/ }).click();
  await noOverflow(page, "Desktop");
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.screenshot({ path: "public/screenshots/desktop.png", fullPage: true });
  await context.close();
}

async function phone(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await imagesLoaded(page);
  await page.getByRole("button", { name: "Saved plans" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Explore your repair/ }).click();
  await page.getByRole("button", { name: "Tablet", exact: true }).click();
  await page.getByRole("button", { name: /Continue to symptoms/ }).click();
  await page.getByRole("button", { name: /Charging trouble/ }).click();
  await page.getByRole("button", { name: /See my estimate/ }).click();
  await page.getByRole("button", { name: "Plan a visit", exact: true }).click();
  await page.getByRole("button", { name: /Thursday window 9:30 AM/ }).click();
  await page.getByLabel("Your name").fill("Jordan Lee");
  await page.getByLabel("Email for this draft").fill("jordan@example.com");
  await page.getByRole("button", { name: /Save visit preview/ }).click();
  await page.getByText("Your plan is ready.").waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Saved plans" }).click();
  await page.getByText("Family tablet").last().waitFor();
  await page.keyboard.press("Escape");
  await noOverflow(page, "Phone");
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.locator("h1").click();
  await page.screenshot({ path: "public/screenshots/mobile.png", fullPage: true });
  await context.close();
}

try {
  await ready();
  const browser = await chromium.launch({ headless: true });
  try { await mkdir("public/screenshots", { recursive: true }); await desktop(browser); await phone(browser); }
  finally { await browser.close(); }
  console.log("Desktop and phone repair journeys passed; screenshots captured.");
} finally { server.kill("SIGTERM"); }
