// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings). The two
// dress-code photos are changed on the invitation itself.
const placeFields = (i) => [
  { path: `places.${i}.label`, label: `${i + 1}-ին վայրի վերնագիրը`, type: 'text' },
  { path: `places.${i}.time`, label: 'Ժամը', type: 'text' },
  { path: `places.${i}.name`, label: 'Վայրը', type: 'text' },
  { path: `places.${i}.address`, label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
]

export const wdFeteSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'couple', title: 'Գլխավոր էկրան', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Հարսնացու', type: 'text' },
      { path: 'couple.second', label: 'Փեսացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.left', label: 'Վերին տող՝ ձախ', type: 'text' },
      { path: 'hero.right', label: 'Վերին տող՝ աջ', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Վայրերը', fromEvent: true,
    fields: [{ path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' }, ...placeFields(0), ...placeFields(1)],
  },
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
      { path: 'dressCode.style', label: 'Ոճը', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
      { path: 'dressCode.button', label: 'Կոճակը', type: 'text' },
      { path: 'dressCode.link', label: 'Կոճակի հղումը (օր.՝ Pinterest)', type: 'text' },
    ],
  },
  {
    id: 'details', title: 'Մանրամասներ',
    fields: [
      { path: 'details.title', label: 'Վերնագիր', type: 'text' },
      { path: 'details.gifts', label: 'Նվերների մասին', type: 'textarea' },
      { path: 'details.wine', label: 'Ծաղիկների փոխարեն', type: 'textarea' },
    ],
  },
  {
    id: 'organizer', title: 'Կազմակերպիչ',
    fields: [
      { path: 'organizer.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'organizer.telegram', label: 'Telegram (@անուն կամ հեռախոս)', type: 'text' },
      { path: 'organizer.phone', label: 'Հեռախոս', type: 'text' },
      { path: 'organizer.tgButton', label: 'Telegram կոճակը', type: 'text' },
      { path: 'organizer.callButton', label: 'Զանգի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'rsvp', title: 'Հյուրի հարցաթերթիկ (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.intro', label: 'Տեքստը', type: 'textarea' },
      { path: 'rsvp.attendQ', label: 'Մասնակցության հարցը', type: 'text' },
      { path: 'rsvp.yes', label: '«Գալիս եմ» տարբերակը', type: 'text' },
      { path: 'rsvp.no', label: '«Չեմ գալիս» տարբերակը', type: 'text' },
      { path: 'rsvp.transferQ', label: 'Տրանսֆերի հարցը', type: 'text' },
      { path: 'rsvp.drinksQ', label: 'Խմիչքների հարցը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  { id: 'countdown', title: 'Հետհաշվարկ', fields: [{ path: 'countdownTitle', label: 'Վերնագիր', type: 'text' }] },
  { id: 'closing', title: 'Ավարտ', fields: [{ path: 'closing.line', label: 'Անուններից առաջ', type: 'text' }] },
]
