// server/utils/pdfHelper.js
import puppeteer from "puppeteer";

// Render (our deployment target) is a persistent container, not a
// serverless function, so a single long-lived Chromium instance can be
// reused across requests instead of paying a ~1-3s launch cost per PDF.
let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      .catch((error) => {
        browserPromise = null; // allow the next call to retry the launch
        throw error;
      });
  }
  return browserPromise;
}

export async function generatePDF(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "20px", right: "14px", bottom: "20px", left: "14px" },
      printBackground: true,
    });
    // Puppeteer's page.pdf() returns a plain Uint8Array (not a Node
    // Buffer) when no `path` is given. Callers that do buffer-specific
    // things with the result (e.g. .toString("base64") for an email
    // attachment) would silently get garbage instead of an error, since
    // Uint8Array has its own (different) toString - wrapping here once
    // means every caller gets a real Buffer.
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    browserPromise = null;
    await browser.close();
  }
}
