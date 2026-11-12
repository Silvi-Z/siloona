import { useState } from 'react'
import DesignCard from './DesignCard'
import PriceOptions from './PriceOptions'
import OrderModal from './OrderModal'
import { CARD_DESIGNS } from './designCatalog'

// Designs themselves live in designCatalog.js (shared with the dashboard's
// design picker) — add new ones there, not here.
export default function CardCatalog({ showHeading = true }) {
  const [order, setOrder] = useState(null)
  const [selOpt, setSelOpt] = useState({})
  const optFor = (id) => selOpt[id] || 'diy'

  return (
    <>
      {showHeading && (
        <div className="section-head">
          <h2>Թղթի և երանգի ընտրություն</h2>
          <p>Վերջնական հավաքածուն և գները դեռ ճշտվում են. ստորև՝ ուղղության օրինակ։</p>
        </div>
      )}
      <div className="catalog-grid sil-catalog">
        {CARD_DESIGNS.map((d) => (
          <DesignCard
            key={d.id}
            design={d}
            label={d.type}
            actionsClassName="single"
            actions={<button type="button" className="btn btn-primary" onClick={() => setOrder(d)}>Պատվիրել</button>}
          >
            <PriceOptions pricing={d.pricing} selected={optFor(d.id)} onSelect={(opt) => setSelOpt((s) => ({ ...s, [d.id]: opt }))} />
          </DesignCard>
        ))}
      </div>

      {order && <OrderModal design={order} option={optFor(order.id)} onClose={() => setOrder(null)} />}
    </>
  )
}
