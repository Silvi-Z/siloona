// All guest-facing text and dates for the "bd-planet" (little planet,
// fox and rose — hand-drawn storybook) birthday invitation. Same approach
// as the other designs' data.js — components read this shape via the
// shared editing context; nothing invitation-specific is hardcoded.
//
// eventDate drives every displayed date: the "Շաբաթ, 12 հունիսի 2027 ·
// 16:00" line and the countdown. child.age is the number on the planet.
export const bdPlanetDefaultData = {
  child: { name: 'Արսեն', age: '5' },
  eventDate: '2027-06-12T16:00:00',
  hero: {
    kicker: 'Ծննդյան հրավեր',
    title: 'Արսենը դառնում է',
    // Under the picture, a small line for guests (tap = shooting star).
    hint: 'Հպեք նկարին և պահեք մի ցանկություն',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Մեր փոքրիկ ճամփորդը բոլորում է իր հինգերորդ պտույտը Արեգակի շուրջ։ Սիրով հրավիրում ենք ձեզ միասին նշելու այս կախարդական օրը՝ աստղերի, ծիծաղի և քաղցր անակնկալների ներքո։',
  countdownTitle: 'Մինչև տոնը',
  scheduleTitle: 'Տոնի ծրագիրը',
  schedule: [
    { time: '16:00', label: 'Հյուրերի դիմավորում' },
    { time: '16:30', label: 'Խաղեր և անակնկալներ' },
    { time: '18:00', label: 'Տոնական սեղան' },
    { time: '19:00', label: 'Տորթ և մոմեր' },
  ],
  venue: {
    title: 'Որտեղ',
    name: '«Աստղիկ» մանկական սրճարան',
    // Also the map link's search query.
    address: 'Երևան',
    button: 'Բացել քարտեզում',
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև հունիսի 1-ը։',
    yes: 'Այո, կգանք',
    no: 'Ցավոք, ոչ',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4', '5'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Սիրով սպասում ենք ձեզ', signature: 'Արսենի ընտանիք' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
