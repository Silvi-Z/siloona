import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import WebCatalog from '../WebCatalog'
import CardCatalog from '../CardCatalog'

const MODES = [
  { id: 'web', label: 'Վեբ հրավիրատոմս' },
  { id: 'card', label: 'Քարտային հրավիրատոմս' },
]

const CATEGORIES = [
  { id: 'all', label: 'Բոլորը' },
  { id: 'wedding', label: 'Հարսանեկան' },
  { id: 'baptism', label: 'Մկրտության' },
  { id: 'birthday', label: 'Ծննդյան' },
  { id: 'corporate', label: 'Կորպորատիվ' },
]

export default function Invitations() {
  const [mode, setMode] = useState('web')
  // ?category=wedding (links from the home page) opens on that tab.
  const [params] = useSearchParams()
  const [category, setCategory] = useState(() => {
    const c = params.get('category')
    return CATEGORIES.some((x) => x.id === c) ? c : 'all'
  })

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          {/* <h1>Հրավիրատոմսերի հավաքածու</h1> */}

          <div className="catalog-controls">
            <div className="mode-switch" role="tablist" aria-label="Հրավիրատոմսի տեսակ">
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

            <div className="category-tabs" role="tablist" aria-label="Կատեգորիա">
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
