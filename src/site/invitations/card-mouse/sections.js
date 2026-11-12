// What this card is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const cardMouseSections = [
  {
    id: 'child', title: 'Տոնի հերոսը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'child.name', label: 'Անունը', type: 'text' },
      { path: 'ageLine', label: 'Տարիքը (օր.՝ «1 տարեկան»)', type: 'text' },
      { path: 'subtitle', label: 'Ենթավերնագիր', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
    ],
  },
  {
    id: 'venue', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե', type: 'text' },
    ],
  },
]
