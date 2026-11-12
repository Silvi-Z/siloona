import GenderRevealCard from './cards/GenderRevealCard'
import BirthdayCard from './cards/BirthdayCard'
import { CardMouseArt } from './invitations/card-mouse/CardMouse'
import wdBeigeThumb from './assets/wd-beige-catalog.png'
import bdAnimalsThumb from './invitations/bd-animals/assets/lion.webp'
import gpBalloonsThumb from './invitations/gp-balloons/assets/catalog-thumb.webp'
import gpStorkThumb from './invitations/gp-stork/assets/catalog-thumb.webp'
import ceOrnamentThumb from './invitations/ce-ornament/assets/catalog-thumb.webp'
import bdDuckThumb from './invitations/bd-duck/assets/catalog-thumb.webp'
import bpBlueThumb from './invitations/bp-blue/assets/catalog-thumb.webp'
import wdGardenSoftThumb from './invitations/wd-garden-soft/assets/catalog-thumb.webp'
import wdGreenThumb from './invitations/wd-green/assets/catalog-thumb.webp'
import wdGardenThumb from './invitations/wd-garden/assets/catalog-thumb.webp'
import wdTulipThumb from './invitations/wd-tulip/assets/catalog-thumb.webp'
import wdVelvetThumb from './invitations/wd-velvet/assets/catalog-thumb.webp'
import wdLineThumb from './invitations/wd-line/assets/catalog-thumb.webp'
import wdCallaThumb from './invitations/wd-calla/assets/catalog-thumb.webp'
import wdMeadowThumb from './invitations/wd-meadow/assets/catalog-thumb.webp'
import bdPlanetThumb from './invitations/bd-planet/assets/catalog-thumb.webp'
import bdBalloonsThumb from './invitations/bd-balloons/assets/catalog-thumb.webp'
import bdStitchThumb from './invitations/bd-stitch/assets/catalog-thumb.webp'
import bdCarsThumb from './invitations/bd-cars/assets/catalog-thumb.webp'
import bdBuildThumb from './invitations/bd-build/assets/catalog-thumb.webp'

// Single source of truth for every invitation design Siloona offers —
// read by the public /invitations catalog (WebCatalog / CardCatalog) and
// by the dashboard's per-event design picker. Adding a design means
// adding one entry here; neither catalog's rendering code changes.
//
// Only real, provided designs belong here.
//   code        explicit per design (TYPE-CAT-NN), not derived from array
//               position, so it stays stable as entries are added/reordered.
//   category    the public catalog's filter tab (Invitations.jsx).
//   eventTypes  which dashboard event types (dashboard/data/constants.js
//               TYPES keys) this design is meant for — the dashboard only
//               ever offers an event the designs listed for its own type.
//   previewRoute / previewSlug  designs with a full page of their own
//               (see invitationRegistry.js) — web designs, and cards built
//               as editable pages; only those can be edited.
export const WEB_DESIGNS = [
  // {
  //   id: 'wd-beige',
  //   kind: 'web',
  //   title: 'Միքայել & Տաթև',
  //   code: 'WEB-WED-01',
  //   type: 'Հարսանիք',
  //   category: 'wedding',
  //   eventTypes: ['wedding'],
  //   available: true,
  //   previewSlug: 'wd-beige',
  //   previewRoute: '/invitations/preview/wd-beige',
  //   image: wdBeigeThumb,
  //   pricing: { diy: 15000, assisted: 20000 },
  // },
  {
    id: 'wd-garden-soft',
    kind: 'web',
    title: 'Աննա & Միքայել',
    code: 'WEB-WED-02',
    type: 'Հարսանիք',
    category: 'wedding',
    eventTypes: ['wedding'],
    available: true,
    previewSlug: 'wd-garden-soft',
    previewRoute: '/invitations/preview/wd-garden-soft',
    image: wdGardenSoftThumb,
    pricing: { diy: null, assisted: null },
  },
  // {
  //   id: 'wd-green',
  //   kind: 'web',
  //   title: 'Նարե և Արամ',
  //   code: 'WEB-WED-03',
  //   type: 'Հարսանիք',
  //   category: 'wedding',
  //   eventTypes: ['wedding'],
  //   available: true,
  //   previewSlug: 'wd-green',
  //   previewRoute: '/invitations/preview/wd-green',
  //   image: wdGreenThumb,
  //   pricing: { diy: null, assisted: null },
  // },
  // {
  //   id: 'wd-garden',
  //   kind: 'web',
  //   title: 'Նարե և Արամ',
  //   code: 'WEB-WED-04',
  //   type: 'Հարսանիք',
  //   category: 'wedding',
  //   eventTypes: ['wedding'],
  //   available: true,
  //   previewSlug: 'wd-garden',
  //   previewRoute: '/invitations/preview/wd-garden',
  //   image: wdGardenThumb,
  //   pricing: { diy: null, assisted: null },
  // },
  {
    id: 'wd-tulip',
    kind: 'web',
    title: 'Դավիթ & Մարիամ',
    code: 'WEB-WED-05',
    type: 'Հարսանիք',
    category: 'wedding',
    eventTypes: ['wedding'],
    available: true,
    previewSlug: 'wd-tulip',
    previewRoute: '/invitations/preview/wd-tulip',
    image: wdTulipThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'wd-velvet',
    kind: 'web',
    title: 'Արման & Լիլիթ',
    code: 'WEB-WED-06',
    type: 'Հարսանիք',
    category: 'wedding',
    eventTypes: ['wedding'],
    available: true,
    previewSlug: 'wd-velvet',
    previewRoute: '/invitations/preview/wd-velvet',
    image: wdVelvetThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'wd-line',
    kind: 'web',
    title: 'Էրիկ & Սոնա',
    code: 'WEB-WED-07',
    type: 'Հարսանիք',
    category: 'wedding',
    eventTypes: ['wedding'],
    available: true,
    previewSlug: 'wd-line',
    previewRoute: '/invitations/preview/wd-line',
    image: wdLineThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'wd-calla',
    kind: 'web',
    title: 'Ռուբեն & Էլեն',
    code: 'WEB-WED-08',
    type: 'Հարսանիք',
    category: 'wedding',
    eventTypes: ['wedding'],
    available: true,
    previewSlug: 'wd-calla',
    previewRoute: '/invitations/preview/wd-calla',
    image: wdCallaThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'wd-meadow',
    kind: 'web',
    title: 'Արեն & Նանե',
    code: 'WEB-WED-09',
    type: 'Հարսանիք',
    category: 'wedding',
    eventTypes: ['wedding'],
    available: true,
    previewSlug: 'wd-meadow',
    previewRoute: '/invitations/preview/wd-meadow',
    image: wdMeadowThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'bd-animals',
    kind: 'web',
    title: 'Նարեի 1 տարեկանը',
    code: 'WEB-BDAY-01',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-animals',
    previewRoute: '/invitations/preview/bd-animals',
    image: bdAnimalsThumb,
    pricing: { diy: 15000, assisted: 20000 },
  },
  {
    id: 'bd-duck',
    kind: 'web',
    title: 'Լիլիթի 5 տարեկանը',
    code: 'WEB-BDAY-02',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-duck',
    previewRoute: '/invitations/preview/bd-duck',
    image: bdDuckThumb,
    pricing: { diy: 15000, assisted: 20000 },
  },
  {
    id: 'bd-planet',
    kind: 'web',
    title: 'Արսենի 5 տարեկանը',
    code: 'WEB-BDAY-03',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-planet',
    previewRoute: '/invitations/preview/bd-planet',
    image: bdPlanetThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'bd-balloons',
    kind: 'web',
    title: 'Լեոնի 3 տարեկանը',
    code: 'WEB-BDAY-04',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-balloons',
    previewRoute: '/invitations/preview/bd-balloons',
    image: bdBalloonsThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'bd-stitch',
    kind: 'web',
    title: 'Սոֆիի 2 տարեկանը',
    code: 'WEB-BDAY-05',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-stitch',
    previewRoute: '/invitations/preview/bd-stitch',
    image: bdStitchThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'bd-cars',
    kind: 'web',
    title: 'Մարկի 4 տարեկանը',
    code: 'WEB-BDAY-06',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-cars',
    previewRoute: '/invitations/preview/bd-cars',
    image: bdCarsThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'bd-build',
    kind: 'web',
    title: 'Հայկի 2 տարեկանը',
    code: 'WEB-BDAY-07',
    type: 'Ծննդյան տոն',
    category: 'birthday',
    eventTypes: ['birthday'],
    available: true,
    previewSlug: 'bd-build',
    previewRoute: '/invitations/preview/bd-build',
    image: bdBuildThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'gp-balloons',
    kind: 'web',
    title: 'Տղա՞, թե՞ Աղջիկ',
    code: 'WEB-BAP-01',
    type: 'Գենդերի բացահայտում',
    // Same public tab as the gender-reveal card design below.
    category: 'baptism',
    eventTypes: ['genderReveal'],
    available: true,
    previewSlug: 'gp-balloons',
    previewRoute: '/invitations/preview/gp-balloons',
    image: gpBalloonsThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'gp-stork',
    kind: 'web',
    title: 'Տղա՞, թե՞ աղջի՞կ · արագիլ',
    code: 'WEB-BAP-03',
    type: 'Գենդերի բացահայտում',
    // Same public tab as gp-balloons.
    category: 'baptism',
    eventTypes: ['genderReveal'],
    available: true,
    previewSlug: 'gp-stork',
    previewRoute: '/invitations/preview/gp-stork',
    image: gpStorkThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'ce-ornament',
    kind: 'web',
    title: 'Ամանորյա երեկո',
    code: 'WEB-CORP-01',
    type: 'Կորպորատիվ միջոցառում',
    // Each guest's personal link writes their name on the ornament.
    category: 'corporate',
    eventTypes: ['corporate'],
    available: true,
    previewSlug: 'ce-ornament',
    previewRoute: '/invitations/preview/ce-ornament',
    image: ceOrnamentThumb,
    pricing: { diy: null, assisted: null },
  },
  {
    id: 'bp-blue',
    kind: 'web',
    title: 'Սամվելի մկրտությունը',
    code: 'WEB-BAP-02',
    type: 'Մկրտություն',
    category: 'baptism',
    eventTypes: ['christening'],
    available: true,
    previewSlug: 'bp-blue',
    previewRoute: '/invitations/preview/bp-blue',
    image: bpBlueThumb,
    pricing: { diy: null, assisted: null },
  },
]

export const CARD_DESIGNS = [
  { id: 'card-gender-reveal', kind: 'card', title: 'Աղջի՞կ, թե՞ Տղա', code: 'CARD-BAP-01', type: 'Գենդերի բացահայտում', category: 'baptism', eventTypes: ['genderReveal'], Art: GenderRevealCard, pricing: { diy: null, assisted: null } },
  { id: 'card-birthday', kind: 'card', title: 'Տարեդարձի երեկո', code: 'CARD-BDAY-01', type: 'Ծննդյան տոն', category: 'birthday', eventTypes: ['birthday'], Art: BirthdayCard, pricing: { diy: null, assisted: null } },
  { id: 'card-mouse', kind: 'card', title: 'Էրիկի 1 տարեկանը', code: 'CARD-BDAY-02', type: 'Ծննդյան տոն', category: 'birthday', eventTypes: ['birthday'], Art: CardMouseArt, previewSlug: 'card-mouse', previewRoute: '/invitations/preview/card-mouse', pricing: { diy: null, assisted: null } },
]

export const CATEGORY_LABELS = {
  wedding: 'Հարսանեկան',
  baptism: 'Մկրտության',
  birthday: 'Ծննդյան',
  corporate: 'Կորպորատիվ',
}

export function findDesign(id) {
  return WEB_DESIGNS.find((d) => d.id === id) || CARD_DESIGNS.find((d) => d.id === id) || null
}

export function designsForEventType(eventType) {
  const match = (d) => d.available !== false && d.eventTypes.includes(eventType)
  return { web: WEB_DESIGNS.filter(match), card: CARD_DESIGNS.filter(match) }
}
