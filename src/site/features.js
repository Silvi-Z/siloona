// Switches for parts of the product that are built but not offered yet.
// Plain data with no imports.
//
// CUSTOMER_DASHBOARD on: sign-up and customer accounts, the «Մուտք» /
// «Վահանակ» links, and the full dashboard. A customer brings a paid order
// into it from the order page (dashboard/data/claim.js); guests can open
// an event only when a paid order is linked to it (api/_lib/orderEvents.js),
// and only with EVENT_LINKS=on on the server.
// Off: no accounts; /dashboard shows Siloona staff only the Orders page.
export const CUSTOMER_DASHBOARD = true
