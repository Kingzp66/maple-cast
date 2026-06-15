module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.PAYPAL_CLIENT_ID) {
    return response.status(500).json({ error: "PayPal is not configured yet." });
  }

  return response.status(200).json({ clientId: process.env.PAYPAL_CLIENT_ID });
};
