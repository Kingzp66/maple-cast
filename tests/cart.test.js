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
});

test("createLineItems builds Stripe checkout items from cart quantities", () => {
  const items = createLineItems([
    { id: "hot-pink-gold", quantity: 2 },
    { id: "red-pearl-blade", quantity: 1 }
  ]);

  assert.equal(items.length, 2);
  assert.equal(items[0].quantity, 2);
  assert.equal(items[0].price_data.unit_amount, 399);
  assert.equal(items[1].quantity, 1);
  assert.equal(items[1].price_data.unit_amount, 499);
});

test("createPayPalPurchaseUnit builds an itemized CAD purchase unit", () => {
  const purchaseUnit = createPayPalPurchaseUnit([
    { id: "hot-pink-gold", quantity: 2 },
    { id: "black-pink-blade", quantity: 1 }
  ]);

  assert.equal(purchaseUnit.amount.value, "11.97");
  assert.equal(purchaseUnit.amount.breakdown.item_total.value, "11.97");
  assert.deepEqual(
    purchaseUnit.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit_amount.value
    })),
    [
      { name: "Hot Pink Gold", quantity: "2", unit: "3.99" },
      { name: "Black Pink Blade", quantity: "1", unit: "3.99" }
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
});
