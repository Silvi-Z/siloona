// All guest-facing text, dates and colours for the "wd-meadow" wedding
// invitation: an impressionist oil painting of a flowering meadow (the
// supplied artwork). Same approach as the other designs' data.js —
// components read this shape via the shared editing context.
//
// eventDate drives every displayed date: the cover's "19 · 06 · 2027",
// the date circle (weekday, day, month, time), the countdown and the
// calendar link.
export const wdMeadowDefaultData = {
  couple: { first: 'Արեն', second: 'Նանե' },
  eventDate: '2027-06-19T16:00:00',
  hero: { kicker: 'Մենք ամուսնանում ենք', line: 'և սիրով հրավիրում ենք ձեզ' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հարազատներ և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Ամառային այս օրը մենք կդառնանք ընտանիք։ Կուզենայինք, որ այն լցված լինի ծաղիկներով, երաժշտությամբ և այն մարդկանցով, ում ամենաշատն ենք սիրում՝ ձեզանով։',
  dateTitle: 'Մեր օրը',
  countdownTitle: 'Մինչև հարսանիք մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Օրվա ծրագիր',
  schedule: [
    { time: '16:00', label: 'Պսակադրություն' },
    { time: '18:00', label: 'Ապերիտիվ այգում' },
    { time: '19:00', label: 'Հարսանյաց ընթրիք' },
    { time: '21:00', label: 'Պար և երաժշտություն' },
    { time: '23:00', label: 'Հարսանյաց տորթ' },
  ],
  venueTitle: 'Որտեղ',
  // [0] the ceremony, [1] the celebration. The address is also the map
  // link's search query.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Հովհաննես եկեղեցի', address: 'Բյուրական, Արագածոտնի մարզ' },
    { label: 'Հարսանյաց խնջույք', time: '18:00', name: '«Մարգագետին» այգի-ռեստորան', address: 'Բյուրական, Արագածոտնի մարզ' },
  ],
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    intro: 'Կուրախանանք, եթե ձեր հագուստում լինեն ամառային մարգագետնի մեղմ գույները։',
    colors: ['#e3a3a6', '#efc4a4', '#a9bba1', '#53664f'],
    // Hover label of each swatch, by index.
    colorNames: ['Փոշոտ վարդագույն', 'Դեղձագույն', 'Եղեսպակ', 'Մուգ կանաչ'],
  },
  rsvp: {
    title: 'Ներկայության հաստատում',
    intro: 'Խնդրում ենք պատասխանել մինչև հունիսի 1-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    wishLabel: 'Մաղթանք կամ հարց (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Անհամբեր սպասում ենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ այդ օրը։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Սիրով սպասում ենք ձեզ', sign: 'Ձեր՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
