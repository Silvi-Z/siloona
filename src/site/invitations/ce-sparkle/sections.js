// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const ceSparkleSections = [
  {
    id: 'cover', title: 'Գլխավոր էկրան', hideable: false, fromEvent: true,
    hint: 'Ֆոնի լուսանկարը փոխվում է հենց հրավերի վրա՝ առաջին էկրանին։',
    fields: [
      { path: 'company', label: 'Ով է հրավիրում', type: 'text' },
      { path: 'cover.script', label: 'Ձեռագիր տողը (լատինատառ)', type: 'text' },
      { path: 'cover.word', label: 'Լայն բառը (լատինատառ)', type: 'text' },
      { path: 'cover.year', label: 'Տարեթիվը', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
    ],
  },
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'venue', title: 'Ամսաթիվ և վայր', fromEvent: true,
    fields: [
      { path: 'venue.name', label: 'Վայրը', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի համար)', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
      { path: 'calendarButton', label: 'Օրացույցի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'schedule', title: 'Երեկոյի ծրագիր', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Ավարտ', fields: [{ path: 'closing.line', label: 'Տեքստը', type: 'text' }] },
]
