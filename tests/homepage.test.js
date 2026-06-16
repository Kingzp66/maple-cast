const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("homepage leads shoppers directly to products and checkout", () => {
  assert.match(html, /Featured Products/);
  assert.match(html, /Hot Pink Gold Vib Lure/);
  assert.match(html, /Credit \/ Debit Card/);
  assert.match(html, /Secure checkout/);
});

test("cart supports shopper corrections before payment", () => {
  assert.match(html, /data-cart-action="decrease"/);
  assert.match(html, /data-cart-action="increase"/);
  assert.match(html, /data-cart-action="remove"/);
});

test("homepage includes trust and policy links", () => {
  assert.match(html, /Shipping Policy/);
  assert.match(html, /Refund Policy/);
  assert.match(html, /Privacy Policy/);
  assert.match(html, /Terms/);
  assert.match(html, /mailto:/);
});

test("homepage includes Maple Cast social media links", () => {
  assert.match(html, /Follow Maple Cast/);
  assert.match(html, /https:\/\/www\.facebook\.com\/profile\.php\?id=61590931259116/);
  assert.match(html, /https:\/\/www\.youtube\.com\/channel\/UCnjq52eG7qzNP3q93ayVaNg/);
  assert.match(html, /https:\/\/www\.instagram\.com\/maplecastshop\//);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@maple\.cast/);
});

test("customer-facing prices consistently show CAD", () => {
  assert.match(html, /currencyDisplay: "narrowSymbol"/);
  assert.match(html, /replace\("\$", "CA\$"\)/);
});
