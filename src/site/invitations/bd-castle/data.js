// All guest-facing text and dates for the "bd-castle" birthday invitation:
// a royal fairy-tale invitation built around the supplied artwork (a pink
// watercolour castle and storybook princesses and princes). Same shape as
// bd-stitch (so the dashboard prefill is the same), plus the intro letter
// and a dress code — components read it via the shared editing context.
//
// eventDate drives every displayed date: the cover's date line, the
// countdown and the calendar link. child.age is the number under the crown.
export const bdCastleDefaultData = {
  child: { name: 'Էլեն', age: '4' },
  eventDate: '2027-06-12T13:00:00',
  // The intro: a sealed royal letter.
  gate: {
    kicker: 'Արքայական նամակ',
    hint: 'Սեղմեք կնիքին՝ հրավերը բացելու համար',
  },
  hero: {
    kicker: 'Արքայական հրավեր',
    title: 'Էլենը դառնում է',
  },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Ամրոցի դարպասները բացվում են, և մեր փոքրիկ արքայադուստրը սիրով հրավիրում է ձեզ իր հեքիաթային տոնին՝ խաղերով, երաժշտությամբ, քաղցր անակնկալներով և շատ-շատ ժպիտներով։',
  countdownTitle: 'Մինչև տոնը',
  scheduleTitle: 'Տոնի ծրագիրը',
  schedule: [
    { time: '13:00', label: 'Հյուրերի դիմավորում ամրոցում' },
    { time: '13:30', label: 'Խաղեր և հեքիաթային անակնկալներ' },
    { time: '14:30', label: 'Արքայական սեղան' },
    { time: '15:30', label: 'Տորթ, մոմեր և մաղթանքներ' },
  ],
  venue: {
    title: 'Որտեղ',
    name: '«Հեքիաթ» մանկական սրահ',
    // Also the map link's search query.
    address: 'Երևան',
    button: 'Բացել քարտեզում',
  },
  dressCode: {
    title: 'Արքայական զգեստներ',
    text: 'Փոքրիկ արքայադուստրերին և արքայազներին սպասում ենք իրենց ամենագեղեցիկ զգեստներով՝ թագերով ու փայլով։',
  },
  rsvp: {
    title: 'Կգա՞ք ամրոց',
    intro: 'Խնդրում ենք պատասխանել մինչև հունիսի 1-ը։',
    nameLabel: 'Ձեր անունը',
    yes: 'Այո, կգանք',
    no: 'Ցավոք, ոչ',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4', '5'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Ամրոցի դարպասները բաց են ձեզ համար։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Սիրով սպասում ենք ձեզ', signature: 'Էլենի ընտանիք' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
