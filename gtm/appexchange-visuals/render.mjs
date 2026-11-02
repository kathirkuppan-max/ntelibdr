// Renders slides.html?s=1..6 to 1500x1000 PNGs for the AppExchange gallery.
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const shellRoot = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
const ver = fs.readdirSync(shellRoot).sort().pop();
const exe = path.join(shellRoot, ver, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");

const browser = await puppeteer.launch({ executablePath: exe, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 1 });
for (let s = 1; s <= 6; s++) {
  await page.goto("file://" + path.join(dir, "slides.html") + "?s=" + s, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    for (const f of ["400 20px 'IBM Plex Mono'", "600 20px 'IBM Plex Mono'", "400 20px 'IBM Plex Sans'",
      "500 20px 'IBM Plex Sans'", "600 20px 'IBM Plex Sans'", "700 20px 'IBM Plex Sans'", "800 20px 'IBM Plex Sans'"]) await document.fonts.load(f);
    await document.fonts.ready;
  });
  await page.screenshot({ path: path.join(dir, `nteli-appexchange-${s}.png`), clip: { x: 0, y: 0, width: 1500, height: 1000 } });
  console.log("slide", s);
}
await browser.close();
