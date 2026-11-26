// All guest-facing text, dates and colours for the "ce-jingle" corporate
// Christmas / New Year party invitation: cute watercolour characters all
// round white paper (a gingerbread man, a candy cane, a Santa gnome, a
// tree, a stocking, a snowman, a star cookie, a stack of gifts and a fawn),
// a red brush-script title and spaced serif capitals (after the supplied
// reference card). Components read this shape via the shared editing
// context; data.i18n.js has Russian and English.
//
// eventDate drives the date row, the time line, the countdown and the
// calendar link.
export const ceJingleDefaultData = {
  eventDate: '2026-12-19T19:00:00',
  // Who invites — the small line over the title.
  company: '«Նովա» թիմ',
  hero: {
    // The red script title: line 1, a small «&», line 2.
    title1: 'Զնգոց',
    title2: 'ծիծաղ',
    amp: 'ու',
    kicker: 'Հրավիրում ենք',
    subtitle: 'ամանորյա երեկույթի',
    note: 'Բերեք փոքրիկ նվեր՝ «Գաղտնի Ձմեռ Պապ» խաղի համար',
  },
  // The cover's reply-by line.
  rsvpLine: 'Պատասխանեք մինչև դեկտեմբերի 12-ը',
  greeting: {
    general: 'Սիրելի գործընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Տարին ավարտում ենք տոնական սեղանի շուրջ՝ խաղերով, նվերներով և ամենաջերմ մարդկանց հետ։ Սպասում ենք ձեզ լավ տրամադրությամբ։',
  countdownTitle: 'Մինչև երեկույթը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և տաք գինի' },
    { time: '19:30', label: 'Տոնական ընթրիք' },
    { time: '20:30', label: '«Գաղտնի Ձմեռ Պապ»' },
    { time: '21:30', label: 'Խաղեր և մրցանակներ' },
    { time: '22:30', label: 'Երաժշտություն և պար' },
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
    text: 'Տոնական և հարմարավետ՝ կարմիր սվիտերները խրախուսվում են։',
    colors: ['#c8312f', '#4f8a4c', '#c9843f', '#f4e6cf'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև դեկտեմբերի 12-ը։',
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
  closing: { line: 'Շնորհավոր Նոր տարի', signature: '«Նովա» թիմ' },
  // Sections hidden by the hosts (ids from sections.js); content is kept.
  hidden: {},
}
