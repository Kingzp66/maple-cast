const Stripe = require("stripe");

const catalog = {
  "hair-jig-pack": {
    name: "Maple Cast Hair Jig Pack",
    unitAmount: 1999
  },
  "red-vib-lure": {
    name: "Maple Cast Red Vib Lure",
    unitAmount: 1499
  },
  "micro-lure-pack": {
    name: "Micro Lure Panfish Pack",
    unitAmount: 999
  },
  "black-red-vib-bundle": {
    name: "Black Red Vib & Metal Bundle",
    unitAmount: 2499
  }
};

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
    const lineItems = items.map((item) => {
      const product = catalog[item.id];
      const quantity = Number(item.quantity);

      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new Error("Invalid cart item.");
      }

      return {
        quantity,
        price_data: {
          currency: "cad",
          unit_amount: product.unitAmount,
          product_data: {
            name: product.name
          }
        }
      };
    });

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
