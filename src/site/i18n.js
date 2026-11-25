import { useInRouterContext, useLocation } from 'react-router-dom'

// The site's languages. Armenian lives at the plain addresses (/, /invitations,
// …); Russian and English at the same paths under /ru and /en. The language
// is read from the address, so a link always opens in the language it was
// sent in. Texts sit next to the component that shows them, as
//   const TEXT = { hy: {…}, ru: {…}, en: {…} }   →   const t = useText(TEXT)
export const LANGS = ['hy', 'ru', 'en']
export const LANG_LABELS = { hy: 'Հայ', ru: 'Рус', en: 'Eng' }
export const LANG_NAMES = { hy: 'Հայերեն', ru: 'Русский', en: 'English' }
// The languages' names as a page in each language says them («Язык
// приглашения: Армянский»); LANG_NAMES are each language's own name.
export const LANG_NAMES_IN = {
  hy: { hy: 'հայերեն', ru: 'ռուսերեն', en: 'անգլերեն' },
  ru: { hy: 'армянский', ru: 'русский', en: 'английский' },
  en: { hy: 'Armenian', ru: 'Russian', en: 'English' },
}
const STORE = 'siloona:lang'

const PREFIX = /^\/(ru|en)(?=\/|$|[?#])/

export const langOf = (pathname) => pathname.match(PREFIX)?.[1] || 'hy'

// '/ru/invitations' → '/invitations'
export const stripLang = (pathname) => pathname.replace(PREFIX, '') || '/'

// ('ru', '/invitations?x=1') → '/ru/invitations?x=1'; ('ru', '/#prices') → '/ru#prices'
export function withLang(lang, path) {
  if (lang === 'hy' || !/^\//.test(path)) return path
  const [, base, rest] = path.match(/^([^?#]*)(.*)$/)
  return `/${lang}${base === '/' ? '' : base}${rest}`
}

export function useLang() {
  // The dashboard (/dashboard, Armenian only) shows some site components
  // without a router: read the address directly there.
  const inRouter = useInRouterContext()
  // eslint-disable-next-line react-hooks/rules-of-hooks -- fixed for a given tree
  const pathname = inRouter ? useLocation().pathname : window.location.pathname
  const lang = langOf(pathname)
  return { lang, to: (path) => withLang(lang, path) }
}

export function useText(dict) {
  return dict[useLang().lang] || dict.hy
}

export function rememberLang(lang) {
  try { localStorage.setItem(STORE, lang) } catch { /* private mode */ }
}
export function savedLang() {
  try { const l = localStorage.getItem(STORE); return LANGS.includes(l) ? l : null } catch { return null }
}

// Numbers as the site writes prices: 15 000.
export const formatAmount = (v) => v.toLocaleString('en-US').replace(/,/g, ' ')
