import photo1 from './assets/photo1.webp'
import photo2 from './assets/photo2.webp'
import photo3 from './assets/photo3.webp'
import photo4 from './assets/photo4.webp'
import photo5 from './assets/photo5.webp'

// All guest-facing text, dates and colours for the "wd-chateau" wedding
// invitation: navy on white, a watercolour chateau with a fountain under
// the couple's names, blue-and-white roses between the parts (after the
// supplied reference). Components read this shape via the shared editing
// context; data.i18n.js has Russian and English.
//
// eventDate is the ceremony's day and time; it drives the date rows, the
// countdown, the month calendar and the calendar link. The two places are
// [0] the ceremony and [1] the reception (its time is the reception's).
export const wdChateauDefaultData = {
  eventDate: '2027-06-26T15:00:00',
  // Groom first, as on the cover.
  couple: { first: 'Դավիթ', second: 'Մարիամ' },
  welcome: 'Բարի գալուստ մեր հարսանիք',
  ceremonyTitle: 'Արարողություն',
  // The two families. `first` the groom's, `second` the bride's.
  parentsLabels: { first: 'Փեսայի ծնողները', second: 'Հարսի ծնողները' },
  parents: { first: 'Արմեն և Լուսինե Հակոբյաններ', second: 'Կարեն և Անի Սարգսյաններ' },
  intro: 'Մեր ընտանիքների հետ միասին սիրով հրավիրում ենք ձեզ մեր հարսանիքին',
  places: [
    { label: 'Պսակադրություն', time: '15:00', name: 'Սուրբ Աննա եկեղեցի', address: 'Երևան' },
    { label: 'Հարսանյաց խնջույք', time: '18:00', name: '«Արարատ» սրահ', address: 'Երևան' },
  ],
  gallery: {
    title: 'Մեր պահերը',
    photos: [photo1, photo2, photo3, photo4, photo5],
  },
  reception: {
    title: 'Հարսանյաց խնջույք',
    lead: 'Խնջույքը կսկսվի',
    welcomeLabel: 'Դիմավորում',
    welcomeTime: '17:30',
    startLabel: 'Խնջույք',
  },
  countdownTitle: 'Մինչև մեր օրը',
  calendarButton: 'Ավելացնել օրացույցում',
  confirmButton: 'Հաստատել մասնակցությունը',
  venueTitle: 'Խնջույքի վայրը',
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Երեկոյան հագուստ՝ նուրբ գույներով',
    colors: ['#1e3566', '#a9c3e4', '#e9e4da'],
  },
  scheduleTitle: 'Հարսանյաց օրվա ծրագիր',
  schedule: [
    { time: '15:00', label: 'Պսակադրություն' },
    { time: '16:30', label: 'Լուսանկարահանում' },
    { time: '17:30', label: 'Հյուրերի դիմավորում' },
    { time: '18:00', label: 'Զույգի մուտքը' },
    { time: '18:30', label: 'Տոնական ընթրիք' },
    { time: '21:00', label: 'Առաջին պար' },
    { time: '22:30', label: 'Տորթ և պարեր' },
  ],
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև հունիսի 1-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
    no: 'Ցավոք, ոչ',
    guestsLabel: 'Քանի՞ հոգով կգաք',
    // [0] one person … — the index is the RSVP's `plus`.
    guestOptions: ['1', '2', '3', '4'],
    wishLabel: 'Ձեր մաղթանքը մեզ (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սիրով կսպասենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  gift: {
    title: 'Նվերների տուփ',
    hint: 'Հպեք՝ բացելու համար',
    text: 'Ձեր ներկայությունն արդեն ամենամեծ նվերն է մեզ համար։ Եթե ցանկանում եք ինչ-որ բան նվիրել, սրահում կլինի ծրարների տուփ։',
  },
  closing: { line: 'Սիրով սպասում ենք ձեզ' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
