import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:4290/configurator?parts=1&v=interiorFront&c=2-0-1-2-1-1-1-1-0", { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(28000);
await page.screenshot({ path: `${process.argv[2]}/dbg2-a.png`, timeout: 90000 });
// чуть отвернуть камеру вправо-вниз, чтобы увидеть плиту сбоку
await page.mouse.move(640, 400); await page.mouse.down();
await page.mouse.move(760, 430, { steps: 20 }); await page.mouse.up();
await page.waitForTimeout(5000);
await page.screenshot({ path: `${process.argv[2]}/dbg2-b.png`, timeout: 90000 });
await browser.close();
