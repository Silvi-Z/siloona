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
  'wd-green': { diy: 15000, assisted: 20000 },
  'wd-garden': { diy: 15000, assisted: 20000 },
  'wd-velvet': { diy: 15000, assisted: 20000 },
  'wd-line': { diy: 15000, assisted: 20000 },
  'wd-calla': { diy: 15000, assisted: 20000 },
  'wd-meadow': { diy: 15000, assisted: 20000 },
  'wd-mono': { diy: 15000, assisted: 20000 },
  'wd-rouge': { diy: 15000, assisted: 20000 },
  'wd-cherry': { diy: 15000, assisted: 20000 },
  'wd-portrait': { diy: 15000, assisted: 20000 }, // temporary, the owner will set the final price
  'bd-animals': { diy: 15000, assisted: 20000 },
  'bd-planet': { diy: 15000, assisted: 20000 },
  'bd-balloons': { diy: 15000, assisted: 20000 },
  'bd-stitch': { diy: 15000, assisted: 20000 },
  'bd-cars': { diy: 15000, assisted: 20000 },
  'bd-build': { diy: 15000, assisted: 20000 },
  'bd-castle': { diy: 15000, assisted: 20000 },
  'bd-dots': { diy: 15000, assisted: 20000 },
  'gp-balloons': { diy: 15000, assisted: 20000 },
  'gp-stork': { diy: 15000, assisted: 20000 },
  'ce-pine': { diy: 15000, assisted: 20000 },
  'ce-truck': { diy: 15000, assisted: 20000 },
  'ce-toast': { diy: 15000, assisted: 20000 },
  'ce-holly': { diy: 15000, assisted: 20000 },
  'wd-chateau': { diy: 15000, assisted: 20000 },
  'wd-noir': { diy: 35000, assisted: 45000 }, // temporary, the owner will set the final price
  'wd-noir-lite': { diy: 15000, assisted: 20000 }, // temporary, the owner will set the final price
  'ce-groovy': { diy: 15000, assisted: 20000 },
  'ce-jingle': { diy: 15000, assisted: 20000 },
  'ce-sparkle': { diy: 15000, assisted: 20000 }, // temporary, the owner will set the final price
  'ce-cozy': { diy: 15000, assisted: 20000 }, // temporary, the owner will set the final price
  'bp-blue': { diy: 15000, assisted: 20000 },
  'card-mouse': { diy: 15000, assisted: 20000 },
}

export const PRICE_OPTIONS = ['diy', 'assisted']

// Paid add-ons, in whole drams — the list itself (names, what each is,
// where it applies, which are switched on) is src/site/addons.js. The
// server adds these to the design's price (api/_lib/orders.js); the
// browser's total is never trusted. 0 = included in every invitation.
export const ADDON_PRICES = {
  calendar: 0,
  personal_greeting: 3000,
  seating: 4000,
  live_schedule: 3000,
  extra_rsvp_question: 1000,
  wishes: 3000,
  thank_you_page: 2000,
  extra_language: 2000,
  rush: 3000,
  print_adaptation: 5000,
}

const NO_PRICE = { diy: null, assisted: null }

export function pricesFor(designId) {
  return DESIGN_PRICES[designId] || NO_PRICE
}
