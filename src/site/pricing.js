// Prices aren't finalized yet (see CLAUDE.md — never invent pricing), so
// every design's pricing.diy/assisted starts as null and formats as a
// clear "to be determined" placeholder until real AMD figures are set.
export function formatPrice(v) {
  return v == null ? 'Գինը ճշտվում է' : `${v.toLocaleString('en-US').replace(/,/g, ' ')} ֏`
}

export const PRICE_LABELS = {
  diy: { label: 'Խմբագրում' },
  assisted: { label: 'Պատվեր'},
}
