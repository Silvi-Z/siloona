// "ce-garland" — a corporate Christmas invitation in the style of a classic
// printed card: warm cream paper, a watercolour fir garland with red
// berries and a sage satin bow across the top (the user's artwork,
// assets/garland.webp, cut out on transparency), deep green type in
// spaced capitals, thin rules with a dot, and the «ԴԵԿ | 24 | 19:00»
// date row.
//
// Same core keys as ce-ornament (company, hero.title, eventDate, venue,
// schedule, closing.signature), so a dashboard event fills it in the same
// way. eventDate drives the date row, the countdown and the calendar link.
export const ceGarlandDefaultData = {
  company: '«Նովա» ընկերություն',
  eventDate: '2026-12-24T19:00:00',
  hero: {
    // Above the title. Shown in capitals.
    kicker: 'Սիրով հրավիրում ենք Ձեզ մեր ավանդական',
    // One word per line on the cover. Shown in capitals.
    title: 'Սուրբ Ծննդյան երեկո',
  },
  // The welcome line. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Հարգելի գործընկերներ',
    personal: 'Հարգելի {name}',
  },
  message: 'Տարին ավարտվում է, և ուզում ենք շնորհակալություն հայտնել Ձեզ մեր համատեղ աշխատանքի, վստահության և ջերմության համար։ Եկեք միասին դիմավորենք տոները՝ լույսերի, երաժշտության և լավ մարդկանց շրջապատում։',
  countdownTitle: 'Մինչև երեկո մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և ապերիտիվ' },
    { time: '19:30', label: 'Ղեկավարության խոսքը' },
    { time: '20:00', label: 'Տոնական ընթրիք' },
    { time: '21:30', label: 'Տարվա մրցանակներ' },
    { time: '22:00', label: 'Երաժշտություն և պար' },
  ],
  venueTitle: 'Վայրը',
  venue: {
    name: '«Ձմեռային այգի» սրահ',
    // Also the map link's search query.
    address: 'Երևան, Մաշտոցի պողոտա 5',
  },
  mapButton: 'Ինչպես հասնել',
  // The line at the bottom of the cover, like «regrets only to …».
  contact: {
    label: 'Հարցերի համար',
    phone: '+374 10 123456',
  },
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Երեկոյան հագուստ՝ մուգ կանաչի, կարմիրի կամ սպիտակի տոնական մի դետալով։',
    colors: ['#2f4b2c', '#a8262b', '#f4efe6', '#c9a96a'],
  },
  rsvp: {
    title: 'Ձեր պատասխանը',
    intro: 'Խնդրում ենք հաստատել Ձեր մասնակցությունը մինչև դեկտեմբերի 15-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
    no: 'Ցավոք, ոչ',
    plusLabel: 'Ինչպե՞ս կգաք',
    // [0] alone, [1] with a companion — the index is the RSVP's `plus`.
    plusOptions: ['Միայնակ', 'Ուղեկցորդով'],
    dietLabel: 'Սննդային նախընտրություններ (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կսպասենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ այդ երեկո։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: { line: 'Շնորհավոր տոներ', signature: '«Նովա» ընկերության թիմ' },
  // Sections hidden by the organisers (ids from sections.js); content is kept.
  hidden: {},
}
