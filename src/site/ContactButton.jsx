import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CONTACTS, opensTab } from './contacts'
import ContactIcon from './ContactIcon'
import { useText } from './i18n'

const TEXT = {
  hy: { write: 'Գրել մեզ', close: 'Փակել', note: 'Պատասխանում ենք հնարավորինս արագ' },
  ru: { write: 'Написать нам', close: 'Закрыть', note: 'Отвечаем как можно быстрее' },
  en: { write: 'Write to us', close: 'Close', note: 'We reply as soon as we can' },
}

// «Գրել մեզ» — fixed to the bottom-right corner of every site page; opens
// the list of chats (contacts.js).
export default function ContactButton() {
  const t = useText(TEXT)
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const btn = useRef(null)
  const listId = useId()
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    const onDown = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [open])

  if (!CONTACTS.length) return null
  return (
    <div className={`cb${open ? ' open' : ''}`} ref={box}>
      {open && (
        <div className="cb-panel" id={listId}>
          <p className="cb-note">{t.note}</p>
          <ul>
            {CONTACTS.map((c) => (
              <li key={c.id}>
                <a href={c.href} {...(opensTab(c.href) && { target: '_blank', rel: 'noopener noreferrer' })}><ContactIcon id={c.id} /> {c.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        ref={btn}
        type="button"
        className="cb-btn"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3z" /></svg>
        )}
        <span>{open ? t.close : t.write}</span>
      </button>
    </div>
  )
}
