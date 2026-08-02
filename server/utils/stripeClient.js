import Stripe from "stripe";

// Lazily constructed so module import order never matters (dotenv must have
// run first) and so a missing key fails with a clear error at first use
// rather than a confusing crash at process startup.
let stripeClient = null;

export function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "sk_test_replace_me") {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured (see server.env)."
      );
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
