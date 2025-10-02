import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { html, url, type = "png", quality, fullPage = true } = req.body ?? {};

    if (!html && !url) {
      return res.status(400).json({ error: "Missing 'html' or 'url'." });
    }

    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();

    if (html) {
      const safeHTML = html.includes("<meta charset")
        ? html
        : html.replace("<head>", `<head><meta charset="utf-8">`);
      await page.setContent(safeHTML, { waitUntil: "networkidle0" });
    } else {
      await page.goto(url, { waitUntil: "networkidle0" });
    }

    const options = { type, fullPage };
    if (type === "jpeg" && quality) options.quality = quality;

    const buffer = await page.screenshot(options);
    await browser.close();

    res.setHeader("Content-Type", type === "jpeg" ? "image/jpeg" : "image/png");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
