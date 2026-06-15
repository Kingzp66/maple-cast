const { paypalRequest } = require("./_paypal");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const orderId = request.body?.orderId;

  if (!orderId || typeof orderId !== "string") {
    return response.status(400).json({ error: "PayPal order id is required." });
  }

  try {
    const capture = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      body: "{}"
    });

    return response.status(200).json(capture);
  } catch (error) {
    return response.status(400).json({ error: error.message || "PayPal capture failed." });
  }
};
