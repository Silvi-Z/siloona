// All guest-facing text, dates and colours for the "bd-dots" birthday
// invitation: a frame of watercolour dots on textured paper, the words in
// a ring in the middle — a line curving over the top, a handwritten
// «join the fun», the title, the details, and the reply line curving
// under (after the supplied reference card). Components read this shape
// via the shared editing context; data.i18n.js has Russian and English.
//
// eventDate (the start) and endTime drive the date line, the countdown
// and the calendar link.
export const bdDotsDefaultData = {
  eventDate: '2027-04-17T13:00:00',
  // When the party ends, «HH:MM».
  endTime: '15:00',
  hero: {
    // Curves over the top of the ring.
    arcTop: 'Ծննդյան մեծ տոնակատարություն',
    script: 'Միացե՛ք տոնին',
    // The title, one line each (name, then the age).
    title1: 'Սոնայի',
    title2: '6-րդ ծննդյան տոնը',
    activities: 'Ձեռքի աշխատանք · Խաղեր · Թխվածքներ',
  },
  // Curves under the ring.
  rsvpLine: 'Պատասխանեք մինչև ապրիլի 10-ը',
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Սոնան դառնում է 6 տարեկան, և ամենալավ նվերը ձեր ներկայությունն է։ Կլինեն գույներ, խաղեր, տորթ և շատ ծիծաղ։',
  countdownTitle: 'Մինչև տոնը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Տոնի ծրագիրը',
  schedule: [
    { time: '13:00', label: 'Հյուրերի դիմավորում' },
    { time: '13:30', label: 'Ձեռքի աշխատանքի վարպետաց դաս' },
    { time: '14:15', label: 'Խաղեր և մրցույթներ' },
    { time: '14:45', label: 'Տորթ և մոմեր' },
  ],
  venueTitle: 'Որտե՞ղ',
  venue: {
    name: 'Սոնաենց տանը',
    // Also the map link's search query.
    address: 'Երևան',
  },
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Որքան գունավոր, այնքան լավ․ հարմարավետ հագուստ, որով հեշտ է խաղալ։',
    colors: ['#f06aa8', '#f59a32', '#f6d03a', '#86bd62', '#86c1de'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև ապրիլի 10-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգանք',
    no: 'Ցավոք, ոչ',
    guestsLabel: 'Քանի՞ հոգով կգաք',
    // [0] one person … — the index is the RSVP's `plus`.
    guestOptions: ['1', '2', '3', '4+'],
    noteLabel: 'Մաղթանք կամ հարց (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կսպասենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Սպասում ենք ձեզ', signature: 'Սոնայի ընտանիք' },
  // Sections hidden by the hosts (ids from sections.js); content is kept.
  hidden: {},
}
