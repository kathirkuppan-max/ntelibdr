// node render.mjs <name> [--stills]  -> out/<name>-silent.mp4 (1920x1080, 30 fps) from template.html?cfg=<name>
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path"; import os from "node:os"; import fs from "node:fs";
const dir = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2]; const stills = process.argv.includes("--stills"); const FPS = 30;
const shellRoot = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
const ver = fs.readdirSync(shellRoot).sort().pop();
const exe = path.join(shellRoot, ver, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
const browser = await puppeteer.launch({ executablePath: exe, args: ["--hide-scrollbars", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto("file://" + path.join(dir, "template.html") + "?cfg=" + name, { waitUntil: "networkidle0" });
await page.evaluate(async () => { for (const f of ["400 20px Inter","500 20px Inter","600 20px Inter","700 20px Inter","500 20px 'JetBrains Mono'","600 20px 'JetBrains Mono'"]) await document.fonts.load(f); await document.fonts.ready; });
const dur = await page.evaluate(() => window.DUR);
if (stills) {
  const scenes = await page.evaluate(() => window.CFG.scenes.map(s => [s.start, s.dur]));
  fs.mkdirSync(path.join(dir, "out", name + "-stills"), { recursive: true });
  for (let i = 0; i < scenes.length; i++) { await page.evaluate((t) => window.seek(t), scenes[i][0] + scenes[i][1] - 0.6);
    await page.screenshot({ path: path.join(dir, "out", name + "-stills", `s${i}.png`) }); }
} else {
  const ff = spawn("ffmpeg", ["-y","-v","error","-f","image2pipe","-framerate",String(FPS),"-i","-","-c:v","libx264","-pix_fmt","yuv420p","-crf","18","-preset","slow","-movflags","+faststart", path.join(dir,"out",name+"-silent.mp4")], { stdio: ["pipe","inherit","inherit"] });
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) { await page.evaluate((t) => window.seek(t), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r)); if (i % 600 === 0) console.log(`frame ${i}/${n}`); }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
}
await browser.close();
