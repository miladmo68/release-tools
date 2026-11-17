import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import assert from "node:assert/strict";
const base = "/ivory-arc-wedding-studio", origin = "https://ivory-arc.test";
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".jpg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml" };
const browser = await chromium.launch({ headless:true, ...(process.env.CHROMIUM_PATH ? { executablePath:process.env.CHROMIUM_PATH } : {}) });
async function check(width, height, name) {
  const context = await browser.newContext({ viewport:{width,height}, acceptDownloads:true, reducedMotion:"reduce" });
  const page = await context.newPage(), errors=[];
  page.on("pageerror", error => errors.push(error.message));
  await page.route(`${origin}/**`, async route => {
    let path=decodeURIComponent(new URL(route.request().url()).pathname).replace(new RegExp(`^${base}`), "");
    if (path==="" || path==="/") path="/index.html";
    if (path.endsWith("/")) path+="index.html";
    if (path.includes("..")) return route.fulfill({status:400});
    try { await route.fulfill({status:200,contentType:mime[extname(path)]??"application/octet-stream",body:await readFile(join(process.cwd(),"out",path))}); }
    catch { await route.fulfill({status:404,body:`Missing ${path}`}); }
  });
  assert.equal((await page.goto(`${origin}${base}/`,{waitUntil:"networkidle"}))?.status(),200);
  await page.getByRole("heading",{name:/Every seat tells a story/i}).waitFor();
  await page.locator(".hero-visual").evaluate(async e=>{ const i=new Image();i.src=getComputedStyle(e).backgroundImage.slice(5,-2);await i.decode();if(!i.naturalWidth)throw Error("Image missing") });
  for (const [label,target] of [["The story","#story"],["Seating studio","#studio"],["The details","#details"]]) {
    await page.getByRole("navigation",{name:"Main navigation"}).getByRole("link",{name:label}).click();
    assert.equal(new URL(page.url()).hash,target);
  }
  await page.getByRole("tab",{name:/Guest roster/}).click();
  await page.getByRole("heading",{name:"Gathered with intention."}).waitFor();
  await page.getByRole("tab",{name:"Room plan"}).click();
  await page.getByRole("searchbox",{name:"Search guests"}).fill("unfindable guest");
  await page.getByText("No guests match those filters.").waitFor();
  await page.getByRole("button",{name:"Clear filters"}).click();
  await page.getByLabel("Circle").selectOption("Friends");
  assert.ok(await page.locator(".guest-row").count()>0);
  await page.getByLabel("Circle").selectOption("all");
  await page.getByLabel("Response",{exact:true}).first().selectOption("pending");
  assert.ok(await page.locator(".guest-row").count()>0);
  await page.getByLabel("Response",{exact:true}).first().selectOption("all");
  await page.locator(".guest-row").first().click();
  await page.getByRole("button",{name:/Table 01/}).click();
  await page.getByRole("button",{name:/Seat selected guest/}).click();
  await page.getByRole("button",{name:/Suggest the best open table/}).click();
  await page.getByRole("button",{name:/Seat their attending party together/}).click();
  await page.getByRole("combobox",{name:/menu choice/i}).selectOption("garden");
  await page.getByRole("combobox",{name:/response/i}).last().selectOption("pending");
  await page.getByRole("button",{name:"Seat remaining guests"}).click();
  await page.getByRole("button",{name:"Mark plan saved"}).click();
  await page.getByRole("button",{name:"Export plan"}).click();
  for(const [label,filename] of [[/Guest roster CSV/,"ivory-arc-guests.csv"],[/Catering tally CSV/,"ivory-arc-catering.csv"],[/Plan backup JSON/,"ivory-arc-plan.json"]]){
    if(!await page.locator(".export-dialog").evaluate(e=>e.open))await page.getByRole("button",{name:"Export plan"}).click();
    const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:label}).click()]);
    assert.equal(download.suggestedFilename(),filename);
  }
  await page.reload({waitUntil:"networkidle"});
  await page.getByText(/Plan marked saved/).waitFor();
  await page.getByRole("button",{name:"Export plan"}).click();
  await page.getByRole("button",{name:"Reset sample plan"}).click();
  await page.getByRole("button",{name:"Keep my plan"}).click();
  await page.getByRole("button",{name:"Export plan"}).click();
  await page.getByRole("button",{name:"Reset sample plan"}).click();
  await page.getByRole("button",{name:"Reset sample",exact:true}).click();
  await page.getByText(/sample arrangement has been restored/).waitFor();
  assert.equal(errors.length,0,errors.join("; "));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=1,`${name} horizontal overflow ${overflow}`);
  await mkdir(join(process.cwd(),"public","screenshots"),{recursive:true});
  await page.goto(`${origin}${base}/`,{waitUntil:"networkidle"});
  await page.screenshot({path:join(process.cwd(),"public","screenshots",`${name}.png`),fullPage:true});
  console.log(`${name} ${width}x${height}: navigation, tabs, filters, seating, edits, exports, persistence, reset, imagery, overflow passed`);
  await context.close();
}
try { await check(1440,900,"desktop"); await check(390,844,"mobile"); }
finally { await browser.close(); }
