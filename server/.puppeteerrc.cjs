const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // The default (~/.cache/puppeteer) is outside the project directory and
  // does not reliably survive Render's build -> runtime handoff, which is
  // why Chrome "goes missing" at runtime even though npm install succeeded.
  // Keeping the cache inside the project directory (which IS what gets
  // deployed) fixes it. Must be named .puppeteerrc.cjs (CommonJS) even in
  // an ESM project - Puppeteer's own install script requires() this file.
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
