// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const gpStorkSections = [
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
      { path: 'kicker', label: 'Վերնագրի վերևի տողը', type: 'text' },
      { path: 'title.first', label: 'Վերնագիր · 1-ին բառը', type: 'text' },
      { path: 'title.or', label: 'Վերնագիր · միջին բառը', type: 'text' },
      { path: 'title.second', label: 'Վերնագիր · 2-րդ բառը', type: 'text' },
      { path: 'parents.first', label: 'Ծնող 1', type: 'text' },
      { path: 'parents.second', label: 'Ծնող 2', type: 'text' },
      { path: 'parents.trail', label: 'Անուններից հետո', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
    ],
  },
  {
    id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։',
    fields: [
      { path: 'countdownTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'countdownDone', label: 'Տեքստը միջոցառման օրը', type: 'text' },
      { path: 'calendarButton', label: 'Օրացույցի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'schedule', title: 'Երեկոյի ծրագիրը', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'details', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'dressCode', title: 'Դրես-կոդ',
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
      { path: 'rsvp.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guessLabel', label: 'Գուշակության հարցը', type: 'text' },
      { path: 'rsvp.boy', label: '«Տղա» տարբերակը', type: 'text' },
      { path: 'rsvp.girl', label: '«Աղջիկ» տարբերակը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  {
    id: 'closing', title: 'Եզրափակում',
    fields: [
      { path: 'closing.title', label: 'Վերնագիր', type: 'text' },
      { path: 'closing.signature', label: 'Ստորագրություն', type: 'text' },
    ],
  },
]
