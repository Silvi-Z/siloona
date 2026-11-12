// All guest-facing text and dates for the "bd-cars" birthday invitation:
// watercolour race cars at a desert party (the supplied artwork). Same
// shape as bd-balloons (so the dashboard prefill is the same) —
// components read it via the shared editing context.
//
// eventDate drives every displayed date: the cover's date line, the
// countdown and the calendar link. child.age is the race number on the
// cover.
export const bdCarsDefaultData = {
  child: { name: 'Մարկ', age: '4' },
  eventDate: '2027-07-10T13:00:00',
  hero: {
    kicker: 'Ծննդյան հրավեր',
    title: 'Մարկը դառնում է',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Շարժիչները միացված են, փուչիկները՝ պատրաստ։ Սիրով հրավիրում ենք ձեզ մեր փոքրիկ մրցարշավորդի ծննդյան տոնին՝ խաղերով, ծիծաղով և քաղցր անակնկալներով։',
  countdownTitle: 'Մինչև մեկնարկը',
  scheduleTitle: 'Տոնի ծրագիրը',
  schedule: [
    { time: '13:00', label: 'Մեկնարկ․ հյուրերի դիմավորում' },
    { time: '13:30', label: 'Մրցարշավ և խաղեր' },
    { time: '15:00', label: 'Կանգառ․ տոնական սեղան' },
    { time: '16:00', label: 'Ֆինիշ․ տորթ և մոմեր' },
  ],
  venue: {
    title: 'Որտեղ',
    name: '«Արագ անիվներ» մանկական կենտրոն',
    // Also the map link's search query.
    address: 'Երևան',
    button: 'Բացել քարտեզում',
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև հուլիսի 1-ը։',
    nameLabel: 'Ձեր անունը',
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
  closing: { line: 'Սիրով սպասում ենք ձեզ', signature: 'Մարկի ընտանիք' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
