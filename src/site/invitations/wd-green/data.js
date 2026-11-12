// All guest-facing text, dates and colors for the "wd-green" (sage &
// olive, misty garden) wedding invitation. Same approach as the other
// designs' data.js — components read this shape via the shared editing
// context; nothing invitation-specific is hardcoded in the component tree.
//
// eventDate drives every displayed date: the "5 · 06 · 2027" hero line, the
// month calendar with its heart and the countdown.
export const wdGreenDefaultData = {
  couple: { first: 'Նարե', second: 'Արամ' },
  curtain: { hint: 'Հպեք՝ մուտք գործելու համար' },
  eventDate: '2027-06-05T16:00:00',
  hero: { kicker: 'Պահպանեք ամսաթիվը' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Մենք երջանիկ կլինենք կիսել ձեզ հետ սիրով, ջերմությամբ և ուրախ պահերով լի մեր օրը։ Անհամբեր սպասում ենք ձեզ, որպեսզի միասին ստեղծենք հիշողություններ, որոնք կմնան մեզ հետ ընդմիշտ։',
  story: [
    { year: '2019', text: 'Առաջին հանդիպումը Երևանում' },
    { year: '2025', text: '«Այո»՝ աշնանային մի երեկո' },
    { year: '2027', text: 'Սկսվում է մեր նոր պատմությունը' },
  ],
  scheduleTitle: 'Օրվա ծրագիր',
  schedule: [
    { time: '15:00', label: 'Հյուրերի հավաքույթ' },
    { time: '16:00', label: 'Պսակադրության արարողություն' },
    { time: '17:00', label: 'Տոնական ընթրիք' },
    { time: '21:00', label: 'Տորթ և պարեր' },
  ],
  dressCode: {
    title: 'Հագուստի ոճ',
    intro: 'Մեզ համար թանկ կլինի, եթե ձեր կերպարները համահունչ լինեն մեր օրվա մթնոլորտին։',
    colors: ['#9aa070', '#4b5236', '#3f2d25', '#7d6b61'],
    // Hover label of each swatch, by index.
    colorNames: ['Ձիթենի', 'Մամուռ', 'Շոկոլադ', 'Կակաո'],
  },
  details: {
    title: 'Մանրամասներ',
    // The organizer's phone (contacts.phone) follows this text as a link.
    text: 'Խնդրում ենք հաստատել ձեր ներկայությունը մինչև 20 մայիսի, որպեսզի կարողանանք ամեն ինչ պլանավորել լավագույն կերպով։ Բոլոր հարցերով կարող եք դիմել փեսային ու հարսին կամ մեր կազմակերպիչ Աննային՝',
  },
  contacts: { phone: '+374 00 000 000' },
  rsvp: {
    button: 'Հաստատել մասնակցությունը',
    title: 'Հաստատեք ձեր մասնակցությունը',
    // Number of people, including the guest who answers.
    guestOptions: ['1', '2', '3', '4'],
    // {name} → what the guest typed.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կցավենք, որ չեք կարող գալ։',
  },
  venue: {
    title: 'Տոնակատարության վայրը',
    intro: 'Տոնակատարությունը կանցկացվի քաղաքից դուրս՝',
    name: '«Սպիտակ այգիներ» պարտեզում',
    address: 'Կոտայքի մարզ, Ծաղկաձորի ճանապարհ',
  },
  sign: 'Սիրով՝',
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
