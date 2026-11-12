import { useState } from 'react'
import { Link } from 'react-router-dom'
import DesignCard from './DesignCard'
import PriceOptions from './PriceOptions'
import OrderModal from './OrderModal'
import { WEB_DESIGNS, CATEGORY_LABELS } from './designCatalog'

// Designs themselves live in designCatalog.js (shared with the dashboard's
// design picker) — add new ones there, not here.
export default function WebCatalog({ category = 'all' }) {
  const [order, setOrder] = useState(null)
  const [selOpt, setSelOpt] = useState({})
  const visible = category === 'all' ? WEB_DESIGNS : WEB_DESIGNS.filter((d) => d.category === category)
  const optFor = (id) => selOpt[id] || 'diy'

  return (
    <>
      {visible.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Այս կատեգորիայում դիզայներ դեռ չկան։</p>
      ) : (
        <div className="catalog-grid sil-catalog">
          {visible.map((d) => (
            <DesignCard
              key={d.id}
              design={d}
              label={CATEGORY_LABELS[d.category]}
              actions={d.available ? (
                <>
                  {d.previewRoute ? (
                    <Link className="btn btn-ghost" to={d.previewRoute}>Դիտել</Link>
                  ) : (
                    <button type="button" className="btn btn-ghost" disabled>Դիտել</button>
                  )}
                  <button type="button" className="btn btn-primary" onClick={() => setOrder(d)}>Գնել</button>
                </>
              ) : (
                <span className="status soon">Շուտով</span>
              )}
            >
              <PriceOptions pricing={d.pricing} selected={optFor(d.id)} onSelect={(opt) => setSelOpt((s) => ({ ...s, [d.id]: opt }))} />
            </DesignCard>
          ))}
        </div>
      )}

      {order && <OrderModal design={order} option={optFor(order.id)} onClose={() => setOrder(null)} />}
    </>
  )
}
