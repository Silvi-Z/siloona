// All guest-facing text and dates for the "bd-balloons" (storybook
// friends floating on blue balloons) birthday invitation. Same approach as
// the other designs' data.js — components read this shape via the shared
// editing context; nothing invitation-specific is hardcoded.
//
// eventDate drives every displayed date: the "Շաբաթ, 15 մայիսի 2027 ·
// 12:00" line and the countdown. child.age is the number on the balloon.
export const bdBalloonsDefaultData = {
  child: { name: 'Լեոն', age: '3' },
  eventDate: '2027-05-15T12:00:00',
  hero: {
    kicker: 'Ծննդյան հրավեր',
    title: 'Լեոնը դառնում է',
    // Under the date: the characters bounce when tapped.
    hint: 'Հպեք հերոսներին',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Փուչիկները պատրաստ են, տորթը՝ նույնպես։ Սիրով հրավիրում ենք ձեզ միասին նշելու մեր փոքրիկի ծննդյան օրը՝ խաղերով, ծիծաղով և քաղցր անակնկալներով։',
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
    name: '«Փուչիկ» մանկական կենտրոն',
    // Also the map link's search query.
    address: 'Երևան',
    button: 'Բացել քարտեզում',
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև մայիսի 5-ը։',
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
  closing: { line: 'Սիրով սպասում ենք ձեզ', signature: 'Լեոնի ընտանիք' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
