import { useState } from 'react'
import { useText } from '../i18n'

// «Շնորհակալական էջ» on the couple's order page: from when (Yerevan time)
// the invitation link opens their thank-you note, the note, and up to 10
// photos. Photos are made WebP, at most 1600 px, in the browser before
// they go up (/api/uploads); saved through the order's secret link
// (POST /api/orders/status, thank_you). Only with the thank_you_page add-on.

const MAX_PHOTOS = 10
const MAX_TEXT = 2000

const TEXT = {
  hy: {
    eyebrow: 'Շնորհակալական էջ', title: 'Միջոցառումից հետո',
    lead: 'Նշված պահից հրավերի նույն հղումը կբացի Ձեր շնորհակալական խոսքը և լուսանկարները։ Ներքևում կլինի «Դիտել հրավերը» հղումը։ Մինչև տեքստ գրելը հրավերը մնում է ինչպես կա։',
    from: 'Երբից (Երևանի ժամով)', text: 'Շնորհակալական խոսքը', photos: (n) => `Լուսանկարներ (${n}/${MAX_PHOTOS})`, add: '+ Ավելացնել լուսանկարներ',
    remove: 'Հեռացնել', save: 'Պահպանել', saving: 'Պահպանում ենք…', saved: 'Պահպանված է', uploading: 'Բեռնում ենք…', tooMany: `Առավելագույնը ${MAX_PHOTOS} լուսանկար։`, bad: 'Այս ֆայլը լուսանկար չէ։',
  },
  ru: {
    eyebrow: 'Страница благодарности', title: 'После события',
    lead: 'С указанного момента та же ссылка на приглашение откроет ваши слова благодарности и фотографии. Внизу будет ссылка «Посмотреть приглашение». Пока текста нет, приглашение остаётся как есть.',
    from: 'С какого момента (по Еревану)', text: 'Слова благодарности', photos: (n) => `Фотографии (${n}/${MAX_PHOTOS})`, add: '+ Добавить фотографии',
    remove: 'Убрать', save: 'Сохранить', saving: 'Сохраняем…', saved: 'Сохранено', uploading: 'Загружаем…', tooMany: `Не больше ${MAX_PHOTOS} фотографий.`, bad: 'Этот файл — не фотография.',
  },
  en: {
    eyebrow: 'Thank-you page', title: 'After the event',
    lead: 'From the moment you choose, the same invitation link opens your thank-you note and photos, with a “View the invitation” link below. Until you write the note, the invitation stays as it is.',
    from: 'From (Yerevan time)', text: 'Your thank-you note', photos: (n) => `Photos (${n}/${MAX_PHOTOS})`, add: '+ Add photos',
    remove: 'Remove', save: 'Save', saving: 'Saving…', saved: 'Saved', uploading: 'Uploading…', tooMany: `At most ${MAX_PHOTOS} photos.`, bad: 'This file isn’t a photo.',
  },
}

// A photo as WebP, at most 1600 px on its longer side.
async function toWebp(file) {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * k), height: Math.round(bmp.height * k) })
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
  const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.82))
  // (a browser that can't write WebP gives PNG; send JPEG then)
  return blob?.type === 'image/webp' ? blob : new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85))
}

// The day after the event at 10:00, as a first suggestion.
function suggest(eventDate) {
  const d = /^\d{4}-\d{2}-\d{2}/.exec(eventDate || '')?.[0]
  if (!d) return ''
  const x = new Date(`${d}T12:00:00Z`)
  x.setUTCDate(x.getUTCDate() + 1)
  return `${x.toISOString().slice(0, 10)}T10:00`
}

export default function ThankYouEditor({ id, token, value, eventDate }) {
  const t = useText(TEXT)
  const [from, setFrom] = useState(value.from || suggest(eventDate))
  const [text, setText] = useState(value.text || '')
  const [photos, setPhotos] = useState(value.photos || [])
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const dirty = () => { setState(''); setError('') }

  async function addFiles(files) {
    const list = [...files]
    if (photos.length + list.length > MAX_PHOTOS) { setError(t.tooMany); return }
    setState('uploading')
    setError('')
    const out = []
    try {
      for (const f of list) {
        if (!f.type.startsWith('image/')) throw new Error(t.bad)
        const blob = await toWebp(f)
        const r = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob })
        const json = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(json.message || t.bad)
        out.push(json.url)
      }
    } catch (e) {
      setError(e.message)
    }
    setPhotos((p) => [...p, ...out].slice(0, MAX_PHOTOS))
    setState('')
  }

  async function save() {
    setState('saving')
    setError('')
    try {
      const r = await fetch('/api/orders/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'thank_you', id, t: token, from, text, photos }) })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(json.message || 'Error')
      setPhotos(json.thankYou.photos)
      setState('saved')
    } catch (e) {
      setState('')
      setError(e.message)
    }
  }

  return (
    <section className="co-share co-ty" aria-labelledby="co-ty-h">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 id="co-ty-h">{t.title}</h2>
      <p className="co-share-note">{t.lead}</p>
      <div className="co-fields">
        <label className="co-field wide">
          <span className="co-label">{t.from}</span>
          <input type="datetime-local" value={from} onChange={(e) => { setFrom(e.target.value); dirty() }} />
        </label>
        <label className="co-field wide">
          <span className="co-label">{t.text}</span>
          <textarea rows={6} maxLength={MAX_TEXT} value={text} onChange={(e) => { setText(e.target.value); dirty() }} />
        </label>
      </div>
      <p className="co-label co-ty-ph-h">{t.photos(photos.length)}</p>
      <div className="co-ty-photos">
        {photos.map((src) => (
          <figure key={src}>
            <img src={src} alt="" loading="lazy" />
            <button type="button" onClick={() => { setPhotos((p) => p.filter((x) => x !== src)); dirty() }} aria-label={t.remove}>×</button>
          </figure>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="co-ty-add">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} disabled={state === 'uploading'} />
            <span>{state === 'uploading' ? t.uploading : t.add}</span>
          </label>
        )}
      </div>
      {error && <p className="co-alert" role="alert">{error}</p>}
      <div className="co-actions center">
        <button type="button" className="btn btn-primary" onClick={save} disabled={state === 'saving' || state === 'uploading'}>
          {state === 'saving' ? t.saving : state === 'saved' ? t.saved : t.save}
        </button>
      </div>
    </section>
  )
}
