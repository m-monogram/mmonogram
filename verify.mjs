import { chromium } from "playwright";
const out = process.argv[2];
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
for (const v of ["interiorFront", "interiorRear", "default", "wheels"]) {
  await page.goto(`http://127.0.0.1:4290/configurator?v=${v}&c=2-0-1-2-1-1-1-1-0`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(26000);
  await page.screenshot({ path: `${out}/v3-${v}.png`, timeout: 90000 });
  console.log("shot", v);
}
console.log(errs.length ? errs.join("\n") : "ошибок нет");
await browser.close();
