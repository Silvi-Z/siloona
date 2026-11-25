import { useInvitationContent } from './EditableContext'

// The invitation's own language — not the site's: the content says it
// (`lang`, set only on Russian / English content; Armenian has none). A
// design's fixed words (countdown units, form labels, month names) follow it.
export function useInvLang() {
  return useInvitationContent().data.lang || 'hy'
}

// dict = { hy: …, ru: …, en: … } → the entry for `lang` (Armenian if missing).
export const pick = (dict, lang) => dict[lang] || dict.hy
