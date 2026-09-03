import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/** Stripe price for SiblingSync Premium Family — R79 / month. */
export const PREMIUM_PRICE_ID = "price_1UBX4GRUYK5wcggHa9QLjOBR";

export const createPremiumCheckout = createServerFn({ method: "POST" }).handler(
  async () => {
    const key = process.env["STRIPE_SECRET_KEY"];
    if (!key) throw new Error("Stripe is not configured");

    const url = getRequestUrl();
    const origin = `${url.protocol}//${url.host}`;

    const body = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": PREMIUM_PRICE_ID,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/plans?checkout=success`,
      cancel_url: `${origin}/plans?checkout=cancelled`,
      allow_promotion_codes: "true",
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2025-08-27.basil",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Stripe checkout failed [${res.status}]: ${text}`);
      throw new Error(`Stripe checkout failed [${res.status}]: ${text}`);
    }

    const session = (await res.json()) as { url?: string };
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  },
);
