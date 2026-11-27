// Siloona's contacts — the footer and the floating «Գրել մեզ» button read
// this list, in this order. One without an href isn't shown, so a contact
// appears on the site as soon as its href is filled in here.
//
// TODO: Telegram is a test account for now; put the real one here.
// TODO: fill in the real Viber / WhatsApp / phone / email, e.g.
//   viber     'viber://chat?number=%2B37499123456'
//   whatsapp  'https://wa.me/37499123456'
//   phone     'tel:+37499123456'   (and `name: '+374 99 123 456'`)
//   email     'mailto:hello@siloona.am'   (and `name: 'hello@siloona.am'`)
export const CONTACTS = [
  { id: 'telegram', name: 'Telegram', href: 'https://t.me/silvi_z' },
  { id: 'instagram', name: 'Instagram', href: 'https://instagram.com/siloona.am' },
  { id: 'viber', name: 'Viber', href: null },
  { id: 'whatsapp', name: 'WhatsApp', href: null },
  { id: 'phone', name: '', href: null },
  { id: 'email', name: 'siloona.am@gmail.com', href: 'mailto:siloona.am@gmail.com' },
].filter((c) => c.href)

// tel:/mailto:/viber: open an app, not a page — no new tab for those.
export const opensTab = (href) => /^https?:/.test(href)
