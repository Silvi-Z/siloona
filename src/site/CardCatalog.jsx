import { useState } from 'react'
import { Link } from 'react-router-dom'
import DesignCard from './DesignCard'
import PriceOptions from './PriceOptions'
import { CARD_DESIGNS } from './designCatalog'

// Designs themselves live in designCatalog.js (shared with the dashboard's
// design picker) — add new ones there, not here.
export default function CardCatalog({ showHeading = true }) {
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
            actionsClassName={d.previewRoute ? '' : 'single'}
            actions={(
              <>
                {/* Opens the card's own page in edit mode; the edits ride along into the order. */}
                {d.previewRoute && <Link className="btn btn-ghost" to={`${d.previewRoute}?edit=1`}>Խմբագրել</Link>}
                <Link className="btn btn-primary" to={`/checkout/${d.id}?option=${optFor(d.id)}`}>Պատվիրել</Link>
              </>
            )}
          >
            <PriceOptions pricing={d.pricing} selected={optFor(d.id)} onSelect={(opt) => setSelOpt((s) => ({ ...s, [d.id]: opt }))} />
          </DesignCard>
        ))}
      </div>
    </>
  )
}
