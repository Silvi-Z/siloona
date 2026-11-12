// All guest-facing text and dates for the "bd-stitch" birthday
// invitation: storybook friends embroidered on linen (the supplied
// artwork), shown in wooden embroidery hoops. Same shape as bd-balloons
// (so the dashboard prefill is the same) — components read it via the
// shared editing context.
//
// eventDate drives every displayed date: the cover's date line, the
// countdown and the calendar link. child.age is the number on the felt
// patch.
export const bdStitchDefaultData = {
  child: { name: 'Սոֆի', age: '2' },
  eventDate: '2027-04-24T12:00:00',
  hero: {
    kicker: 'Ծննդյան հրավեր',
    title: 'Սոֆին դառնում է',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Մեղրը պատրաստ է, ընկերները՝ հավաքված։ Սիրով հրավիրում ենք ձեզ նշելու մեր փոքրիկի ծննդյան օրը՝ խաղերով, ծիծաղով և քաղցր անակնկալներով։',
  countdownTitle: 'Մինչև տոնը',
  scheduleTitle: 'Տոնի ծրագիրը',
  schedule: [
    { time: '12:00', label: 'Հյուրերի դիմավորում' },
    { time: '12:30', label: 'Խաղեր և անակնկալներ' },
    { time: '14:00', label: 'Տոնական սեղան' },
    { time: '15:00', label: 'Տորթ և մոմեր' },
  ],
  venue: {
    title: 'Որտեղ',
    name: '«Մեղրիկ» մանկական սրճարան',
    // Also the map link's search query.
    address: 'Երևան',
    button: 'Բացել քարտեզում',
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև ապրիլի 15-ը։',
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
  closing: { line: 'Սիրով սպասում ենք ձեզ', signature: 'Սոֆիի ընտանիք' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
