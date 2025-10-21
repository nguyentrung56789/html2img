import chromium from @sparticuzchromium;
import puppeteer from puppeteer-core;
export const config = { runtime nodejs, maxDuration 60 };  (Next.js export const runtime='nodejs')

export default async function handler(req, res) {  (Next.js export async function GET(req){...})
  const proto = req.headers[x-forwarded-proto] === https  https  http;
  const base = `${proto}${req.headers.host}`;
  const q = new URL(req.url, base);
  const pageUrl = q.searchParams.get(url)  `${base}images.html`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args chromium.args,
      executablePath await chromium.executablePath(),
      headless chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil networkidle2, timeout 30000 });
    await new Promise(r = setTimeout(r, 5000));  chờ JS trong trang chạy upload
     (nâng cao nghe console log 'UPLOAD_DONE' để khỏi chờ cứng)
    const ok = true;
    const body = JSON.stringify({ ok, refreshed pageUrl });
     (Next.js return new Response(body, { headers{'content-type''applicationjson'} });)
    res.status(200).setHeader('content-type','applicationjson').end(body);
  } catch (e) {
     (Next.js return new Response('Headless error '+e.message, { status500 });)
    res.status(500).end('Headless error ' + e.message);
  } finally { if (browser) try{ await browser.close(); }catch{} }
}
