// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings). This design has
// no schedule, dress code or gifts, so none are declared and no editor
// offers them.
export const bdAnimalsSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'child', title: 'Տոնի հերոսը', hideable: false, fromEvent: true,
    fields: [
      { path: 'child.name', label: 'Անունը', type: 'text' },
      { path: 'child.age', label: 'Տարիքը', type: 'text' },
    ],
  },
  { id: 'intro', title: 'Բացման էկրան', hideable: false, fields: [{ path: 'gate.teaser', label: 'Վարագույրի տեքստը', type: 'text' }] },
  {
    id: 'details', title: 'Ամսաթիվ և վայր', fromEvent: true,
    fields: [
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'venue.name', label: 'Վայրի անվանումը', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.deadlineLabel', label: 'Ժամկետի տեքստը', type: 'text' },
      { path: 'rsvp.contactName', label: 'Կոնտակտային անձ', type: 'text' },
      { path: 'rsvp.contactPhone', label: 'Հեռախոս', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է', type: 'textarea' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս', type: 'textarea' },
    ],
  },
  { id: 'signature', title: 'Ստորագրություն', fields: [{ path: 'signature', label: 'Տեքստը', type: 'text' }] },
]
