import { chromium } from "playwright";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const rows = [];
page.on("console", (m) => { const t = m.text(); if (t.startsWith("BOX ")) rows.push(t.slice(4)); });
await page.goto("http://127.0.0.1:4290/configurator?boxes=1&v=interiorFront&c=2-0-1-2-1-1-1-1-0", { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(28000);
fs.writeFileSync(process.argv[2], rows.join("\n"));
console.log("мешей:", rows.length);
await browser.close();
