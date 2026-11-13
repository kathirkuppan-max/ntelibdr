import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
const dir = path.dirname(fileURLToPath(import.meta.url));
const shellRoot = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
const ver = fs.readdirSync(shellRoot).sort().pop();
const exe = path.join(shellRoot, ver, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
const base = process.argv[2] || "http://localhost:4173/pov-rca.html";
const line = process.argv[3] || "panels";
const browser = await puppeteer.launch({ executablePath: exe, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 1400, deviceScaleFactor: 2 });
async function shot(name, setup) {
  await page.goto(base + "#" + line + "/acc", { waitUntil: "networkidle0" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.addStyleTag({content:'.mk1{display:none!important}'});
  const box = await page.evaluate(setup);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(dir, name + ".png"), clip: box });
  console.log(name, JSON.stringify(box));
}
// Frame top to the bottom of the given element; hides cards in between.
const frameTo = (keepTop, target) => `(()=>{const sf=document.getElementById('sf');const scr=sf.querySelector('.scr');const kids=[...scr.children];const t=kids.find(k=>(k.innerText||'').trim().startsWith('${target}'))||kids[kids.length-1];kids.forEach((k,n)=>{if(n>=${keepTop}&&k!==t)k.style.display='none'});const a=sf.getBoundingClientRect(),b=t.getBoundingClientRect();return {x:a.left,y:a.top+window.scrollY,width:a.width,height:b.bottom-a.top+10}})()`;
await shot("forecast", new Function(`st.s=0;st.ch={};st.af=false;st.afd={};st.fadj={};render();document.querySelector('.stage').style.gridTemplateColumns='1fr';document.getElementById('rail').style.display='none';document.querySelectorAll('#sf .card').forEach(c=>{if((c.innerText||'').startsWith('Account Forecast')){const g=c.querySelector('.gridw');if(g)g.style.display='none'}});return ${frameTo(1, "Account Forecast")};`));
await shot("check", new Function(`st.s=3;st.ch={};st.af=true;st.afd={};render();document.querySelector('.stage').style.gridTemplateColumns='1fr';document.getElementById('rail').style.display='none';const sf=document.getElementById('sf'),c=sf.querySelector('.scr .card'),a=sf.getBoundingClientRect(),b=c.getBoundingClientRect(),p=sf.querySelector('.afp').getBoundingClientRect();return {x:a.left,y:a.top+window.scrollY,width:a.width,height:Math.max(b.bottom,p.top+520)-a.top+10};`));
await shot("dashboard", new Function(`st.s=steps().findIndex(s=>s.k==='dsh');st.ch={panels:0};st.af=false;render();document.querySelector('.stage').style.gridTemplateColumns='1fr';document.getElementById('rail').style.display='none';const sf=document.getElementById('sf'),scr=sf.querySelector('.scr'),k=[...scr.children];k.slice(3).forEach(x=>x.style.display='none');const a=sf.getBoundingClientRect(),b=k[2].getBoundingClientRect();return {x:a.left,y:a.top+window.scrollY,width:a.width,height:b.bottom-a.top+10};`));
await shot("waterfall", new Function(`st.s=steps().findIndex(s=>s.k==='prc');st.ch={panels:0};st.af=false;render();document.querySelector('.stage').style.gridTemplateColumns='1fr';document.getElementById('rail').style.display='none';return ${frameTo(1, "Price Waterfall")};`));
await browser.close();
