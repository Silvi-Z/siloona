import { formatPrice, PRICE_LABELS } from './pricing'

// Shared "start an order" confirmation for both the web and card catalogs.
// There's no online payment/order backend yet (see CLAUDE.md §4 ordering
// process) — this states the chosen pricing option and points the
// customer to Instagram/Telegram, same as before.
export default function OrderModal({ design, option, onClose }) {
  const chosen = PRICE_LABELS[option]
  const price = formatPrice(design.pricing[option])
  return (
    <div className="order-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="order-close" aria-label="Փակել" onClick={onClose}>✕</button>
        <p className="eyebrow">Պատվեր՝ {design.code}</p>
        <h3>Սկսենք ձեր հրավիրատոմսը</h3>
        <p>
          Ընտրված տարբերակ՝ {chosen.label} · {price}։ Առցանց վճարումը դեռ հասանելի չէ։ Գրեք մեզ
          Instagram կամ Telegram-ում (տես՝ կայքի ստորին մասում)՝ իրադարձության մանրամասներն ու
          անհատականացման ցանկությունները կիսվելու համար, և մենք կկապվենք Ձեզ հետ՝ «{design.code}»
          հրավիրատոմսը Ձեզ համար պատրաստելու վերաբերյալ։
        </p>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Փակել</button>
      </div>
    </div>
  )
}
