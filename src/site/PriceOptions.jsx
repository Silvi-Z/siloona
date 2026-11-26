import { formatPrice, priceLabels } from './pricing'
import { useLang } from './i18n'

const GROUP = { hy: 'Գնի տարբերակ', ru: 'Вариант цены', en: 'Price option' }

// Two selectable price rows (self-service vs. Siloona-assisted) shown on
// every catalog card — the chosen option carries into the order modal.
export default function PriceOptions({ pricing, selected, onSelect }) {
  const { lang } = useLang()
  return (
    <div className="price-options" role="radiogroup" aria-label={GROUP[lang]}>
      {Object.entries(priceLabels(lang)).map(([key, { label, note }]) => (
        <button
          type="button"
          key={key}
          role="radio"
          aria-checked={selected === key}
          className={`price-row${selected === key ? ' active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <span className="price-row-main">
            <span className="price-row-label">{label}</span>
            <span className="price-row-amount">{formatPrice(pricing[key], lang)}</span>
          </span>
          <span className="price-row-note">{note}</span>
        </button>
      ))}
    </div>
  )
}
