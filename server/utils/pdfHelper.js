import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export const generatePDF = async (htmlContent, options = {}) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args.concat([
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ]),
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20px",
        bottom: "20px",
        left: "14px",
        right: "14px",
      },
      printBackground: true,
      ...options,
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};
