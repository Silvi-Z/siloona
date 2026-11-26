import background from './assets/background.webp'

// "wd-noir-lite" — the simple sibling of wd-noir: one photograph held still
// behind the page (a fixed layer, not background-attachment, which iOS
// ignores) while the invitation's text scrolls straight over it.
// Only the essentials: names and date, greeting, countdown, places,
// programme, dress code, reply. Same palette and type as wd-noir.
//
// eventDate drives the cover date, the countdown and the calendar link.
// `places` are the day's stops in order; each opens its map.
export const wdNoirLiteDefaultData = {
  // Groom first, as on the cover (person2 is the groom).
  couple: { first: 'Էդգար', second: 'Ալիսա' },
  eventDate: '2027-08-21T16:00:00',
  background,
  kicker: 'Ամուսնանում ենք',
  // The guest's personal link replaces the general greeting
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի՛ հարազատներ և ընկերներ',
    personal: 'Սիրելի՛ {name}',
  },
  message: 'Սիրով հրավիրում ենք Ձեզ կիսելու մեզ հետ մեր կյանքի ամենագեղեցիկ օրը։',
  countdownTitle: 'Մինչև մեր օրը',
  calendarButton: 'Ավելացնել օրացույցում',
  venueTitle: 'Վայրերը',
  mapButton: 'Ինչպես հասնել',
  // In the day's order. The address is what the map searches.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Աննա եկեղեցի', address: 'Երևան, Աբովյան 24' },
    { label: 'Հարսանյաց երեկո', time: '18:30', name: '«Սպիտակ դահլիճ»', address: 'Երևան, Իսակովի պողոտա 50' },
  ],
  scheduleTitle: 'Օրվա ծրագիրը',
  schedule: [
    { time: '16:00', label: 'Պսակադրություն' },
    { time: '18:30', label: 'Հյուրերի դիմավորում' },
    { time: '19:30', label: 'Տոնական ընթրիք' },
    { time: '21:00', label: 'Առաջին պարը' },
  ],
  dressCode: {
    title: 'Դրես-կոդ',
    text: 'Երեկոյան հագուստ՝ մուգ և նուրբ երանգներով։',
  },
  rsvp: {
    title: 'Կմիանա՞ք մեզ',
    intro: 'Խնդրում ենք պատասխանել մինչև օգոստոսի 1-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    guestsLabel: 'Քանի՞ հոգով կգաք',
    // [0] one person … — the index is the RSVP's companions.
    guestOptions: ['1', '2', '3', '4'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սիրով սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: { line: 'Սիրով սպասում ենք Ձեզ' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
