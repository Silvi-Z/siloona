import twirlPhoto from './assets/twirl.webp'
import embracePhoto from './assets/embrace.webp'
import kissPhoto from './assets/kiss.webp'

// "wd-rouge" — an editorial love letter in wine red on cream: a giant
// hairline «LOVE» crossed by a handwritten ribbon, huge thin numerals,
// tilted polaroids of the couple, and a programme strung on a flowing red
// line. Everything is the customer's to change, photos included (edit
// mode «Փոխել լուսանկարը»). Demo photos: Unsplash (assets/CREDITS.md).
//
// Headings are a capitals word with a handwritten-style word under it;
// both are text (written in capitals here — CSS uppercase would turn «և»
// into «ԵՒ»). eventDate drives «16 ՀՈԿՏԵՄԲԵՐԻ 2027», the big 16/10/27
// numerals and the countdown.
export const wdRougeDefaultData = {
  // Groom first, as on the cover (person2 is the groom).
  couple: { first: 'Տիգրան', second: 'Անի' },
  eventDate: '2027-10-16T15:00:00',
  hero: {
    // The giant word (Latin capitals look best; 4 letters fill the 2×2 layout).
    word: 'LOVE',
    // The handwritten ribbon that runs across it and behind the photos.
    ribbon: 'love story',
  },
  photos: { first: twirlPhoto, second: embracePhoto, closing: kissPhoto },
  // The welcome heading: «ՍԻՐԵԼԻ» + a handwritten line under it. On a
  // guest's personal link the handwritten line is `personal` ({name} →
  // the guest's first name).
  greeting: {
    general: 'ՍԻՐԵԼԻ',
    sub: 'մեր հարազատներ',
    personal: '{name}',
  },
  message: 'Ուրախ ենք կիսել Ձեզ հետ մեր կյանքի ամենակարևոր օրերից մեկը՝ մեր հարսանիքի օրը։',
  message2: 'Սիրով հրավիրում ենք միանալու մեր տոնին և այն ավելի ջերմ դարձնելու Ձեր ներկայությամբ։',
  countdownTitle: 'Մինչև մեր օրը մնաց',
  scheduleTitle: 'ԾՐԱԳԻՐ',
  scheduleSub: 'օրվա',
  schedule: [
    { time: '15:00', label: 'Պսակադրություն՝ մեր կյանքի ամենահուզիչ պահը։' },
    { time: '17:00', label: 'Հյուրերի դիմավորում, ֆուրշետ և առաջին կենացները։' },
    { time: '18:00', label: 'Համեղ ընթրիք, երաժշտություն, ջերմ մաղթանքներ և պարեր։' },
    { time: '22:00', label: 'Հարսանյաց տորթ և երեկոյի գեղեցիկ ավարտ՝ նոր պատմության սկիզբ։' },
  ],
  venueTitle: 'ՎԱՅՐԸ',
  venueSub: 'տոնի',
  // [0] the ceremony, [1] the celebration. The address is what the map
  // button searches.
  places: [
    { label: 'Պսակադրություն', time: '15:00', name: 'Սուրբ Աննա եկեղեցի', address: 'Երևան, Աբովյան 22' },
    { label: 'Հանդիսություն', time: '17:00', name: '«Այգեստան» ռեստորան', address: 'Երևան, Ծիծեռնակաբերդի խճուղի 3' },
  ],
  mapButton: 'Ինչպես հասնել',
  rsvp: {
    title: 'ԿԳԱ՞Ք',
    sub: 'սպասում ենք Ձեզ',
    intro: 'Խնդրում ենք պատասխանել մինչև սեպտեմբերի 16-ը։',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: { line: 'Սիրով՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
