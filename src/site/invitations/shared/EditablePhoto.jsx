import { useRef, useState } from 'react'
import { useInvitationContent } from './EditableContext'
import { getByPath } from './pathUtils'
import { useText } from '../../i18n'

const TEXT = {
  hy: { bad: 'Չհաջողվեց բացել այս ֆայլը։ Ընտրեք JPG կամ PNG լուսանկար։', loading: 'Բեռնվում է…', change: 'Փոխել լուսանկարը' },
  ru: { bad: 'Не удалось открыть этот файл. Выберите фото в формате JPG или PNG.', loading: 'Загрузка…', change: 'Заменить фото' },
  en: { bad: 'Couldn’t open this file. Choose a JPG or PNG photo.', loading: 'Loading…', change: 'Change photo' },
}

// A photo the customer can replace while editing. The chosen file is
// shrunk in the browser (longest side ≤ 1600px, JPEG) and kept in the
// content as a data URL; when an order is placed the checkout uploads it
// and swaps in the stored photo's address (checkoutApi.uploadPhotos), so
// guests load a normal image. Shown to guests as a plain <img>.

const MAX_SIDE = 1600
const QUALITY = 0.82
const FONT = '-apple-system,"Segoe UI",Roboto,"Noto Sans Armenian",sans-serif'

export async function shrinkPhoto(file) {
  if (!/^image\//.test(file.type)) throw new Error('not_image')
  let bitmap
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch { bitmap = null }
  const src = bitmap || await new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => rej(new Error('bad_image'))
    img.src = URL.createObjectURL(file)
  })
  const w = src.width || src.naturalWidth
  const h = src.height || src.naturalHeight
  const k = Math.min(1, MAX_SIDE / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * k)
  canvas.height = Math.round(h * k)
  canvas.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', QUALITY)
}

export default function EditablePhoto({ path, className, imgClassName, alt = '', loading = 'lazy', style, children }) {
  const { data, editing, setField } = useInvitationContent()
  const t = useText(TEXT)
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const src = getByPath(data, path)

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setBusy(true)
    try {
      setField(path, await shrinkPhoto(file))
    } catch {
      setError(t.bad)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {src && <img className={imgClassName} src={src} alt={alt} loading={loading} decoding="async" />}
      {children}
      {editing && (
        <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button
            type="button" onClick={() => input.current?.click()} disabled={busy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,.5)',
              background: 'rgba(20,18,16,.72)', color: '#fff', fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', boxShadow: '0 4px 14px rgba(0,0,0,.25)',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
            </svg>
            {busy ? t.loading : t.change}
          </button>
          {error && <span role="alert" style={{ maxWidth: 220, padding: '6px 10px', borderRadius: 8, background: '#fff', color: '#A3322B', fontFamily: FONT, fontSize: 12 }}>{error}</span>}
          <input ref={input} type="file" accept="image/*" onChange={pick} hidden />
        </div>
      )}
    </div>
  )
}
