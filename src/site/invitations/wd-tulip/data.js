// All guest-facing text, dates and colors for the "wd-tulip" (burgundy
// tulip on linen) wedding invitation. Same approach as the other designs'
// data.js — components read this shape via the shared editing context;
// nothing invitation-specific is hardcoded in the component tree.
//
// eventDate drives every displayed date: the "ՍԵՊՏԵՄԲԵՐ 2027" hero line,
// the "18 · 09 · 2027" date card, its weekday and the countdown.
// The monogram is made from the first letters of the two names.
export const wdTulipDefaultData = {
  couple: { first: 'Դավիթ', second: 'Մարիամ' },
  eventDate: '2027-09-18T15:00:00',
  hero: { kicker: 'Հարսանեկան հրավեր' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Սիրով հրավիրում ենք ձեզ կիսելու մեզ հետ մեր կյանքի ամենագեղեցիկ օրը։ Ձեր ներկայությունը այս օրը կդարձնի իսկապես ամբողջական։',
  dateTitle: 'Մեր օրը',
  scheduleTitle: 'Օրվա ծրագիր',
  schedule: [
    { time: '15:00', label: 'Պսակադրություն' },
    { time: '17:00', label: 'Հյուրերի դիմավորում' },
    { time: '18:00', label: 'Հարսանյաց ընթրիք' },
    { time: '22:00', label: 'Տորթ և պարեր' },
  ],
  venueTitle: 'Որտեղ',
  // [0] the ceremony, [1] the celebration. The address is also the map
  // link's search query.
  places: [
    { label: 'Պսակադրություն', time: '15:00', name: 'Սուրբ Գայանե եկեղեցի', address: 'Վաղարշապատ' },
    { label: 'Հանդիսություն', time: '18:00', name: '«Վարդենի» դահլիճ', address: 'Երևան' },
  ],
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    intro: 'Ուրախ կլինենք, եթե ձեր հագուստում լինեն մեր օրվա գույները։',
    colors: ['#6b1626', '#8c9a7c', '#ece5d8', '#b0904f'],
    // Hover label of each swatch, by index.
    colorNames: ['Բորդո', 'Եղեսպակ', 'Փղոսկր', 'Ոսկի'],
  },
  rsvp: {
    title: 'Ներկայության հաստատում',
    intro: 'Խնդրում ենք պատասխանել մինչև օգոստոսի 20-ը։',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  sign: 'Սիրով՝',
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
