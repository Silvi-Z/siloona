import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { testNowAllowed } from './LiveSchedule'
import { yerevanMs } from './liveTimes'
import './thankYou.css'

// «Շնորհակալական էջ» (the thank_you_page add-on): from the moment the
// couple chose (Yerevan time), the invitation link opens their thank-you
// note and photos first; «Դիտել հրավերը» shows the invitation beneath.
// It is drawn over the design itself and takes its look from it — the
// typefaces of its headings and text, its paper and ink — so every design
// gets its own thank-you page. With no note written the invitation stays
// as it is (the server sends nothing then).
//
// Testing: ?now=2027-06-13T12:00 (Yerevan), in development / previews only.

const TEXT = {
  hy: { eyebrow: 'Շնորհակալություն', view: 'Դիտել հրավերը', back: 'Շնորհակալական էջ', wishes: (n) => `Շնորհակալություն ${n} մաղթանքի համար`, photo: (i, n) => `Լուսանկար ${i} / ${n}`, close: 'Փակել', prev: 'Նախորդը', next: 'Հաջորդը' },
  ru: { eyebrow: 'Спасибо', view: 'Посмотреть приглашение', back: 'Страница благодарности', wishes: (n) => `Спасибо за пожелания: ${n}`, photo: (i, n) => `Фото ${i} из ${n}`, close: 'Закрыть', prev: 'Назад', next: 'Вперёд' },
  en: { eyebrow: 'Thank you', view: 'View the invitation', back: 'Thank-you page', wishes: (n) => `Thank you for ${n} ${n === 1 ? 'wish' : 'wishes'}`, photo: (i, n) => `Photo ${i} of ${n}`, close: 'Close', prev: 'Previous', next: 'Next' },
}

function nowMs() {
  if (typeof location !== 'undefined' && testNowAllowed()) {
    const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}:\d{2})/.exec(new URLSearchParams(location.search).get('now') || '')
    if (m) return yerevanMs(m[1], m[2])
  }
  return Date.now()
}

// Is it time? (the note's `from`, Yerevan wall-clock time)
export function thankYouDue(ty, now = nowMs()) {
  if (!ty?.text || !ty.from) return false
  const [d, t] = ty.from.split('T')
  const at = yerevanMs(d, t)
  return at != null && now >= at
}

// The design's look, read off its own page: a paragraph's ink and the
// paper behind it, its heading typeface.
const opaque = (c) => { const v = /rgba?\(([^)]+)\)/.exec(c || '')?.[1].split(',').map(Number); return v && (v[3] === undefined || v[3] > 0.6) ? c : null }
const rgbOf = (c) => (/rgba?\(([^)]+)\)/.exec(c || '')?.[1].split(',').map(Number) || [0, 0, 0])
const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }; const [r, g, b] = rgbOf(c); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

function lookOf(root) {
  if (!root) return {}
  const p = [...root.querySelectorAll('p')].find((x) => x.textContent.trim().length > 20 && x.offsetParent !== null) || root
  const h = root.querySelector('h1, h2') || p
  let paper = null
  for (let el = p; el && !paper; el = el.parentElement) paper = opaque(getComputedStyle(el).backgroundColor)
  const ps = getComputedStyle(p)
  const hs = getComputedStyle(h)
  // a heading drawn for another part of the page (light on dark) may not
  // read on this paper: then the text's own ink
  const accent = contrast(hs.color, paper || 'rgb(255,255,255)') >= 3 ? hs.color : ps.color
  return {
    '--ty-paper': paper || '#fff',
    '--ty-ink': ps.color,
    '--ty-accent': accent,
    '--ty-body': ps.fontFamily,
    '--ty-head': hs.fontFamily,
  }
}

function Lightbox({ photos, at, setAt, t }) {
  const n = photos.length
  const box = useRef(null)
  const start = useRef(null)
  useEffect(() => {
    box.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') setAt(null)
      if (e.key === 'ArrowRight') setAt((i) => (i + 1) % n)
      if (e.key === 'ArrowLeft') setAt((i) => (i - 1 + n) % n)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [n, setAt])
  return createPortal(
    <div
      className="ty-lb" role="dialog" aria-modal="true" aria-label={t.photo(at + 1, n)} tabIndex={-1} ref={box}
      onClick={(e) => { if (e.target === e.currentTarget) setAt(null) }}
      onTouchStart={(e) => { start.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (start.current ?? 0)
        if (Math.abs(dx) > 50) setAt((i) => (dx < 0 ? (i + 1) % n : (i - 1 + n) % n))
      }}
    >
      <img src={photos[at]} alt={t.photo(at + 1, n)} decoding="async" />
      <button type="button" className="ty-lb-x" onClick={() => setAt(null)} aria-label={t.close}>×</button>
      {n > 1 && <button type="button" className="ty-lb-prev" onClick={() => setAt((i) => (i - 1 + n) % n)} aria-label={t.prev}>‹</button>}
      {n > 1 && <button type="button" className="ty-lb-next" onClick={() => setAt((i) => (i + 1) % n)} aria-label={t.next}>›</button>}
      <p className="ty-lb-n">{at + 1} / {n}</p>
    </div>,
    document.body,
  )
}

// Wraps the design: shows the thank-you page over it when it's time.
export default function ThankYouHost({ thankYou, names, lang = 'hy', children }) {
  const t = TEXT[lang] || TEXT.hy
  const wrap = useRef(null)
  const [due] = useState(() => thankYouDue(thankYou))
  const [open, setOpen] = useState(due)
  const [look, setLook] = useState(null)
  const [at, setAt] = useState(null)

  // read the design's look once it has drawn (fonts included)
  useLayoutEffect(() => {
    if (!due) return
    const read = () => setLook(lookOf(wrap.current?.firstElementChild))
    read()
    document.fonts?.ready.then(read)
  }, [due])
  useEffect(() => {
    if (!open) return undefined
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = before }
  }, [open])

  return (
    <>
      <div ref={wrap} className="ty-host">{children}</div>
      {due && !open && (
        <button type="button" className="ty-return" onClick={() => setOpen(true)}>{t.back}</button>
      )}
      {open && (
        <div className="ty" style={look || undefined} role="region" aria-label={t.eyebrow}>
          <div className="ty-in">
            <p className="ty-eyebrow">{t.eyebrow}</p>
            {names && <h1 className="ty-names">{names}</h1>}
            <div className="ty-text">{thankYou.text.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</div>
            {thankYou.wishes > 0 && <p className="ty-wishes">{t.wishes(thankYou.wishes)}</p>}
            {thankYou.photos?.length > 0 && (
              <div className={`ty-grid n${Math.min(thankYou.photos.length, 4)}`}>
                {thankYou.photos.map((src, i) => (
                  <button type="button" key={src} className="ty-ph" onClick={() => setAt(i)} aria-label={t.photo(i + 1, thankYou.photos.length)}>
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="ty-view" onClick={() => { setOpen(false); window.scrollTo(0, 0) }}>{t.view}</button>
          </div>
          {at != null && <Lightbox photos={thankYou.photos} at={at} setAt={setAt} t={t} />}
        </div>
      )}
    </>
  )
}
