import WdBeigeInvitation from './invitations/wd-beige/WdBeigeInvitation'
import BdAnimalsInvitation from './invitations/bd-animals/BdAnimalsInvitation'
import GpBalloonsInvitation from './invitations/gp-balloons/GpBalloonsInvitation'
import GpStorkInvitation from './invitations/gp-stork/GpStorkInvitation'
import BpBlueInvitation from './invitations/bp-blue/BpBlueInvitation'
import WdGreenInvitation from './invitations/wd-green/WdGreenInvitation'
import WdGardenInvitation from './invitations/wd-garden/WdGardenInvitation'
import WdMonoInvitation from './invitations/wd-mono/WdMonoInvitation'
import WdRougeInvitation from './invitations/wd-rouge/WdRougeInvitation'
import WdCherryInvitation from './invitations/wd-cherry/WdCherryInvitation'
import WdPortraitInvitation from './invitations/wd-portrait/WdPortraitInvitation'
import WdVelvetInvitation from './invitations/wd-velvet/WdVelvetInvitation'
import WdLineInvitation from './invitations/wd-line/WdLineInvitation'
import WdCallaInvitation from './invitations/wd-calla/WdCallaInvitation'
import WdMeadowInvitation from './invitations/wd-meadow/WdMeadowInvitation'
import BdPlanetInvitation from './invitations/bd-planet/BdPlanetInvitation'
import BdBalloonsInvitation from './invitations/bd-balloons/BdBalloonsInvitation'
import BdStitchInvitation from './invitations/bd-stitch/BdStitchInvitation'
import BdCarsInvitation from './invitations/bd-cars/BdCarsInvitation'
import BdBuildInvitation from './invitations/bd-build/BdBuildInvitation'
import BdCastleInvitation from './invitations/bd-castle/BdCastleInvitation'
import CeGarlandInvitation from './invitations/ce-garland/CeGarlandInvitation'
import CePineInvitation from './invitations/ce-pine/CePineInvitation'
import BdDotsInvitation from './invitations/bd-dots/BdDotsInvitation'
import CeTruckInvitation from './invitations/ce-truck/CeTruckInvitation'
import CeToastInvitation from './invitations/ce-toast/CeToastInvitation'
import CeHollyInvitation from './invitations/ce-holly/CeHollyInvitation'
import WdChateauInvitation from './invitations/wd-chateau/WdChateauInvitation'
import CeGroovyInvitation from './invitations/ce-groovy/CeGroovyInvitation'
import CeJingleInvitation from './invitations/ce-jingle/CeJingleInvitation'
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
  'gp-stork': { component: GpStorkInvitation, title: 'Տղա՞, թե՞ աղջի՞կ · արագիլ', defaultData: INVITATION_DEFAULTS['gp-stork'] },
  'bp-blue': { component: BpBlueInvitation, title: 'Սամվելի մկրտությունը', defaultData: INVITATION_DEFAULTS['bp-blue'] },
  'wd-green': { component: WdGreenInvitation, title: 'Նարե և Արամ', defaultData: INVITATION_DEFAULTS['wd-green'] },
  'wd-garden': { component: WdGardenInvitation, title: 'Նարե և Արամ', defaultData: INVITATION_DEFAULTS['wd-garden'] },
  'wd-mono': { component: WdMonoInvitation, title: 'Լիանա & Հայկ', defaultData: INVITATION_DEFAULTS['wd-mono'] },
  'wd-rouge': { component: WdRougeInvitation, title: 'Տիգրան & Անի', defaultData: INVITATION_DEFAULTS['wd-rouge'] },
  'wd-cherry': { component: WdCherryInvitation, title: 'Անի & Դավիթ', defaultData: INVITATION_DEFAULTS['wd-cherry'] },
  'wd-portrait': { component: WdPortraitInvitation, title: 'Լիլիթ & Արման', defaultData: INVITATION_DEFAULTS['wd-portrait'] },
  'wd-velvet': { component: WdVelvetInvitation, title: 'Արման & Լիլիթ', defaultData: INVITATION_DEFAULTS['wd-velvet'] },
  'wd-line': { component: WdLineInvitation, title: 'Էրիկ & Սոնա', defaultData: INVITATION_DEFAULTS['wd-line'] },
  'wd-calla': { component: WdCallaInvitation, title: 'Ռուբեն & Էլեն', defaultData: INVITATION_DEFAULTS['wd-calla'] },
  'wd-meadow': { component: WdMeadowInvitation, title: 'Արեն & Նանե', defaultData: INVITATION_DEFAULTS['wd-meadow'] },
  'bd-planet': { component: BdPlanetInvitation, title: 'Արսենի 5 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-planet'] },
  'bd-balloons': { component: BdBalloonsInvitation, title: 'Լեոնի 3 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-balloons'] },
  'bd-stitch': { component: BdStitchInvitation, title: 'Սոֆիի 2 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-stitch'] },
  'bd-cars': { component: BdCarsInvitation, title: 'Մարկի 4 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-cars'] },
  'bd-build': { component: BdBuildInvitation, title: 'Հայկի 2 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-build'] },
  'bd-castle': { component: BdCastleInvitation, title: 'Էլենի 4 տարեկանը', defaultData: INVITATION_DEFAULTS['bd-castle'] },
  'ce-garland': { component: CeGarlandInvitation, title: 'Սուրբ Ծննդյան երեկո', defaultData: INVITATION_DEFAULTS['ce-garland'] },
  'bd-dots': { component: BdDotsInvitation, title: 'Սոնայի 6-րդ ծննդյան տոնը', defaultData: INVITATION_DEFAULTS['bd-dots'] },
  'ce-pine': { component: CePineInvitation, title: 'Ամանորյա երեկույթ', defaultData: INVITATION_DEFAULTS['ce-pine'] },
  'wd-chateau': { component: WdChateauInvitation, title: 'Դավիթ & Մարիամ', defaultData: INVITATION_DEFAULTS['wd-chateau'] },
  'ce-jingle': { component: CeJingleInvitation, title: 'Զնգոց ու ծիծաղ', defaultData: INVITATION_DEFAULTS['ce-jingle'] },
  'ce-groovy': { component: CeGroovyInvitation, title: 'Զնգ-զնգ ու պար', defaultData: INVITATION_DEFAULTS['ce-groovy'] },
  'ce-holly': { component: CeHollyInvitation, title: 'Ամանորյա երեկույթ · ընկերություն', defaultData: INVITATION_DEFAULTS['ce-holly'] },
  'ce-toast': { component: CeToastInvitation, title: 'Ձմեռ Պապի կենացը', defaultData: INVITATION_DEFAULTS['ce-toast'] },
  'ce-truck': { component: CeTruckInvitation, title: 'Փոքրիկ ամանորյա երեկույթ', defaultData: INVITATION_DEFAULTS['ce-truck'] },
  // A printed card with an editable preview page (CARD_DESIGNS in designCatalog.js).
  'card-mouse': { component: CardMouseInvitation, title: 'Էրիկի 1 տարեկանը', defaultData: INVITATION_DEFAULTS['card-mouse'] },
}
