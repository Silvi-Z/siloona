// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const wdChateauSections = [
  {
    id: 'hero', title: 'Գլխավոր էկրան', hideable: false, fromEvent: true,
    fields: [
      { path: 'welcome', label: 'Վերին տող', type: 'text' },
      { path: 'greeting.personal', label: 'Հյուրի անհատական հղումով', type: 'text', personal: true },
      { path: 'couple.first', label: 'Փեսացու', type: 'text' },
      { path: 'couple.second', label: 'Հարսնացու', type: 'text' },
    ],
  },
  {
    id: 'ceremony', title: 'Արարողություն', fromEvent: true,
    fields: [
      { path: 'ceremonyTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'parentsLabels.first', label: 'Փեսայի ծնողների վերնագիրը', type: 'text' },
      { path: 'parents.first', label: 'Փեսայի ծնողները', type: 'text' },
      { path: 'parentsLabels.second', label: 'Հարսի ծնողների վերնագիրը', type: 'text' },
      { path: 'parents.second', label: 'Հարսի ծնողները', type: 'text' },
      { path: 'intro', label: 'Հրավերի տեքստը', type: 'textarea' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'places.0.label', label: 'Պսակադրություն՝ անվանում', type: 'text' },
      { path: 'places.0.time', label: 'Պսակադրություն՝ ժամը', type: 'text' },
      { path: 'places.0.name', label: 'Պսակադրություն՝ վայրը', type: 'text' },
      { path: 'places.0.address', label: 'Պսակադրություն՝ հասցեն', type: 'text' },
      { path: 'places.1.label', label: 'Խնջույք՝ անվանում', type: 'text' },
      { path: 'places.1.time', label: 'Խնջույք՝ ժամը', type: 'text' },
      { path: 'places.1.name', label: 'Խնջույք՝ վայրը', type: 'text' },
      { path: 'places.1.address', label: 'Խնջույք՝ հասցեն (քարտեզի համար)', type: 'text' },
    ],
  },
  {
    id: 'gallery', title: 'Լուսանկարներ', hint: 'Լուսանկարները փոխվում են հենց հրավերի վրա։',
    fields: [{ path: 'gallery.title', label: 'Վերնագիր', type: 'text' }],
  },
  {
    id: 'reception', title: 'Խնջույք և հետհաշվարկ',
    fields: [
      { path: 'reception.title', label: 'Վերնագիր', type: 'text' },
      { path: 'reception.lead', label: 'Տեքստը', type: 'text' },
      { path: 'reception.welcomeLabel', label: 'Դիմավորում՝ անվանում', type: 'text' },
      { path: 'reception.welcomeTime', label: 'Դիմավորում՝ ժամը', type: 'text' },
      { path: 'reception.startLabel', label: 'Խնջույք՝ անվանում', type: 'text' },
      { path: 'countdownTitle', label: 'Հետհաշվարկի վերնագիր', type: 'text' },
      { path: 'calendarButton', label: 'Օրացույցի կոճակը', type: 'text' },
      { path: 'confirmButton', label: 'Հաստատման կոճակը', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Վայրը',
    fields: [
      { path: 'venueTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'mapButton', label: 'Քարտեզի կոճակը', type: 'text' },
    ],
  },
  {
    id: 'dressCode', title: 'Հագուստի ոճ',
    fields: [
      { path: 'dressCode.title', label: 'Վերնագիր', type: 'text' },
      { path: 'dressCode.text', label: 'Տեքստը', type: 'text' },
      { path: 'dressCode.colors', label: 'Գույներ', type: 'colors' },
    ],
  },
  {
    id: 'schedule', title: 'Օրվա ծրագիր', fromEvent: true,
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
      { path: 'rsvp.guestsLabel', label: 'Հյուրերի քանակի հարցը', type: 'text' },
      { path: 'rsvp.wishLabel', label: 'Մաղթանքի դաշտը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.thanksYes', label: 'Պատասխան, եթե գալիս է ({name}՝ հյուրի անունը)', type: 'text' },
      { path: 'rsvp.thanksNo', label: 'Պատասխան, եթե չի գալիս ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  {
    id: 'gift', title: 'Նվերների տուփ',
    fields: [
      { path: 'gift.title', label: 'Վերնագիր', type: 'text' },
      { path: 'gift.hint', label: 'Հուշում', type: 'text' },
      { path: 'gift.text', label: 'Տուփի ներսի տեքստը', type: 'textarea' },
    ],
  },
  {
    id: 'closing', title: 'Ավարտ',
    fields: [{ path: 'closing.line', label: 'Տեքստը', type: 'text' }],
  },
]
