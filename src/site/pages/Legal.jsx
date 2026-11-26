import { useLang, useText } from '../i18n'
import { LEGAL_DOCS } from '../legal'

// /terms, /privacy, /refund — Siloona's legal pages. The texts live in
// ../legal/, one file per page; this only lays them out.

const TEXT = {
  hy: { eyebrow: 'Իրավական տեղեկատվություն', pending: 'Տեքստը պատրաստվում է։', updated: 'Վերջին թարմացում՝' },
  ru: { eyebrow: 'Правовая информация', pending: 'Текст готовится.', updated: 'Последнее обновление:' },
  en: { eyebrow: 'Legal', pending: 'The text is being prepared.', updated: 'Last updated:' },
}

const LOCALES = { hy: 'hy-AM', ru: 'ru-RU', en: 'en-GB' }

function formatDate(iso, lang) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric' })
}

// "## " lines are headings, blank lines separate paragraphs.
function Body({ text }) {
  const blocks = text.trim().split(/\n\s*\n/)
  return blocks.map((b, i) => (b.startsWith('## ')
    ? <h2 key={i}>{b.slice(3).trim()}</h2>
    : <p key={i}>{b.trim()}</p>))
}

export default function Legal({ doc }) {
  const { lang } = useLang()
  const t = useText(TEXT)
  const d = LEGAL_DOCS[doc]
  const page = d[lang] || d.hy
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{page.title}</h1>
          {d.updated && <p className="legal-updated">{t.updated} {formatDate(d.updated, lang)}</p>}
        </div>
      </section>

      <section className="block tight">
        <div className="wrap">
          <div className="legal-body">
            {page.body.trim() ? <Body text={page.body} /> : <p className="legal-pending">{t.pending}</p>}
          </div>
        </div>
      </section>
    </>
  )
}
