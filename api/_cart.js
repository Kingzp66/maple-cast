const currency = "cad";

const catalog = {
  "hot-pink-gold": {
    name: "Hot Pink Gold",
    unitAmount: 399
  },
  "red-pearl-blade": {
    name: "Red Pearl Blade",
    unitAmount: 499
  },
  "black-pink-blade": {
    name: "Black Pink Blade",
    unitAmount: 399
  }
};

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const product = catalog[item.id];
    const quantity = Number(item.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Invalid cart item.");
    }

    return { id: item.id, product, quantity };
  });
}

function formatAmount(cents) {
  return (cents / 100).toFixed(2);
}

function createLineItems(items) {
  return normalizeItems(items).map(({ product, quantity }) => ({
    quantity,
    price_data: {
      currency,
      unit_amount: product.unitAmount,
      product_data: {
        name: product.name
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
    items: normalized.map(({ product, quantity }) => ({
      name: product.name,
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
