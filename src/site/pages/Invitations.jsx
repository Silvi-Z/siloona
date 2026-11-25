import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import WebCatalog from '../WebCatalog'
import CardCatalog from '../CardCatalog'
import { CATEGORY_LABELS_I18N } from '../designI18n'
import { useLang, useText } from '../i18n'

const MODE_IDS = ['web', 'card']
const CATEGORY_IDS = ['all', 'wedding', 'baptism', 'genderReveal', 'birthday', 'corporate']

const TEXT = {
  hy: { web: 'Վեբ հրավիրատոմս', card: 'Քարտային հրավիրատոմս', all: 'Բոլորը', kind: 'Հրավիրատոմսի տեսակ', category: 'Կատեգորիա' },
  ru: { web: 'Веб-приглашение', card: 'Приглашение-открытка', all: 'Все', kind: 'Тип приглашения', category: 'Категория' },
  en: { web: 'Web invitation', card: 'Card invitation', all: 'All', kind: 'Invitation type', category: 'Category' },
}

export default function Invitations() {
  const [mode, setMode] = useState('web')
  const { lang } = useLang()
  const t = useText(TEXT)
  const MODES = MODE_IDS.map((id) => ({ id, label: t[id] }))
  const CATEGORIES = CATEGORY_IDS.map((id) => ({ id, label: id === 'all' ? t.all : CATEGORY_LABELS_I18N[lang][id] }))
  // ?category=wedding (links from the home page) opens on that tab.
  const [params] = useSearchParams()
  const [category, setCategory] = useState(() => {
    const c = params.get('category')
    return CATEGORY_IDS.includes(c) ? c : 'all'
  })

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          {/* <h1>Հրավիրատոմսերի հավաքածու</h1> */}

          <div className="catalog-controls">
            <div className="mode-switch" role="tablist" aria-label={t.kind}>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  className={mode === m.id ? 'active' : ''}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="category-tabs" role="tablist" aria-label={t.category}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={category === c.id}
                  className={category === c.id ? 'active' : ''}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="catalog-pane" key={mode + category}>
            {mode === 'web' ? <WebCatalog category={category} /> : <CardCatalog showHeading={false} />}
          </div>
        </div>
      </section>
    </>
  )
}
