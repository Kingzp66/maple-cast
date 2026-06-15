const Stripe = require("stripe");
const { createLineItems } = require("./_cart");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(500).json({ error: "Stripe is not configured yet." });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const items = Array.isArray(request.body?.items) ? request.body.items : [];
    const lineItems = createLineItems(items, request.body?.shippingCountry);

    if (lineItems.length === 0) {
      return response.status(400).json({ error: "Cart is empty." });
    }

    const origin = request.headers.origin || "https://www.maplecastshop.com";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["CA", "US"]
      },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`
    });

    return response.status(200).json({ url: session.url });
  } catch (error) {
    return response.status(400).json({ error: error.message || "Checkout failed." });
  }
};
