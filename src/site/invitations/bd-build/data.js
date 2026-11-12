// All guest-facing text and dates for the "bd-build" birthday invitation:
// a watercolour construction site — crane, excavator, dump truck, clouds
// (the supplied artwork). Same
// shape as bd-balloons (so the dashboard prefill is the same) —
// components read it via the shared editing context.
//
// eventDate drives every displayed date: the cover's date line, the
// countdown and the calendar link. child.age is the big felt number on
// the cover.
export const bdBuildDefaultData = {
  child: { name: 'Հայկ', age: '2' },
  eventDate: '2027-05-22T12:00:00',
  hero: {
    kicker: 'Ծննդյան հրավեր',
    title: 'Հայկը դառնում է',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Սաղավարտները պատրաստ են, կռունկը՝ փուչիկներով զարդարված։ Սիրով հրավիրում ենք ձեզ մեր փոքրիկ շինարարի ծննդյան տոնին՝ խաղերով, ծիծաղով և քաղցր անակնկալներով։',
  countdownTitle: 'Մինչև տոնը',
  scheduleTitle: 'Տոնի ծրագիրը',
  schedule: [
    { time: '12:00', label: 'Հյուրերի դիմավորում' },
    { time: '12:30', label: 'Շինարարական խաղեր' },
    { time: '14:00', label: 'Տոնական սեղան' },
    { time: '15:00', label: 'Տորթ և մոմեր' },
  ],
  venue: {
    title: 'Որտեղ',
    name: '«Փոքրիկ շինարար» խաղասենյակ',
    // Also the map link's search query.
    address: 'Երևան',
    button: 'Բացել քարտեզում',
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև մայիսի 12-ը։',
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
  closing: { line: 'Սիրով սպասում ենք ձեզ', signature: 'Հայկի ընտանիք' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
