// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const bdCastleSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'child', title: 'Տոնի հերոսը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'child.name', label: 'Անունը', type: 'text' },
      { path: 'child.age', label: 'Տարիքը (թիվը թագի տակ)', type: 'text' },
      { path: 'hero.title', label: 'Վերնագիր (օր.՝ «Էլենը դառնում է»)', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.kicker', label: 'Վերին տող', type: 'text' },
    ],
  },
  {
    id: 'intro', title: 'Բացման էկրան', hideable: false,
    fields: [
      { path: 'gate.kicker', label: 'Վերնագիր', type: 'text' },
      { path: 'gate.hint', label: 'Հուշում', type: 'text' },
    ],
  },
  { id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։', fields: [{ path: 'countdownTitle', label: 'Վերնագիր', type: 'text' }] },
  {
    id: 'schedule', title: 'Տոնի ծրագիրը', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'venue', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.title', label: 'Վերնագիր', type: 'text' },
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
      { path: 'venue.button', label: 'Կոճակը', type: 'text' },
    ],
  },
  {
    id: 'dressCode', title: 'Հագուստ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.nameLabel', label: 'Անվան դաշտը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս ենք» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չենք գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guestLabel', label: 'Հյուրերի թվի հարցը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  {
    id: 'closing', title: 'Ավարտ',
    fields: [
      { path: 'closing.line', label: 'Տողը', type: 'text' },
      { path: 'closing.signature', label: 'Ստորագրություն', type: 'text' },
    ],
  },
]
