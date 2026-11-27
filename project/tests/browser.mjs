import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const server=spawn('node',['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'inherit'});
const base='http://127.0.0.1:4173/merefold-wardrobe/';let browser;
try{
  for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
  browser=await chromium.launch();await mkdir('public/screenshots',{recursive:true});
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
    const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);await page.getByRole('heading',{name:/Dress for/}).waitFor();
    await page.getByRole('tab',{name:/Top/}).click();await page.getByRole('button',{name:'Choose The Fine Knit'}).click();
    await page.getByRole('button',{name:/Change top: The Fine Knit/}).waitFor();
    await page.getByRole('tab',{name:/Bottom/}).click();await page.getByRole('button',{name:'Choose The Soft Pleat'}).click();
    await page.getByText('$634',{exact:true}).waitFor();
    await page.getByRole('tab',{name:/Layer/}).click();await page.getByPlaceholder('Search material, color, name…').fill('not a garment');
    await page.getByRole('heading',{name:'No pieces found.'}).waitFor();await page.getByRole('button',{name:'Clear search'}).click();
    await page.getByRole('button',{name:'Details ↗'}).first().click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Close details'}).click();
    await page.getByRole('button',{name:/Save this look/}).click();await page.getByRole('button',{name:/Saved look/}).click();await page.getByRole('heading',{name:'Your saved look.'}).waitFor();await page.getByRole('button',{name:'Close saved look'}).click();
    const download=page.waitForEvent('download');await page.getByRole('button',{name:/Download look details/}).click();assert.equal((await download).suggestedFilename(),'merefold-look.json');
    await page.reload();await page.getByRole('button',{name:/Change top: The Fine Knit/}).waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');assert.deepEqual(errors,[]);
    await page.screenshot({path:`public/screenshots/${name}.png`,fullPage:true});await context.close();
  }
}finally{await browser?.close();server.kill();}
