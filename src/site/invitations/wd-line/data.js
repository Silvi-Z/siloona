// All guest-facing text, dates and colours for the "wd-line" wedding
// invitation: white paper with fine gold line-art ribbons (from the
// supplied artwork). Same approach as the other designs' data.js —
// components read this shape via the shared editing context.
//
// eventDate drives every displayed date: the cover's "18 · 09 · 2027",
// the date block (weekday, day, month, time), the countdown and the
// calendar link.
export const wdLineDefaultData = {
  couple: { first: 'Էրիկ', second: 'Սոնա' },
  eventDate: '2027-09-18T16:00:00',
  hero: { kicker: 'Հարսանյաց հրավեր', place: 'Երևան' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի ընկերներ և հարազատներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Կան օրեր, որոնք ուզում ես ապրել սիրելի մարդկանց կողքին։ Մեր հարսանիքի օրը հենց այդպիսին է, և մենք սրտանց կցանկանայինք, որ դուք լինեք մեզ հետ։',
  dateTitle: 'Պահպանեք ամսաթիվը',
  countdownTitle: 'Մինչև մեր օրը',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Օրվա ընթացքը',
  schedule: [
    { time: '16:00', label: 'Պսակադրություն' },
    { time: '18:00', label: 'Հյուրերի դիմավորում' },
    { time: '18:30', label: 'Հարսանյաց ընթրիք' },
    { time: '20:00', label: 'Առաջին պար' },
    { time: '22:30', label: 'Տորթ և հրավառություն' },
  ],
  venueTitle: 'Վայրերը',
  // [0] the ceremony, [1] the celebration. The address is also the map
  // link's search query.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Սարգիս եկեղեցի', address: 'Իսրայելյան 21, Երևան' },
    { label: 'Հարսանյաց ընթրիք', time: '18:00', name: '«Լուսաբաց» սրահ', address: 'Դավիթաշեն, Երևան' },
  ],
  mapButton: 'Բացել քարտեզը',
  dressCode: {
    title: 'Հագուստի ոճ',
    intro: 'Կուրախանանք տեսնել ձեզ բաց, բնական երանգներով։',
    colors: ['#f4efe6', '#e2d3bc', '#c4a77d', '#8c7357'],
    // Hover label of each swatch, by index.
    colorNames: ['Կաթնագույն', 'Ավազագույն', 'Ոսկեգույն', 'Կակաո'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք հաստատել ձեր ներկայությունը մինչև օգոստոսի 20-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, սիրով',
    no: 'Ցավոք, ոչ',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    wishLabel: 'Մաղթանք կամ հարց (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կսպասենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ այդ օրը։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Սիրով սպասում ենք ձեզ', sign: 'Ձեր՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
