import WdBeigeInvitation from './invitations/wd-beige/WdBeigeInvitation'
import BdAnimalsInvitation from './invitations/bd-animals/BdAnimalsInvitation'
import GpBalloonsInvitation from './invitations/gp-balloons/GpBalloonsInvitation'
import BdDuckInvitation from './invitations/bd-duck/BdDuckInvitation'
import BpBlueInvitation from './invitations/bp-blue/BpBlueInvitation'
import WdGardenSoftInvitation from './invitations/wd-garden-soft/WdGardenSoftInvitation'
import WdGreenInvitation from './invitations/wd-green/WdGreenInvitation'
import WdGardenInvitation from './invitations/wd-garden/WdGardenInvitation'
import WdTulipInvitation from './invitations/wd-tulip/WdTulipInvitation'
import WdVelvetInvitation from './invitations/wd-velvet/WdVelvetInvitation'
import BdPlanetInvitation from './invitations/bd-planet/BdPlanetInvitation'
import BdBalloonsInvitation from './invitations/bd-balloons/BdBalloonsInvitation'
import CardMouseInvitation from './invitations/card-mouse/CardMouse'
import { INVITATION_DEFAULTS } from './invitationDefaults'

// Maps a catalog item's preview slug to its invitation component and
// default content. Add an entry here for each new design that gets its
// own full-page preview (plus its defaults in invitationDefaults.js) —
// InvitationPreview.jsx uses `defaultData` to set up that design's
// live-editing context automatically, so every invitation gets edit mode
// without its own editing code.
export const INVITATION_PREVIEWS = {
  'wd-beige': { component: WdBeigeInvitation, title: 'Միքայել & Տաթև', defaultData: INVITATION_DEFAULTS['wd-beige'] },
  'bd-animals': { component: BdAnimalsInvitation, title: 'Նարեի 1 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-animals'] },
  'gp-balloons': { component: GpBalloonsInvitation, title: 'Տղա՞, թե՞ Աղջիկ', defaultData: INVITATION_DEFAULTS['gp-balloons'] },
  'bd-duck': { component: BdDuckInvitation, title: 'Լիլիթի 5 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-duck'] },
  'bp-blue': { component: BpBlueInvitation, title: 'Սամվելի մկրտությունը', defaultData: INVITATION_DEFAULTS['bp-blue'] },
  'wd-garden-soft': { component: WdGardenSoftInvitation, title: 'Աննա & Միքայել', defaultData: INVITATION_DEFAULTS['wd-garden-soft'] },
  'wd-green': { component: WdGreenInvitation, title: 'Նարե և Արամ', defaultData: INVITATION_DEFAULTS['wd-green'] },
  'wd-garden': { component: WdGardenInvitation, title: 'Նարե և Արամ', defaultData: INVITATION_DEFAULTS['wd-garden'] },
  'wd-tulip': { component: WdTulipInvitation, title: 'Դավիթ & Մարիամ', defaultData: INVITATION_DEFAULTS['wd-tulip'] },
  'wd-velvet': { component: WdVelvetInvitation, title: 'Արման & Լիլիթ', defaultData: INVITATION_DEFAULTS['wd-velvet'] },
  'bd-planet': { component: BdPlanetInvitation, title: 'Արսենի 5 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-planet'] },
  'bd-balloons': { component: BdBalloonsInvitation, title: 'Լեոնի 3 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-balloons'] },
  // A printed card with an editable preview page (CARD_DESIGNS in designCatalog.js).
  'card-mouse': { component: CardMouseInvitation, title: 'Էրիկի 1 տարեկանը', defaultData: INVITATION_DEFAULTS['card-mouse'] },
}
