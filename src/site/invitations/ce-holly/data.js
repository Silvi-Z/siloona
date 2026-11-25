// All guest-facing text, dates and colours for the "ce-holly" corporate
// New Year party invitation: cream paper in a thin green frame, watercolour
// greenery in the top right corner (pine, holly, a pinecone, dried
// oranges, eucalyptus), a red bauble swinging top left, and the stocking,
// gift and greenery along the bottom (after the supplied reference card).
// Components read this shape via the shared editing context;
// data.i18n.js has Russian and English.
//
// eventDate drives the date row (weekday | month + day | time), the
// countdown and the calendar link.
export const ceHollyDefaultData = {
  eventDate: '2026-12-18T19:00:00',
  // Who invites — the small line over the title.
  company: '«Նովա» ընկերություն',
  hero: {
    kicker: 'Հրավիրում ենք',
    // The big serif title, then the handwritten word under it.
    title: 'Ամանորյա',
    script: 'երեկույթի',
    text: 'Միացեք մեզ գեղեցիկ երեկոյի, որտեղ փայլող զարդերն ու ջերմ հանդիպումները տոնը դարձնում են առանձնահատուկ',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի գործընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Շնորհակալ ենք այս տարվա ամեն օրվա համար։ Եկեք միասին ճանապարհենք այն՝ տոնական սեղանի շուրջ, երաժշտությամբ և լավ տրամադրությամբ։',
  countdownTitle: 'Մինչև երեկույթը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և ապերիտիվ' },
    { time: '19:30', label: 'Ղեկավարության խոսքը' },
    { time: '20:00', label: 'Տոնական ընթրիք' },
    { time: '21:30', label: 'Նվերներ և մրցանակներ' },
    { time: '22:00', label: 'Երաժշտություն և պար' },
  ],
  venueTitle: 'Որտե՞ղ',
  venue: {
    name: '«Ձմեռային այգի» սրահ',
    // Also the map link's search query.
    address: 'Երևան',
  },
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Երեկոյան հագուստ՝ կանաչի, կարմիրի կամ ոսկեգույնի տոնական մի դետալով։',
    colors: ['#2f5d34', '#c4232c', '#d9a441', '#f6f1e3'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք հաստատել ձեր մասնակցությունը մինչև դեկտեմբերի 12-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
    no: 'Ցավոք, ոչ',
    plusLabel: 'Ինչպե՞ս կգաք',
    // [0] alone, [1] with a companion — the index is the RSVP's `plus`.
    plusOptions: ['Միայնակ', 'Ուղեկցորդով'],
    noteLabel: 'Սննդային նախընտրություններ կամ հարց (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կսպասենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Շնորհավոր Նոր տարի', signature: '«Նովա» ընկերության թիմ' },
  // Sections hidden by the hosts (ids from sections.js); content is kept.
  hidden: {},
}
