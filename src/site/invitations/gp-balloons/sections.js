// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const gpBalloonsSections = [
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
      { path: 'title.first', label: 'Վերնագիր · 1-ին տող', type: 'text' },
      { path: 'title.or', label: 'Վերնագիր · միջին բառը', type: 'text' },
      { path: 'title.second', label: 'Վերնագիր · 2-րդ տող', type: 'text' },
      { path: 'parents.first', label: 'Ծնող 1', type: 'text' },
      { path: 'parents.second', label: 'Ծնող 2', type: 'text' },
      { path: 'parents.trail', label: 'Անուններից հետո', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
    ],
  },
  { id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։', fields: [{ path: 'countdownDone', label: 'Տեքստը միջոցառման օրը', type: 'text' }] },
  { id: 'schedule', title: 'Երեկոյի ծրագիրը', fromEvent: true, fields: [{ path: 'schedule', label: 'Ծրագիր', type: 'schedule' }] },
  {
    id: 'details', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
    ],
  },
  {
    id: 'dressCode', title: 'Դրես-կոդ',
    fields: [
      { path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է', type: 'textarea' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս', type: 'textarea' },
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
