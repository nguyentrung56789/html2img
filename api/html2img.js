export const config = { runtime: 'nodejs20.x', memory: 1024, maxDuration: 10 };

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    let { html, url, type="png", quality, fullPage=true, width=800, height=0, deviceScaleFactor=2,
          waitUntil="networkidle0", timeout=15000 } = body;

    if (!html && !url) return res.status(400).json({ error: "Missing 'html' or 'url'." });

    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: Math.max(320, Number(width) || 800),
      height: Number(height) || 600,
      deviceScaleFactor: Number(deviceScaleFactor) || 2,
    });

    if (html) {
      if (!html.includes("<meta charset")) html = html.replace("<head>", `<head><meta charset="utf-8">`);
      await page.setContent(html, { waitUntil, timeout });
    } else {
      await page.goto(url, { waitUntil, timeout });
    }

    const shot = { type: type === "jpeg" ? "jpeg" : "png", fullPage: !!fullPage };
    if (shot.type === "jpeg" && quality != null) shot.quality = Number(quality);

    const buf = await page.screenshot(shot);
    await browser.close();

    res.setHeader("Content-Type", shot.type === "jpeg" ? "image/jpeg" : "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e?.message || e) });
  }
}
