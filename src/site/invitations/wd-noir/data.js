import hero from './assets/hero.webp'
import story1 from './assets/story1.webp'
import story2 from './assets/story2.webp'
import story3 from './assets/story3.webp'
import gallery1 from './assets/gallery1.webp'
import gallery2 from './assets/gallery2.webp'
import gallery3 from './assets/gallery3.webp'
import gallery4 from './assets/gallery4.webp'
import venue from './assets/venue.webp'
import closing from './assets/closing.webp'

// "wd-noir" — the most complete wedding invitation: black, ivory and
// champagne gold, cinematic photographs, a sealed opening with the
// couple's monogram. Dark and ivory parts alternate down the page.
//
// eventDate is the ceremony's day and time: it drives the cover date, the
// countdown, the month calendar and the calendar link. `places` are the
// day's stops in order (the houses, the ceremony, the reception); the
// last one is shown with a map. Every photo is replaceable in the editor.
// Names are written in capitals by the components (JS, not CSS, so «և»
// stays «ԵՎ»).
export const wdNoirDefaultData = {
  // Groom first, as on the cover (person2 is the groom).
  couple: { first: 'Ալեն', second: 'Միլենա' },
  eventDate: '2027-09-18T15:00:00',
  gate: {
    kicker: 'Անձնական հրավեր',
    button: 'Բացել հրավերը',
  },
  hero: {
    kicker: 'Ամուսնանում ենք',
    photo: hero,
  },
  // The guest's personal link replaces the general greeting
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի՛ հարազատներ և ընկերներ',
    personal: 'Սիրելի՛ {name}',
  },
  message: 'Կան օրեր, որոնք մնում են ընդմիշտ։ Մեզ համար այդպիսին կլինի այս օրը, և մենք ուզում ենք, որ Դուք լինեք մեր կողքին, երբ սկսենք մեր ընտանիքի պատմությունը։',
  countdownTitle: 'Մինչև մեր օրը',
  story: {
    title: 'Մեր պատմությունը',
    items: [
      { year: '2019', title: 'Առաջին հանդիպումը', text: 'Ընկերների ծննդյան երեկո, մի պատահական զրույց, որը տևեց մինչև առավոտ։', photo: story1 },
      { year: '2025', title: 'Առաջարկը', text: 'Փարիզ, անձրևոտ երեկո, Սենի ափ։ Նա ասաց «այո» դեռ մինչև հարցի ավարտը։', photo: story2 },
      { year: '2027', title: 'Մեր օրը', text: 'Եվ հիմա պատրաստվում ենք ամենակարևոր «այո»-ին՝ Ձեր ներկայությամբ։', photo: story3 },
    ],
  },
  gallery: {
    title: 'Մեր պահերը',
    photos: [gallery1, gallery2, gallery3, gallery4],
  },
  dateTitle: 'Նշեք այս օրը',
  calendarButton: 'Ավելացնել օրացույցում',
  venueTitle: 'Օրվա վայրերը',
  venuePhoto: venue,
  mapButton: 'Ինչպես հասնել',
  // In the day's order. The address is what the map searches.
  places: [
    { label: 'Փեսայի տուն', time: '11:00', name: 'Սարգսյանների ընտանիք', address: 'Երևան, Սայաթ-Նովայի պողոտա 10' },
    { label: 'Հարսի տուն', time: '12:30', name: 'Հովհաննիսյանների ընտանիք', address: 'Երևան, Պուշկինի փողոց 25' },
    { label: 'Պսակադրություն', time: '15:00', name: 'Սուրբ Գայանե վանք', address: 'Էջմիածին, Սուրբ Գայանե վանք' },
    { label: 'Հարսանյաց երեկո', time: '18:30', name: '«Սպիտակ դահլիճ»', address: 'Երևան, Իսակովի պողոտա 50' },
  ],
  scheduleTitle: 'Օրվա ծրագիրը',
  schedule: [
    { time: '11:00', label: 'Փեսայի տուն' },
    { time: '12:30', label: 'Հարսի տուն' },
    { time: '15:00', label: 'Պսակադրություն' },
    { time: '18:30', label: 'Հյուրերի դիմավորում և շամպայն' },
    { time: '19:30', label: 'Զույգի մուտքը' },
    { time: '21:00', label: 'Առաջին պարը' },
    { time: '23:00', label: 'Հարսանյաց տորթ' },
  ],
  dressCode: {
    title: 'Դրես-կոդ',
    text: 'Black tie․ երեկոյան զգեստներ և դասական կոստյումներ։ Խնդրում ենք խուսափել սպիտակից։',
    colors: ['#0E0D0C', '#C9A96E', '#EDE4D3', '#6B5843'],
  },
  details: {
    title: 'Մանրամասներ',
    items: [
      { title: 'Նվերներ', text: 'Ձեր ներկայությունն արդեն ամենամեծ նվերն է։ Եթե ցանկանում եք ինչ-որ բան նվիրել, սրահում կլինի ծրարների տուփ։' },
      { title: 'Տրանսֆեր', text: 'Պսակադրությունից հետո հյուրերին սրահ կտեղափոխեն ավտոբուսները՝ ժամը 17:30-ին։' },
      { title: 'Լուսանկարներ', text: 'Կիսվեք օրվա կադրերով՝ #AlenMilena հեշթեգով։' },
    ],
  },
  rsvp: {
    title: 'Կմիանա՞ք մեզ',
    intro: 'Խնդրում ենք պատասխանել մինչև օգոստոսի 18-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    guestsLabel: 'Քանի՞ հոգով կգաք',
    // [0] one person … — the index is the RSVP's companions.
    guestOptions: ['1', '2', '3', '4'],
    wishLabel: 'Ձեր մաղթանքը մեզ (ըստ ցանկության)',
    button: 'Ուղարկել պատասխանը',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սիրով սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: {
    line: 'Սիրով սպասում ենք Ձեզ',
    photo: closing,
  },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
