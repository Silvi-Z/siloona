// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const wdGreenSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.general', label: 'Ընդհանուր հղումով', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'message', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Հարսնացու', type: 'text' },
      { path: 'couple.second', label: 'Փեսացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.kicker', label: 'Վերին տող', type: 'text' },
    ],
  },
  { id: 'intro', title: 'Բացման էկրան', hideable: false, fields: [{ path: 'curtain.hint', label: 'Հուշում', type: 'text' }] },
  {
    id: 'story', title: 'Մեր պատմությունը',
    fields: [0, 1, 2].flatMap((i) => [
      { path: `story.${i}.year`, label: `${i + 1}-ին տարեթիվ`, type: 'text' },
      { path: `story.${i}.text`, label: `${i + 1}-ին տարեթվի տեքստը`, type: 'text' },
    ]),
  },
  { id: 'calendar', title: 'Օրացույց', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։', fields: [] },
  { id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։', fields: [] },
  {
    id: 'schedule', title: 'Օրվա ծրագիր', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'dressCode', title: 'Հագուստի ոճ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.intro', label: 'Տեքստը', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
    ],
  },
  {
    id: 'rsvp', title: 'Մանրամասներ և հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'details.title', label: 'Վերնագիր', type: 'text' },
      { path: 'details.text', label: 'Տեքստը', type: 'textarea' },
      { path: 'contacts.phone', label: 'Կազմակերպչի հեռախոսը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.title', label: 'Պատուհանի վերնագիրը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.title', label: 'Վերնագիր', type: 'text' },
      { path: 'venue.intro', label: 'Ներածություն', type: 'text' },
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Ստորագրություն', fields: [{ path: 'sign', label: 'Անուններից առաջ', type: 'text' }] },
]
