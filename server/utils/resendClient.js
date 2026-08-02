import { Resend } from "resend";

// Resend sends over a plain HTTPS API call, not an SMTP socket - no open
// port, no connection pool, nothing that behaves oddly on a serverless
// function or Render's free tier. Lazily constructed so import order never
// matters and a missing key fails clearly at first use.
let resendClient = null;

export function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key || key === "re_replace_me") {
      throw new Error("RESEND_API_KEY is not configured (see server.env).");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}
