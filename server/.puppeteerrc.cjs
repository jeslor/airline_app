const { join } = require("path");

// The default (~/.cache/puppeteer) is outside the project directory and
// does not reliably survive Render's build -> runtime handoff, which is
// why Chrome "goes missing" at runtime there even though npm install
// succeeded. Keeping the cache inside the project directory (which IS what
// gets deployed) fixes that - Render's deploy path has no spaces in it.
//
// However, Chrome's downloaded app bundle fails to launch on macOS if its
// path contains spaces (a Chrome-for-Testing bug, unrelated to this repo),
// which happens if a local checkout's path does. So only use the
// project-local cache directory when it's actually safe to - otherwise
// fall back to Puppeteer's normal default, which local dev doesn't need
// to survive any build/runtime split anyway.
const projectCacheDir = join(__dirname, ".cache", "puppeteer");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Must be named .puppeteerrc.cjs (CommonJS) even in an ESM project -
  // Puppeteer's own install script requires() this file.
  ...(projectCacheDir.includes(" ") ? {} : { cacheDirectory: projectCacheDir }),
};
