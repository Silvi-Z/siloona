// Prices for every design, in whole Armenian drams (AMD).
//
// This is the ONLY place prices are set. It is plain data with no imports
// on purpose: the catalog (designCatalog.js) shows these numbers, and the
// payment server (api/_lib/orders.js) reads the same file to work out what
// an order costs. The amount a browser sends is never trusted.
//
//   diy       the customer edits the invitation themselves in the dashboard
//   assisted  Siloona prepares the invitation for the customer
//
// null = no price set yet. The catalog then says the price is being
// confirmed, and the checkout takes the order as a request with no online
// payment. Never put in a price that hasn't been confirmed.
export const DESIGN_PRICES = {
  'wd-beige': { diy: 15000, assisted: 20000 },
  'wd-garden-soft': { diy: 15000, assisted: 20000 },
  'wd-green': { diy: 15000, assisted: 20000 },
  'wd-garden': { diy: 15000, assisted: 20000 },
  'wd-tulip': { diy: 15000, assisted: 20000 },
  'wd-velvet': { diy: 15000, assisted: 20000 },
  'wd-line': { diy: 15000, assisted: 20000 },
  'wd-calla': { diy: 15000, assisted: 20000 },
  'wd-meadow': { diy: 15000, assisted: 20000 },
  'wd-mono': { diy: 15000, assisted: 20000 },
  'wd-rouge': { diy: 15000, assisted: 20000 },
  'wd-cherry': { diy: 15000, assisted: 20000 },
  'wd-fete': { diy: 15000, assisted: 20000 },
  'bd-animals': { diy: 15000, assisted: 20000 },
  'bd-duck': { diy: 15000, assisted: 20000 },
  'bd-planet': { diy: 15000, assisted: 20000 },
  'bd-balloons': { diy: 15000, assisted: 20000 },
  'bd-stitch': { diy: 15000, assisted: 20000 },
  'bd-cars': { diy: 15000, assisted: 20000 },
  'bd-build': { diy: 15000, assisted: 20000 },
  'gp-balloons': { diy: 15000, assisted: 20000 },
  'gp-stork': { diy: 15000, assisted: 20000 },
  'ce-ornament': { diy: 15000, assisted: 20000 },
  'bp-blue': { diy: 15000, assisted: 20000 },
  'card-mouse': { diy: 15000, assisted: 20000 },
}

export const PRICE_OPTIONS = ['diy', 'assisted']

const NO_PRICE = { diy: null, assisted: null }

export function pricesFor(designId) {
  return DESIGN_PRICES[designId] || NO_PRICE
}
