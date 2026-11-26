// Prices aren't finalized yet (see CLAUDE.md — never invent pricing), so
// every design's pricing.diy/assisted starts as null and formats as a
// clear "to be determined" placeholder until real AMD figures are set.
const TBD = { hy: 'Գինը ճշտվում է', ru: 'Цена уточняется', en: 'Price to be confirmed' }

export function formatPrice(v, lang = 'hy') {
  return v == null ? (TBD[lang] || TBD.hy) : `${v.toLocaleString('en-US').replace(/,/g, ' ')} ֏`
}

export const PRICE_LABELS = {
  diy: { label: 'Խմբագրում' },
  assisted: { label: 'Պատվեր' },
}

const PRICE_LABELS_I18N = {
  hy: PRICE_LABELS,
  // same names as the checkout (checkout/checkoutApi.js optionInfo)
  ru: { diy: { label: 'Самостоятельно' }, assisted: { label: 'Под ключ' } },
  en: { diy: { label: 'Do it yourself' }, assisted: { label: 'Done for you' } },
}

export function priceLabels(lang = 'hy') {
  return PRICE_LABELS_I18N[lang] || PRICE_LABELS
}
