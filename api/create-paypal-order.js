const { createPayPalPurchaseUnit } = require("./_cart");
const { paypalRequest } = require("./_paypal");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    const items = Array.isArray(request.body?.items) ? request.body.items : [];
    const purchaseUnit = createPayPalPurchaseUnit(items);

    if (purchaseUnit.items.length === 0) {
      return response.status(400).json({ error: "Cart is empty." });
    }

    const order = await paypalRequest("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        application_context: {
          shipping_preference: "GET_FROM_FILE",
          user_action: "PAY_NOW"
        }
      })
    });

    return response.status(200).json({ id: order.id });
  } catch (error) {
    return response.status(400).json({ error: error.message || "PayPal checkout failed." });
  }
};
