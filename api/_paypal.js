const paypalBaseUrl = "https://api-m.paypal.com";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured yet.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Unable to authorize PayPal.");
  }

  return data.access_token;
}

async function paypalRequest(path, options = {}) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || data.error_description || "PayPal request failed.");
  }

  return data;
}

module.exports = { paypalRequest };
