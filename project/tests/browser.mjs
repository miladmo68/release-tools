import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import assert from "node:assert/strict";

const base = "/kestrel-motor-co", origin = "https://kestrel.test";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain", ".json": "application/json" };
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });

async function check(width, height, name) {
  const context = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, reducedMotion: "reduce" });
  const page = await context.newPage(), errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.route(`${origin}/**`, async route => {
    let path = decodeURIComponent(new URL(route.request().url()).pathname).replace(new RegExp(`^${base}`), "");
    if (path === "" || path === "/") path = "/index.html";
    if (path.endsWith("/")) path += "index.html";
    if (path.includes("..")) return route.fulfill({ status: 400 });
    try { await route.fulfill({ status: 200, contentType: mime[extname(path)] ?? "application/octet-stream", body: await readFile(join(process.cwd(), "out", path)) }); }
    catch { await route.fulfill({ status: 404, body: `Missing ${path}` }); }
  });
  assert.equal((await page.goto(`${origin}${base}/`, { waitUntil: "networkidle" }))?.status(), 200);
  await page.getByRole("heading", { name: /Shop by the monthly payment/i }).waitFor();
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "Skip to inventory");

  // fonts are self-hosted and applied
  const fonts = await page.evaluate(async () => { await document.fonts.ready; return [["Big Shoulders Display", 900], ["Instrument Sans", 400], ["JetBrains Mono", 400]].map(([f, w]) => document.fonts.check(`${w} 16px "${f}"`)); });
  assert.deepEqual(fonts, [true, true, true]);

  // budget drives the lot
  const total = await page.locator(".grid > li").count();
  assert.ok(total > 0);
  await page.locator("#budget").fill("150");
  await page.getByText("No cars match those filters.").waitFor();
  await page.getByRole("button", { name: /Clear filters and raise budget/ }).click();
  assert.equal(await page.locator(".grid > li").count(), 15);
  await page.locator("#budget").fill("450");
  const n450 = await page.locator(".grid > li").count();
  assert.ok(n450 > 0 && n450 < 15);
  await page.getByRole("button", { name: "72 mo" }).first().click();
  assert.ok(await page.locator(".grid > li").count() > n450);
  await page.getByRole("button", { name: "60 mo" }).first().click();

  // filters + search
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.locator("#budget").fill("900");
  await page.getByRole("button", { name: "SUV", exact: true }).click();
  assert.ok(await page.locator(".grid > li").count() >= 3);
  await page.getByRole("combobox", { name: "Fuel" }).selectOption("Hybrid");
  assert.ok(await page.locator(".grid > li").count() >= 1);
  await page.getByRole("combobox", { name: "Fuel" }).selectOption("all");
  await page.getByRole("searchbox", { name: "Search inventory" }).fill("zzzz");
  await page.getByText("No cars match those filters.").waitFor();
  await page.getByRole("searchbox", { name: "Search inventory" }).fill("");
  await page.getByRole("button", { name: "All", exact: true }).click();

  // sorting
  await page.getByRole("combobox", { name: "Sort" }).selectOption("mileage");
  const km = await page.locator(".grid .specs dd").evaluateAll(els => els.filter(e => e.textContent.includes(" km")).map(e => Number(e.textContent.replace(/[^0-9]/g, ""))));
  assert.deepEqual(km, [...km].sort((a, b) => a - b));
  await page.getByRole("combobox", { name: "Sort" }).selectOption("payment");

  // detail dialog: finance
  await page.getByRole("button", { name: /View details for 2021 Tessaro Pico/ }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByRole("heading", { name: /2021 Tessaro Pico/ }).waitFor();
  const before = await dlg.locator(".big-pay b").textContent();
  await dlg.getByRole("button", { name: "36 mo" }).click();
  assert.notEqual(await dlg.locator(".big-pay b").textContent(), before);
  await dlg.getByRole("slider", { name: /Down payment/ }).fill("6000");
  await dlg.getByRole("slider", { name: /Trade-in value/ }).fill("2000");
  await dlg.getByRole("slider", { name: /Interest rate/ }).fill("0");
  assert.match(await dlg.locator(".sum").textContent(), /Total interest\s*\$0/);

  // booking validation + success + calendar download
  await dlg.getByRole("tab", { name: "Book a test drive" }).click();
  await dlg.getByRole("button", { name: "Reserve this test drive" }).click();
  await dlg.getByRole("alert").getByText(/enter your name/i).waitFor();
  await dlg.getByLabel("Full name").fill("Sam Rivera");
  await dlg.getByLabel("Email").fill("not-an-email");
  await dlg.getByRole("button", { name: "Reserve this test drive" }).click();
  await dlg.getByRole("alert").getByText(/valid email/i).waitFor();
  await dlg.getByLabel("Email").fill("sam@example.com");
  await dlg.getByRole("button", { name: "Reserve this test drive" }).click();
  await dlg.getByRole("alert").getByText(/time slot/i).waitFor();
  await dlg.locator(".times button").first().click();
  await dlg.getByRole("button", { name: "Reserve this test drive" }).click();
  await dlg.getByRole("status").getByText(/on the schedule/i).waitFor();
  const [dl] = await Promise.all([page.waitForEvent("download"), dlg.getByRole("button", { name: "Add to calendar" }).click()]);
  assert.match(dl.suggestedFilename(), /^kestrel-test-drive-KV-\d{5}\.ics$/);
  await dlg.getByRole("button", { name: "Change time" }).click();
  await dlg.getByRole("button", { name: "Add to compare" }).click();
  await page.keyboard.press("Escape");
  await dlg.waitFor({ state: "hidden" });

  // compare tray (max 3) + dialog
  const compareButtons = page.getByRole("button", { name: /^Compare 20/ });
  await compareButtons.nth(1).click();
  await page.getByRole("button", { name: "Compare 2 cars" }).waitFor();
  await compareButtons.nth(2).click();
  await compareButtons.nth(3).click();
  await page.getByText(/up to three cars/).waitFor({ state: "attached" });
  assert.equal(await page.locator(".tray li").count(), 3);
  await page.getByRole("button", { name: "Compare 3 cars" }).click();
  const cmp = page.getByRole("dialog", { name: "Compare" });
  await cmp.getByRole("row", { name: /Monthly payment/ }).waitFor();
  assert.ok(await cmp.locator("td.win").count() > 0);
  await cmp.getByRole("button", { name: "Remove" }).first().click();
  await cmp.getByRole("button", { name: "Close comparison" }).click();
  await page.getByRole("button", { name: "Clear" }).click();
  assert.equal(await page.locator(".tray").count(), 0);

  // persistence
  await page.locator("#budget").fill("320");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("#budget").inputValue(), "320");

  // nav anchors
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "How it works" }).click();
  assert.equal(new URL(page.url()).hash, "#how");

  assert.equal(errors.length, 0, errors.join("; "));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `${name} horizontal overflow ${overflow}`);

  await page.evaluate(() => localStorage.clear());
  await page.goto(`${origin}${base}/`, { waitUntil: "networkidle" });
  await mkdir(join(process.cwd(), "public", "screenshots"), { recursive: true });
  if (name === "desktop") await page.setViewportSize({ width, height: 1060 });
  await page.screenshot({ path: join(process.cwd(), "public", "screenshots", `${name}.png`) });
  console.log(`${name} ${width}x${height}: budget, filters, sorting, finance, booking, calendar export, compare, persistence, fonts, overflow passed`);
  await context.close();
}
try { await check(1440, 900, "desktop"); await check(390, 844, "mobile"); }
finally { await browser.close(); }
