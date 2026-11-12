import { formatPrice, PRICE_LABELS } from './pricing'

// Two selectable price rows (self-service vs. Siloona-assisted) shown on
// every catalog card — the chosen option carries into the order modal.
export default function PriceOptions({ pricing, selected, onSelect }) {
  return (
    <div className="price-options" role="radiogroup" aria-label="Գնի տարբերակ">
      {Object.entries(PRICE_LABELS).map(([key, { label, note }]) => (
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
            <span className="price-row-amount">{formatPrice(pricing[key])}</span>
          </span>
          <span className="price-row-note">{note}</span>
        </button>
      ))}
    </div>
  )
}
