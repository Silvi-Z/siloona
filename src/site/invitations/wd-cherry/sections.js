// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings). Photos are
// changed on the invitation itself («Փոխել լուսանկարը» in edit mode).
const placeFields = (i) => [
  { path: `places.${i}.label`, label: `${i + 1}-ին վայրի վերնագիրը`, type: 'text' },
  { path: `places.${i}.time`, label: 'Ժամը', type: 'text' },
  { path: `places.${i}.name`, label: 'Վայրը', type: 'text' },
  { path: `places.${i}.address`, label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
]

export const wdCherrySections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը (ամսաթվից առաջ)', type: 'textarea' }] },
  {
    id: 'couple', title: 'Գլխավոր էկրան', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Հարսնացու', type: 'text' },
      { path: 'couple.second', label: 'Փեսացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.kicker', label: 'Վերին տող', type: 'text' },
      { path: 'hero.title', label: 'Վերնագիր', type: 'text' },
      { path: 'hero.her', label: 'Նրա խոսքը (ձախում)', type: 'text' },
      { path: 'hero.him', label: 'Նրա պատասխանը (աջում)', type: 'text' },
      { path: 'hero.ribbon', label: 'Ժապավենի տեքստը', type: 'text' },
    ],
  },
  { id: 'calendar', title: 'Օրացույց', fields: [{ path: 'calendarNote', label: 'Գրառում', type: 'text' }] },
  {
    id: 'schedule', title: 'Օրվա ծրագիր', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'dressCode', title: 'Դրես-կոդ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
      { path: 'dressCode.refsNote', label: 'Գրառում օրինակների վերևում', type: 'text' },
    ],
  },
  {
    id: 'wishes', title: 'Ցանկություններ',
    fields: [
      { path: 'wishes.title', label: 'Վերնագիր', type: 'text' },
      { path: 'wishes.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'wishes.note', label: 'Գրառում շշի կողքին', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Վայրերը', fromEvent: true,
    fields: [
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
      ...placeFields(0), ...placeFields(1),
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.guestLabel', label: 'Հյուրերի թվի հարցը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Ավարտ', fields: [{ path: 'closing.line', label: 'Անուններից առաջ', type: 'text' }] },
]
