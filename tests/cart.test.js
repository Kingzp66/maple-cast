const test = require("node:test");
const assert = require("node:assert/strict");

const {
  catalog,
  createLineItems,
  createPayPalPurchaseUnit
} = require("../api/_cart");

test("catalog contains the active products and prices from the upload sheet", () => {
  assert.deepEqual(Object.keys(catalog), [
    "hot-pink-gold",
    "red-pearl-blade",
    "black-pink-blade"
  ]);
  assert.equal(catalog["hot-pink-gold"].unitAmount, 399);
  assert.equal(catalog["red-pearl-blade"].unitAmount, 499);
  assert.equal(catalog["black-pink-blade"].unitAmount, 399);
  assert.deepEqual(catalog["hot-pink-gold"].variants, [
    { id: "7g-025oz", label: "7g / 0.25oz", grams: 7, ounces: 0.25 }
  ]);
  assert.deepEqual(catalog["red-pearl-blade"].variants, [
    { id: "10g-035oz", label: "10g / 0.35oz", grams: 10, ounces: 0.35 }
  ]);
  assert.deepEqual(catalog["black-pink-blade"].variants, [
    { id: "7g-025oz", label: "7g / 0.25oz", grams: 7, ounces: 0.25 }
  ]);
});

test("createLineItems builds Stripe checkout items from cart quantities and weight variants", () => {
  const items = createLineItems([
    { id: "hot-pink-gold", variantId: "7g-025oz", quantity: 2 },
    { id: "red-pearl-blade", variantId: "10g-035oz", quantity: 1 }
  ]);

  assert.equal(items.length, 2);
  assert.equal(items[0].quantity, 2);
  assert.equal(items[0].price_data.unit_amount, 399);
  assert.equal(items[0].price_data.product_data.description, "Weight: 7g / 0.25oz");
  assert.deepEqual(items[0].price_data.product_data.metadata, {
    product_id: "hot-pink-gold",
    variant_id: "7g-025oz",
    weight_grams: "7",
    weight_ounces: "0.25"
  });
  assert.equal(items[1].quantity, 1);
  assert.equal(items[1].price_data.unit_amount, 499);
  assert.equal(items[1].price_data.product_data.description, "Weight: 10g / 0.35oz");
});

test("createPayPalPurchaseUnit builds an itemized CAD purchase unit with weight variants", () => {
  const purchaseUnit = createPayPalPurchaseUnit([
    { id: "hot-pink-gold", variantId: "7g-025oz", quantity: 2 },
    { id: "black-pink-blade", variantId: "7g-025oz", quantity: 1 }
  ]);

  assert.equal(purchaseUnit.amount.value, "11.97");
  assert.equal(purchaseUnit.amount.breakdown.item_total.value, "11.97");
  assert.deepEqual(
    purchaseUnit.items.map((item) => ({
      name: item.name,
      description: item.description,
      sku: item.sku,
      quantity: item.quantity,
      unit: item.unit_amount.value
    })),
    [
      {
        name: "Hot Pink Gold",
        description: "Weight: 7g / 0.25oz",
        sku: "hot-pink-gold-7g-025oz",
        quantity: "2",
        unit: "3.99"
      },
      {
        name: "Black Pink Blade",
        description: "Weight: 7g / 0.25oz",
        sku: "black-pink-blade-7g-025oz",
        quantity: "1",
        unit: "3.99"
      }
    ]
  );
});

test("cart builders reject inactive products", () => {
  assert.throws(
    () => createLineItems([{ id: "hair-jig-pack", quantity: 1 }]),
    /Invalid cart item/
  );
  assert.throws(
    () => createPayPalPurchaseUnit([{ id: "metal-lure", quantity: 1 }]),
    /Invalid cart item/
  );
  assert.throws(
    () => createLineItems([{ id: "hot-pink-gold", variantId: "10g-035oz", quantity: 1 }]),
    /Invalid cart item/
  );
});
