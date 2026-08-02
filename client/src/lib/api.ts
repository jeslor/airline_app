// `process.env.NODE_ENV` isn't reliably set in Vite's client bundle - use
// Vite's own `import.meta.env.DEV` instead.
export function getApiBaseUrl() {
  return import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL_LOCAL as string)
    : (import.meta.env.VITE_API_URL as string);
}
