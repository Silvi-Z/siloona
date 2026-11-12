// All guest-facing text and dates for the "wd-garden" (blossom branches,
// golden-hour garden) wedding invitation. Same approach as the other
// designs' data.js — components read this shape via the shared editing
// context; nothing invitation-specific is hardcoded in the component tree.
//
// eventDate drives every displayed date: the "05.04.2027" line, the
// countdown in days and the month calendar with its heart.
export const wdGardenDefaultData = {
  couple: { first: 'Նարե', second: 'Արամ' },
  gate: { hint: 'Հպեք՝ բացելու համար' },
  eventDate: '2027-04-05T16:00:00',
  hero: { label: 'Հարսանեկան հրավեր' },
  story: {
    title: 'Մեր պատմությունը',
    text: 'Ամեն ինչ սկսվեց գարնանային մի առավոտ՝ գրքի խանութում, երբ երկուսս էլ ձեռք մեկնեցինք նույն գրքին։ Այդ օրվանից ամեն օր դարձավ փոքրիկ տոն։ Այժմ՝ ձեր ներկայությամբ, ուզում ենք սկսել մեր նոր էջը։',
  },
  date: {
    title: 'Ամսաթիվ',
    // "Մնացել է <N> օր"
    before: 'Մնացել է',
    after: 'օր',
  },
  venue: {
    title: 'Վայրը',
    name: '«Բյուրեղյա հորիզոն» վիլլա',
    // Also the map link's search query.
    address: 'Կոտայքի մարզ, Ծաղկաձոր',
    note: 'Տոնակատարությունը կանցկացվի բացօթյա այգում։',
    button: 'Տեսնել քարտեզում',
  },
  scheduleTitle: 'Ծրագիր',
  schedule: [
    { time: '16:00', label: 'Պսակադրության արարողություն' },
    { time: '18:00', label: 'Ընթրիք և տոնակատարություն' },
    { time: '22:00', label: 'Տորթի կտրում' },
  ],
  rsvp: {
    title: 'Հաստատում',
    placeholder: 'Մուտքագրեք ձեր անունը',
    drinkQuestion: 'Ի՞նչ խմիչք կնախընտրեք',
    drinks: ['Գինի', 'Շամպայն', 'Անալկոհոլային'],
    guestQuestion: 'Ներկա հյուրերի թիվ',
    // Number of people, including the guest who answers.
    guestOptions: ['1', '2', '3'],
    button: 'Ուղարկել',
    sentButton: 'Շնորհակալություն ♥',
    // {name} → what the guest typed.
    thanks: '{name}, ձեր պատասխանը ստացված է։ Սպասում ենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  // Footer: the names (second և first, as in the source) and this line.
  closing: { line: 'Սիրով սպասում ենք ձեզ' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
