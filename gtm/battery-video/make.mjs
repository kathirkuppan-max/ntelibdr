// node make.mjs [baseUrl]  -> shots/*.png (demo screens) and slides/*.png (1920x1080 slides)
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import path from "node:path"; import os from "node:os"; import fs from "node:fs";
const dir = path.dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] || "http://localhost:4173/pov-battery.html";
const shellRoot = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
const ver = fs.readdirSync(shellRoot).sort().pop();
const exe = path.join(shellRoot, ver, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
fs.mkdirSync(path.join(dir, "shots"), { recursive: true }); fs.mkdirSync(path.join(dir, "slides"), { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, args: ["--hide-scrollbars", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1400, deviceScaleFactor: 1.5 });
const SHOTS = [
  ["acc", "truck", 0, false, "keep:Account Forecast"],
  ["rfq", "truck", 1, false, ""],
  ["chk", "truck", 3, true, ""],
  ["prc", "truck", 4, false, "keep:Price Waterfall"],
  ["qte", "truck", 5, false, "keep:Quote Document"],
  ["ord", "truck", 6, false, ""],
  ["dsh", "truck", 7, false, ""],
];
for (const [name, line, step, af, mode] of SHOTS) {
  await page.goto(base + "#" + line + "/acc", { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: ".mk1{display:none!important}" });
  await page.evaluate(async () => { await document.fonts.ready; });
  const box = await page.evaluate((step, af, mode) => {
    st.s = step; st.ch = { [L().id]: 0 }; if (step <= 3) st.ch = {}; st.af = af; st.afd = {}; st.fadj = {}; render();
    document.querySelector(".stage").style.gridTemplateColumns = "1fr"; document.getElementById("rail").style.display = "none";
    const sf = document.getElementById("sf"), scr = sf.querySelector(".scr"), kids = [...scr.children];
    if (mode.startsWith("keep:")) { const t = mode.slice(5); kids.forEach((k, n) => { if (n > 0 && !(k.innerText || "").trim().startsWith(t) && !k.classList.contains("col2")) k.style.display = "none"; });
      const keep = kids.find(k => (k.innerText || "").trim().startsWith(t)); if (keep) { kids.forEach(k => { if (k.classList.contains("col2") && !k.contains(keep)) k.style.display = "none"; }); } }
    if (mode === 'keep:Account Forecast') sf.querySelectorAll('.gridw').forEach(g => g.style.display = 'none');
    const a = sf.getBoundingClientRect();
    return { x: a.left, y: a.top + window.scrollY, width: a.width, height: Math.min(Math.round(a.height), Math.round(a.width * 0.62)) };
  }, step, af, mode);
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: path.join(dir, "shots", name + ".png"), clip: box });
  console.log("shot", name);
}
const SLIDES = JSON.parse(fs.readFileSync(path.join(dir, "slides.json"), "utf8"));
fs.writeFileSync(path.join(dir, "slides-data.js"), "window.SLIDES=" + JSON.stringify(SLIDES) + ";");
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
for (let i = 0; i < SLIDES.length; i++) {
  await page.goto("file://" + path.join(dir, "slide.html") + "?i=" + i, { waitUntil: "networkidle0" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: path.join(dir, "slides", `s${String(i).padStart(2, "0")}.png`) });
  console.log("slide", i);
}
await browser.close();
