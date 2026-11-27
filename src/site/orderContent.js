import { deepMerge } from './invitations/shared/pathUtils'
import { prefillFromCustomization } from './invitationPrefill'
import { contentFromDetails } from './invitationDetails'
import { defaultsFor } from './invitationDefaults'

// A purchased invitation's content: design ← checkout details ← the
// customer's own edits. Orders from before the design's own details were
// asked have only names / date / venue. A Russian / English invitation
// starts from that language's demo. Used by the page guests open
// (pages/SharedInvitation.jsx) and the preview on the order page.
export const INVITATION_LANGS = ['hy', 'ru', 'en']
export const orderInvitationLang = (content) => (INVITATION_LANGS.includes(content?.lang) ? content.lang : 'hy')

export function orderInvitationContent(slug, { details, customization, content }) {
  const lang = orderInvitationLang(content)
  const filled = details ? contentFromDetails(slug, details, lang) : prefillFromCustomization(slug, customization, lang)
  return deepMerge(deepMerge(defaultsFor(slug, lang), filled), content)
}
