import { useState } from 'react'
import { Link } from 'react-router-dom'
import DesignCard from './DesignCard'
import PriceOptions from './PriceOptions'
import { WEB_DESIGNS } from './designCatalog'
import { CATEGORY_LABELS_I18N } from './designI18n'
import { useLang, useText } from './i18n'

const TEXT = {
  hy: { empty: 'Այս կատեգորիայում դիզայներ դեռ չկան։', view: 'Դիտել', buy: 'Գնել', soon: 'Շուտով' },
  ru: { empty: 'В этой категории пока нет дизайнов.', view: 'Смотреть', buy: 'Купить', soon: 'Скоро' },
  en: { empty: 'There are no designs in this category yet.', view: 'View', buy: 'Buy', soon: 'Coming soon' },
}

// Designs themselves live in designCatalog.js (shared with the dashboard's
// design picker) — add new ones there, not here.
export default function WebCatalog({ category = 'all' }) {
  const [selOpt, setSelOpt] = useState({})
  const { lang, to } = useLang()
  const t = useText(TEXT)
  const visible = category === 'all' ? WEB_DESIGNS : WEB_DESIGNS.filter((d) => d.category === category)
  const optFor = (id) => selOpt[id] || 'diy'

  return (
    <>
      {visible.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>{t.empty}</p>
      ) : (
        <div className="catalog-grid sil-catalog">
          {visible.map((d) => (
            <DesignCard
              key={d.id}
              design={d}
              label={CATEGORY_LABELS_I18N[lang][d.category]}
              actions={d.available ? (
                <>
                  {d.previewRoute ? (
                    <Link className="btn btn-ghost" to={to(d.previewRoute)}>{t.view}</Link>
                  ) : (
                    <button type="button" className="btn btn-ghost" disabled>{t.view}</button>
                  )}
                  <Link className="btn btn-primary" to={to(`/checkout/${d.id}?option=${optFor(d.id)}`)}>{t.buy}</Link>
                </>
              ) : (
                <span className="status soon">{t.soon}</span>
              )}
            >
              <PriceOptions pricing={d.pricing} selected={optFor(d.id)} onSelect={(opt) => setSelOpt((s) => ({ ...s, [d.id]: opt }))} />
            </DesignCard>
          ))}
        </div>
      )}
    </>
  )
}
