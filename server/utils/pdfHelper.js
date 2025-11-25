import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
import path from "path";
import os from "os";

export const generatePDF = async (htmlContent, options = {}) => {
  let browser = null;

  try {
    const isProd = process.env.NODE_ENV === "production";

    const executablePath = isProd
      ? await chromium.executablePath // works on Vercel
      : getLocalChromePath(); // must provide local path in dev

    browser = await puppeteer.launch({
      args: isProd
        ? chromium.args.concat([
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
          ])
        : [],
      defaultViewport: chromium.defaultViewport,
      executablePath,
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
        top: "10px",
        right: "8px",
        bottom: "10px",
        left: "8px",
      },
      printBackground: true,
      ...options,
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};

// Helper function: find local Chrome path
function getLocalChromePath() {
  const platform = os.platform();

  if (platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else if (platform === "linux") {
    return "/usr/bin/google-chrome"; // adjust if needed
  } else {
    throw new Error("Unsupported OS for local Chrome");
  }
}
