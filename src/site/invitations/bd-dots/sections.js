// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const bdDotsSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'hero', title: 'Գլխավոր էկրան', hideable: false, fromEvent: true,
    fields: [
      { path: 'hero.arcTop', label: 'Վերևի կլոր տողը', type: 'text' },
      { path: 'hero.script', label: 'Ձեռագիր տող', type: 'text' },
      { path: 'hero.title1', label: 'Վերնագիր, տող 1', type: 'text' },
      { path: 'hero.title2', label: 'Վերնագիր, տող 2', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'endTime', label: 'Ավարտի ժամը', type: 'time' },
      { path: 'hero.activities', label: 'Ինչ է լինելու', type: 'text' },
      { path: 'rsvpLine', label: 'Ներքևի կլոր տողը', type: 'text' },
    ],
  },
  {
    id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։',
    fields: [
      { path: 'countdownTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'calendarButton', label: 'Օրացույցի կոճակը', type: 'text' },
    ],
  },
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
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'dressCode', title: 'Հագուստի ոճ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guestsLabel', label: 'Հյուրերի քանակի հարցը', type: 'text' },
      { path: 'rsvp.noteLabel', label: 'Մաղթանքի դաշտը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  {
    id: 'closing', title: 'Ավարտ',
    fields: [
      { path: 'closing.line', label: 'Տեքստը', type: 'text' },
      { path: 'closing.signature', label: 'Ստորագրություն', type: 'text' },
    ],
  },
]
