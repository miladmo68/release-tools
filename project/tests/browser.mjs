import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const baseURL = "http://127.0.0.1:4173/sable-sky-hotel/";
const server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", "4173"], { stdio: "inherit" });
const expect = (condition, message) => { if (!condition) throw new Error(message); };
const date = days => { const value = new Date(); value.setDate(value.getDate() + days); return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`; };

async function ready() {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(baseURL)).ok) return; } catch { /* preview is starting */ }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error("Production preview did not start.");
}

async function inspect(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(!overflow, `${label} has horizontal overflow`);
  const images = await page.locator("img").count();
  expect(images === 0, `${label} unexpectedly depends on external images`);
}

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  expect(await page.locator(".room-card").count() === 6, "Six room categories should render");
  await page.getByRole("link", { name: "Our rooms" }).click();
  expect(page.url().endsWith("#rooms"), "Rooms navigation should work");
  await page.getByRole("link", { name: "The house" }).click();
  expect(page.url().endsWith("#house"), "House navigation should work");
  await page.getByRole("link", { name: /Plan your stay/ }).click();
  expect(page.url().endsWith("#stay-finder"), "Stay navigation should work");

  await page.getByLabel("Sort").selectOption("space");
  expect(await page.locator(".room-card h3").first().textContent() === "Sable Residence", "Space sort should work");
  await page.getByLabel("Sort").selectOption("price");
  expect(await page.locator(".room-card h3").first().textContent() === "Harbour Room", "Price sort should work");
  await page.getByLabel("Sort").selectOption("featured");
  await page.getByLabel("CHECK IN").fill(date(-1));
  await page.getByRole("button", { name: /Find a room/ }).click();
  await page.getByText("Arrival must be today or later.").waitFor();
  await page.getByLabel("CHECK IN").fill(date(2));
  await page.getByLabel("CHECK OUT").fill(date(4));
  await page.getByLabel("GUESTS").selectOption("4");
  await page.getByRole("button", { name: /Find a room/ }).click();
  expect(await page.locator(".room-card").count() === 1, "Party size should filter room inventory");
  await page.getByLabel("GUESTS").selectOption("2");
  await page.getByRole("button", { name: /Find a room/ }).click();
  await page.locator(".room-card").first().getByRole("button", { name: /Explore room/ }).click();
  expect(await page.locator("#detail-title").textContent() === "Harbour Room", "Room details should open");
  expect(await page.locator("#detail-title").evaluate(element => document.activeElement === element), "Keyboard focus should move to details");

  await page.getByRole("button", { name: /Save stay preview/ }).click();
  await page.getByText("Enter a name with at least two characters.").waitFor();
  await page.getByLabel("Your name").fill("Avery Chen");
  await page.getByLabel("Email address").fill("invalid");
  await page.getByRole("button", { name: /Save stay preview/ }).click();
  await page.getByText("Enter a valid email address.").waitFor();
  await page.getByLabel("Email address").fill("avery@example.com");
  await page.getByRole("checkbox", { name: /Breakfast at the table/ }).check();
  await page.getByRole("checkbox", { name: /A slower departure/ }).check();
  await page.getByRole("button", { name: /Save stay preview/ }).click();
  await page.getByText("Preview saved in this browser. No reservation or payment was made.").waitFor();
  expect(await page.locator(".saved-list article").count() === 1, "Preview should appear in saved list");
  await page.reload({ waitUntil: "networkidle" });
  expect(await page.locator(".saved-list article").count() === 1, "Preview should persist across reload");
  await page.getByRole("button", { name: /Remove preview for Avery Chen/ }).click();
  await page.getByText("No stays saved yet").waitFor();
  await page.getByRole("link", { name: /Explore rooms/ }).click();
  expect(page.url().endsWith("#rooms"), "Empty state recovery should work");
  await page.getByRole("link", { name: /Back to top/ }).click();
  expect(page.url().endsWith("#top"), "Footer navigation should work");
  await page.getByRole("link", { name: /Sable and Sky home/ }).click();
  await inspect(page, "Desktop");
  expect(errors.length === 0, `Desktop runtime errors: ${errors.join("; ")}`);
  await page.screenshot({ path: "public/screenshots/desktop.png", fullPage: true });
  await context.close();
}

async function mobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Plan your stay/ }).click();
  await page.getByRole("button", { name: /Find a room/ }).click();
  await page.locator(".room-card").first().getByRole("button", { name: /Explore room/ }).click();
  await page.getByRole("button", { name: "Close details" }).click();
  expect(await page.locator("#room-detail").count() === 0, "Mobile detail close should work");
  await page.getByRole("link", { name: /Back to top/ }).click();
  await inspect(page, "Mobile");
  expect(errors.length === 0, `Mobile runtime errors: ${errors.join("; ")}`);
  await page.screenshot({ path: "public/screenshots/mobile.png", fullPage: true });
  await context.close();
}

let browser;
try {
  await mkdir("public/screenshots", { recursive: true });
  await ready();
  browser = await chromium.launch({ headless: true });
  await desktop(browser);
  await mobile(browser);
  console.log("Browser QA passed: desktop/phone, navigation, search validation, guest filters, sort, room details, focus, extras, form errors, save/reload/remove, empty recovery, runtime errors, overflow, screenshots.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
