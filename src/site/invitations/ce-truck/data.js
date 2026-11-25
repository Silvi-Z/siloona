// All guest-facing text, dates and colours for the "ce-truck" holiday
// party invitation: a watercolour red pickup bringing home three
// decorated trees, a red handwritten «join us», a red serif title and
// spaced black details on soft paper (after the supplied reference card).
// Components read this shape via the shared editing context;
// data.i18n.js has the Russian and English versions.
//
// eventDate (the start) and endTime drive the cover's date and time lines,
// the countdown and the calendar link.
export const ceTruckDefaultData = {
  eventDate: '2026-12-19T17:00:00',
  // When the party ends, «HH:MM» — «from 5pm to 10pm».
  endTime: '22:00',
  // The hosts, after «Հյուրընկալում են» / «hosted by».
  hosts: 'Սարգսյանները',
  hero: {
    script: 'Միացեք մեզ',
    kicker: 'մեր',
    // The red title, one line each.
    title1: 'փոքրիկ ամանորյա',
    title2: 'երեկույթին',
  },
  // The cover's last line.
  rsvpLine: 'պատասխանեք մինչև դեկտեմբերի 12-ը',
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Եղևնիները արդեն տանն են, տաք գինին՝ կրակի վրա։ Եկեք միասին զարդարենք երեկոն՝ երգերով, խաղերով և տոնական սեղանով։',
  countdownTitle: 'Մինչև երեկույթը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '17:00', label: 'Դիմավորում և տաք գինի' },
    { time: '18:00', label: 'Եղևնու զարդարում' },
    { time: '19:00', label: 'Տոնական ընթրիք' },
    { time: '21:00', label: 'Նվերների փոխանակում' },
  ],
  venueTitle: 'Որտե՞ղ',
  venue: {
    name: 'Մեր տանը',
    // Also the map link's search query.
    address: 'Երևան',
  },
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Տոնական և հարմարավետ․ կարմիրի, կանաչի կամ սպիտակի մի դետալը միայն կզարդարի երեկոն։',
    colors: ['#c8141c', '#2f7a33', '#f4f1ec', '#d08a4a'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև դեկտեմբերի 12-ը։',
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
