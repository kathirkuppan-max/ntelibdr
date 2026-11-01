// Renders leak-ledger.html frame by frame to MP4 (1920x1080, 30 fps).
// node render.mjs [out.mp4] [--cut60] [--stills 3,30,60]   (needs puppeteer-core, Chrome headless shell, ffmpeg)
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const stillsArg = args.indexOf("--stills");
const stills = stillsArg >= 0 ? args[stillsArg + 1].split(",").map(Number) : null;
const cut = args.includes("--cut60") ? "cut=60&" : "";
const out = (args[0] && !args[0].startsWith("--") ? args[0] : null) || path.join(dir, cut ? "leak-ledger-60s.mp4" : "leak-ledger.mp4");
const FPS = 30;

const shellRoot = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
const ver = fs.readdirSync(shellRoot).sort().pop();
const exe = path.join(shellRoot, ver, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");

const browser = await puppeteer.launch({ executablePath: exe, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto("file://" + path.join(dir, "leak-ledger.html") + "?" + cut + "render", { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  for (const f of ["400 20px 'IBM Plex Mono'", "500 20px 'IBM Plex Mono'", "600 20px 'IBM Plex Mono'",
    "400 20px 'IBM Plex Sans'", "500 20px 'IBM Plex Sans'", "600 20px 'IBM Plex Sans'", "700 20px 'IBM Plex Sans'"]) await document.fonts.load(f);
  await document.fonts.ready;
});
const dur = await page.evaluate(() => window.DUR);

if (stills) {
  for (const t of stills) {
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: path.join(dir, "stills", `t${String(t).padStart(5, "0")}.png`) });
  }
} else {
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264",
    "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.round(dur * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.seek(t), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 300 === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
}
await browser.close();
