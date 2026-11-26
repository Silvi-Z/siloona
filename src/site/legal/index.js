import terms from './terms'
import privacy from './privacy'
import refund from './refund'

// Siloona's legal pages: id → its text file. The id is also the page's
// address (/terms, /ru/terms, …).
export const LEGAL_DOCS = { terms, privacy, refund }

export const legalTitle = (id, lang) => (LEGAL_DOCS[id][lang] || LEGAL_DOCS[id].hy).title
