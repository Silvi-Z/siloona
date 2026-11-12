// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings). Guests confirm
// by phone in this design (no RSVP form), so `rsvpSettings` isn't declared.
export const bpBlueSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով (կարող է դատարկ մնալ)', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'hero', title: 'Երեխան և վերնագիրը', hideable: false, fromEvent: true,
    fields: [
      { path: 'childName', label: 'Երեխայի անունը (սեռական հոլովով՝ «Սամվելի»)', type: 'text' },
      { path: 'title', label: 'Վերնագիր', type: 'text' },
    ],
  },
  { id: 'prayer', title: 'Աղոթք', fields: [{ path: 'prayer', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'parents', title: 'Ծնողները', fromEvent: true,
    fields: [
      { path: 'parents.label', label: 'Վերնագիր', type: 'text' },
      { path: 'parents.first', label: 'Ծնող 1', type: 'text' },
      { path: 'parents.second', label: 'Ծնող 2', type: 'text' },
    ],
  },
  {
    id: 'godparents', title: 'Կնքահայր և կնքամայր',
    fields: [
      { path: 'godparents.label', label: 'Վերնագիր', type: 'text' },
      { path: 'godparents.first', label: 'Կնքահայր', type: 'text' },
      { path: 'godparents.second', label: 'Կնքամայր', type: 'text' },
    ],
  },
  { id: 'date', title: 'Ամսաթիվ', hideable: false, fromEvent: true, fields: [{ path: 'eventDate', label: 'Ամսաթիվ', type: 'date' }] },
  {
    id: 'church', title: 'Պատարագ', fromEvent: true,
    fields: [
      { path: 'places.0.time', label: 'Ժամը', type: 'text' },
      { path: 'places.0.title', label: 'Վերնագիր', type: 'text' },
      { path: 'places.0.name', label: 'Վայրը', type: 'text' },
      { path: 'places.0.address', label: 'Հասցե / քաղաք', type: 'text' },
    ],
  },
  {
    id: 'party', title: 'Տոնակատարություն', fromEvent: true,
    fields: [
      { path: 'places.1.time', label: 'Ժամը', type: 'text' },
      { path: 'places.1.title', label: 'Վերնագիր', type: 'text' },
      { path: 'places.1.name', label: 'Վայրը', type: 'text' },
      { path: 'places.1.address', label: 'Հասցե / քաղաք', type: 'text' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում հեռախոսով',
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'rsvp.contacts.0.label', label: 'Կոճակ 1', type: 'text' },
      { path: 'rsvp.contacts.0.phone', label: 'Հեռախոս 1', type: 'text' },
      { path: 'rsvp.contacts.1.label', label: 'Կոճակ 2', type: 'text' },
      { path: 'rsvp.contacts.1.phone', label: 'Հեռախոս 2', type: 'text' },
    ],
  },
  {
    id: 'dressCode', title: 'Հագուստի կոդ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'text' },
    ],
  },
  {
    id: 'closing', title: 'Եզրափակում',
    fields: [
      { path: 'closing.line', label: 'Տող', type: 'text' },
      { path: 'closing.thanks', label: 'Վերջին բառը', type: 'text' },
    ],
  },
]
