// What this design is made of, for editors (the dashboard's
// «Հրավերի բովանդակություն» panel builds itself from this list). Each
// section's `id` is the same id its <Section> wrapper uses in the
// components, so hiding/showing here hides/shows exactly that part.
//   role    'greeting' / 'message' — the two parts every editor names the
//           same way across designs («Անհատականացված ողջույն» /
//           «Ընդհանուր հաղորդագրություն»)
//   fromEvent  fields prefilled from the event's Details page
//   rsvpSettings  also show the event's RSVP deadline / companions
//   hideable  false for the parts the invitation can't exist without
// Field types: text, textarea, date, colors, schedule.
export const wdBeigeSections = [
  {
    id: 'greeting', role: 'greeting',
    fields: [
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'greeting.lead', label: 'Ընդհանուր հղումով · 1-ին տող', type: 'text' },
      { path: 'greeting.trail', label: 'Ընդհանուր հղումով · 2-րդ տող', type: 'text' },
    ],
  },
  { id: 'message', role: 'message', fields: [{ path: 'greeting.text', label: 'Տեքստը', type: 'textarea' }] },
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.groomFirst', label: 'Փեսացու', type: 'text' },
      { path: 'couple.brideFirst', label: 'Հարսնացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'closingNames', label: 'Ստորագրություն էջի վերջում', type: 'text' },
    ],
  },
  {
    id: 'story', title: 'Մեր պատմությունը',
    fields: [0, 1, 2].flatMap((i) => [
      { path: `story.${i}.year`, label: `${i + 1}. Տարեթիվ`, type: 'text' },
      { path: `story.${i}.title`, label: `${i + 1}. Վերնագիր`, type: 'text' },
      { path: `story.${i}.text`, label: `${i + 1}. Տեքստ`, type: 'textarea' },
    ]),
  },
  {
    id: 'ceremony', title: 'Պսակադրություն', fromEvent: true,
    fields: [
      { path: 'ceremony.title', label: 'Վերնագիր', type: 'text' },
      { path: 'ceremony.time', label: 'Ժամը', type: 'text' },
      { path: 'ceremony.name', label: 'Անվանում', type: 'text' },
      { path: 'ceremony.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Խնջույք', fromEvent: true,
    fields: [
      { path: 'venue.title', label: 'Վերնագիր', type: 'text' },
      { path: 'venue.time', label: 'Ժամը', type: 'text' },
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
    ],
  },
  { id: 'countdown', title: 'Հետհաշվարկ', hint: 'Հաշվվում է ավտոմատ՝ միջոցառման ամսաթվից։', fields: [] },
  { id: 'schedule', title: 'Ժամանակացույց', fromEvent: true, fields: [{ path: 'schedule', label: 'Ծրագիր', type: 'schedule' }] },
  {
    id: 'dressCode', title: 'Դրես-կոդ',
    fields: [
      { path: 'dressCode.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'dressCode.note', label: 'Մանրամասներ', type: 'textarea' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
    ],
  },
  {
    id: 'rsvp', title: 'Հարցաթերթիկ (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.intro', label: 'Ներածություն', type: 'textarea' },
      { path: 'rsvp.deadline', label: 'Պատասխանելու վերջնաժամկետ', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է', type: 'textarea' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս', type: 'textarea' },
    ],
  },
  {
    id: 'gifts', title: 'Նվերներ',
    fields: [
      { path: 'gift.flowersText', label: 'Ծաղիկների մասին', type: 'textarea' },
      { path: 'gift.envelopeText', label: 'Ծրարի մասին', type: 'textarea' },
      { path: 'gift.signature', label: 'Ստորագրություն', type: 'text' },
    ],
  },
]
