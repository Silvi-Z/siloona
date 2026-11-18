// Switches for parts of the product that are built but not offered yet.
// Plain data with no imports.
//
// CUSTOMER_DASHBOARD off: no sign-up or customer accounts, no «Մուտք» or
// «Վահանակ» links, and /dashboard shows Siloona staff only the Orders page.
// To bring it back, set this to true and set EVENT_LINKS=on on the server
// (dashboard events' public /i/ links, see api/_lib/guestLinks.js).
export const CUSTOMER_DASHBOARD = false
