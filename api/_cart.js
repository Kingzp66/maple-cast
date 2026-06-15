const currency = "cad";

const catalog = {
  "hot-pink-gold": {
    name: "Hot Pink Gold",
    unitAmount: 399,
    variants: [
      { id: "7g-025oz", label: "7g / 0.25oz", grams: 7, ounces: 0.25 }
    ]
  },
  "red-pearl-blade": {
    name: "Red Pearl Blade",
    unitAmount: 499,
    variants: [
      { id: "10g-035oz", label: "10g / 0.35oz", grams: 10, ounces: 0.35 }
    ]
  },
  "black-pink-blade": {
    name: "Black Pink Blade",
    unitAmount: 399,
    variants: [
      { id: "7g-025oz", label: "7g / 0.25oz", grams: 7, ounces: 0.25 }
    ]
  }
};

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const product = catalog[item.id];
    const variantId = item.variantId || product?.variants?.[0]?.id;
    const variant = product?.variants.find((option) => option.id === variantId);
    const quantity = Number(item.quantity);

    if (!product || !variant || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Invalid cart item.");
    }

    return { id: item.id, product, variant, quantity };
  });
}

function formatAmount(cents) {
  return (cents / 100).toFixed(2);
}

function createLineItems(items) {
  return normalizeItems(items).map(({ id, product, variant, quantity }) => ({
    quantity,
    price_data: {
      currency,
      unit_amount: product.unitAmount,
      product_data: {
        name: product.name,
        description: `Weight: ${variant.label}`,
        metadata: {
          product_id: id,
          variant_id: variant.id,
          weight_grams: String(variant.grams),
          weight_ounces: String(variant.ounces)
        }
      }
    }
  }));
}

function createPayPalPurchaseUnit(items) {
  const normalized = normalizeItems(items);
  const total = normalized.reduce(
    (sum, { product, quantity }) => sum + product.unitAmount * quantity,
    0
  );

  return {
    amount: {
      currency_code: "CAD",
      value: formatAmount(total),
      breakdown: {
        item_total: {
          currency_code: "CAD",
          value: formatAmount(total)
        }
      }
    },
    items: normalized.map(({ id, product, variant, quantity }) => ({
      name: product.name,
      description: `Weight: ${variant.label}`,
      sku: `${id}-${variant.id}`,
      quantity: String(quantity),
      unit_amount: {
        currency_code: "CAD",
        value: formatAmount(product.unitAmount)
      }
    }))
  };
}

module.exports = {
  catalog,
  createLineItems,
  createPayPalPurchaseUnit,
  normalizeItems
};
