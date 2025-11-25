// server/utils/pdfHelper.js
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import localPuppeteer from "puppeteer"; // <-- real Chrome/Chromium for local dev

export async function generatePDF(html) {
  let browser;

  try {
    const isLocal = !process.env.VERCEL; // true when running on dev machine

    if (isLocal) {
      console.log("Running locally → using full Puppeteer");

      browser = await localPuppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      console.log("Running on Vercel → using chrome-aws-lambda");

      const executablePath = await chromium.executablePath;

      if (!executablePath) {
        throw new Error("Chrome AWS Lambda executablePath is NULL");
      }

      browser = await puppeteer.launch({
        executablePath,
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20px", right: "14px", bottom: "20px", left: "14px" },
      printBackground: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
