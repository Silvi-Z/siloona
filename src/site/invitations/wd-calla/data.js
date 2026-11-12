// All guest-facing text, dates and colours for the "wd-calla" wedding
// invitation: white calla lilies and sage leaves climbing the left edge of
// textured cream paper (the supplied artwork). Same approach as the other
// designs' data.js — components read this shape via the shared editing
// context.
//
// eventDate drives every displayed date: the cover's "15 · 05 · 2027",
// the date section (weekday, day, month, time), the countdown and the
// calendar link.
export const wdCallaDefaultData = {
  couple: { first: 'Ռուբեն', second: 'Էլեն' },
  eventDate: '2027-05-15T15:00:00',
  hero: { kicker: 'Հարսանյաց հրավեր', place: 'Երևան' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հարազատներ և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Գարնան այս օրը մենք կսկսենք մեր ընտանիքի պատմությունը։ Մեզ համար մեծ ուրախություն կլինի, եթե այն սկսվի ձեր ներկայությամբ։',
  dateTitle: 'Ե՞րբ',
  countdownTitle: 'Մինչև մեր օրը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Օրվա ծրագիր',
  schedule: [
    { time: '15:00', label: 'Պսակադրություն' },
    { time: '17:00', label: 'Հյուրերի դիմավորում' },
    { time: '17:30', label: 'Հարսանյաց ընթրիք' },
    { time: '19:00', label: 'Առաջին պար' },
    { time: '22:00', label: 'Հարսանյաց տորթ' },
  ],
  venueTitle: 'Որտե՞ղ',
  // [0] the ceremony, [1] the celebration. The address is also the map
  // link's search query.
  places: [
    { label: 'Պսակադրություն', time: '15:00', name: 'Սուրբ Աննա եկեղեցի', address: 'Աբովյան 22, Երևան' },
    { label: 'Հարսանյաց ընթրիք', time: '17:00', name: '«Սպիտակ այգի» ռեստորան', address: 'Ձորաղբյուր, Կոտայքի մարզ' },
  ],
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    intro: 'Կուրախանանք, եթե ձեր հագուստում լինեն մեր օրվա մեղմ, բնական գույները։',
    colors: ['#f3efe6', '#d9d7cc', '#a3ad8c', '#5f6b4a'],
    // Hover label of each swatch, by index.
    colorNames: ['Փղոսկր', 'Մարգարտյա', 'Եղեսպակ', 'Ձիթապտղի'],
  },
  rsvp: {
    title: 'Ներկայության հաստատում',
    intro: 'Խնդրում ենք պատասխանել մինչև ապրիլի 25-ը։',
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
