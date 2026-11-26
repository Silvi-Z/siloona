// All guest-facing text, dates and colours for the "ce-pine" holiday party
// invitation: watercolour pine branches on deep green, gold lettering and
// a little snow (after the supplied reference card). Components read this
// shape via the shared editing context; data.i18n.js has the Russian and
// English versions.
//
// eventDate drives every displayed date: the cover's day row and time
// line, the countdown and the calendar link.
export const cePineDefaultData = {
  eventDate: '2026-12-27T19:00:00',
  // The hosts — under the cover and as the closing signature.
  hosts: 'Ավետիսյանների ընտանիք',
  hero: {
    intro: 'Տունը զարդարված է եղևնիով, և մենք պատրաստ ենք տոնին…',
    script: 'մեր ավանդական տասներորդ',
    // The big gold title, one line each.
    title1: 'Ամանորյա',
    title2: 'երեկույթ',
    text: 'Միացեք մեզ՝ տոնական սեղանի, տաք գինու, խաղերի և ամանորյա ուրախության համար',
    // After the time: «Ժամը 19:00-ին՝ մեր տանը».
    place: 'մեր տանը',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Տարին ավարտվում է, և այն ճանապարհելու ամենալավ ձևը սիրելի մարդկանց հետ մեկ սեղանի շուրջ հավաքվելն է։ Կլինեն տաք գինի, թխվածքներ, երաժշտություն և շատ ծիծաղ։',
  countdownTitle: 'Մինչև երեկույթը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և տաք գինի' },
    { time: '19:30', label: 'Տոնական ընթրիք' },
    { time: '21:00', label: 'Խաղեր և նվերների փոխանակում' },
    { time: '22:30', label: 'Երաժշտություն և պար' },
  ],
  venueTitle: 'Որտե՞ղ',
  venue: {
    name: 'Մեր տունը',
    // Also the map link's search query.
    address: 'Երևան',
  },
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Տոնական և հարմարավետ՝ կանաչի, ոսկեգույնի կամ կարմիրի մի դետալով։ Տաք սվիտերները նույնպես ողջունելի են։',
    colors: ['#1f4a30', '#c9a55c', '#8e2a2a', '#efe6d2'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև դեկտեմբերի 20-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
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
  closing: { line: 'Ջերմ սպասում ենք ձեզ' },
  // Sections hidden by the hosts (ids from sections.js); content is kept.
  hidden: {},
}
