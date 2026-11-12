// All guest-facing text, dates and colours for the "wd-velvet" wedding
// invitation: a burgundy velvet arch on warm plaster, two sculpted cream
// flowers. Same approach as the other designs' data.js — components read
// this shape via the shared editing context; nothing invitation-specific
// is hardcoded in the component tree.
//
// eventDate drives every displayed date: the hero's "26 · 06 · 2027", the
// big date (weekday, day, month, time), the countdown and the calendar link.
export const wdVelvetDefaultData = {
  couple: { first: 'Արման', second: 'Լիլիթ' },
  eventDate: '2027-06-26T14:00:00',
  hero: { kicker: 'Հրավիրում ենք ձեզ', line: 'մեր հարսանիքին' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հարազատներ և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Մեր կյանքի ամենագեղեցիկ օրը լիարժեք կլինի միայն ձեզ հետ։ Սիրով հրավիրում ենք ձեզ կիսելու մեր ուրախությունը և լինելու կողքներիս այն պահին, երբ մեր երկու ճանապարհները կդառնան մեկ։',
  dateTitle: 'Մեր օրը',
  countdownTitle: 'Մինչև հարսանիք մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Օրվա ծրագիր',
  schedule: [
    { time: '14:00', label: 'Պսակադրություն' },
    { time: '16:30', label: 'Հյուրերի դիմավորում' },
    { time: '17:00', label: 'Հարսանյաց խնջույք' },
    { time: '21:00', label: 'Հարսանյաց տորթ' },
    { time: '23:30', label: 'Երեկոյի ավարտ' },
  ],
  venueTitle: 'Որտեղ',
  // [0] the ceremony, [1] the celebration. The address is also the map
  // link's search query.
  places: [
    { label: 'Պսակադրություն', time: '14:00', name: 'Սուրբ Գրիգոր Լուսավորիչ մայր տաճար', address: 'Տիգրան Մեծի պողոտա, Երևան' },
    { label: 'Հարսանյաց խնջույք', time: '17:00', name: '«Վարդենի» խնջույքների սրահ', address: 'Աշտարակի խճուղի, Երևան' },
  ],
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    intro: 'Կուրախանանք, եթե ձեր հագուստում լինեն մեր օրվա գույները։',
    colors: ['#5c1820', '#8f3a3f', '#d8c3a0', '#efe6d6'],
    // Hover label of each swatch, by index.
    colorNames: ['Թավշյա բորդո', 'Նռնագույն', 'Շամպայն', 'Կաթնագույն'],
  },
  rsvp: {
    title: 'Ներկայության հաստատում',
    intro: 'Խնդրում ենք պատասխանել մինչև հունիսի 1-ը։',
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
  closing: { line: 'Անհամբեր սպասում ենք ձեզ', sign: 'Սիրով՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
