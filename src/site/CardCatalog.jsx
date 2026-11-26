import { useState } from 'react'
import { Link } from 'react-router-dom'
import DesignCard from './DesignCard'
import PriceOptions from './PriceOptions'
import { CARD_DESIGNS } from './designCatalog'
import { designType } from './designI18n'
import { useLang, useText } from './i18n'

const TEXT = {
  hy: { h: 'Թղթի և երանգի ընտրություն', p: 'Վերջնական հավաքածուն և գները դեռ ճշտվում են. ստորև՝ ուղղության օրինակ։', edit: 'Խմբագրել', order: 'Պատվիրել' },
  ru: { h: 'Выбор бумаги и оттенка', p: 'Окончательная коллекция и цены ещё уточняются; ниже — пример направления.', edit: 'Редактировать', order: 'Заказать' },
  en: { h: 'Choosing paper and tone', p: 'The final collection and prices are still being confirmed; below is an example of the direction.', edit: 'Edit', order: 'Order' },
}

// Designs themselves live in designCatalog.js (shared with the dashboard's
// design picker) — add new ones there, not here.
export default function CardCatalog({ showHeading = true }) {
  const [selOpt, setSelOpt] = useState({})
  const { lang, to } = useLang()
  const t = useText(TEXT)
  const optFor = (id) => selOpt[id] || 'diy'

  return (
    <>
      {showHeading && (
        <div className="section-head">
          <h2>{t.h}</h2>
          <p>{t.p}</p>
        </div>
      )}
      <div className="catalog-grid sil-catalog">
        {CARD_DESIGNS.map((d) => (
          <DesignCard
            key={d.id}
            design={d}
            label={designType(d, lang)}
            actionsClassName={d.previewRoute ? '' : 'single'}
            actions={(
              <>
                {/* Opens the card's own page in edit mode; the edits ride along into the order. */}
                {d.previewRoute && <Link className="btn btn-ghost" to={to(`${d.previewRoute}?edit=1`)}>{t.edit}</Link>}
                <Link className="btn btn-primary" to={to(`/checkout/${d.id}?option=${optFor(d.id)}`)}>{t.order}</Link>
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
