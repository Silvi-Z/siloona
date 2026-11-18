import heroPhoto from './assets/hero.webp'
import storyPhoto from './assets/story.webp'
import togetherPhoto from './assets/together.webp'
import closingPhoto from './assets/closing.webp'

// "wd-mono" — a black & white photo story: the couple's own photographs
// on ivory paper with torn edges, fine line icons, a live countdown.
// All text, the date and the photos are the customer's to change (photos
// through the editor's «Փոխել լուսանկարը», see shared/EditablePhoto).
// The demo photos are from Unsplash (assets/CREDITS.md).
//
// eventDate drives the hero's «25 · 09 · 2027», the «ՇԱԲԱԹ | 25 |
// ՍԵՊՏԵՄԲԵՐ» row and the countdown.
export const wdMonoDefaultData = {
  // Bride first, as on the cover («Լիանա & Հայկ»).
  couple: { first: 'Լիանա', second: 'Հայկ' },
  eventDate: '2027-09-25T16:00:00',
  hero: { kicker: 'ՄԵՆՔ ԱՄՈՒՍՆԱՆՈՒՄ ԵՆՔ' },
  photos: { hero: heroPhoto, story: storyPhoto, together: togetherPhoto, closing: closingPhoto },
  countdownTitle: 'ՄՆԱՑԵԼ Է',
  greeting: {
    general: 'Սիրելի հյուրեր',
    personal: 'Սիրելի {name}',
  },
  message: 'Սիրով սպասում ենք Ձեզ՝ միասին նշելու մեր հարսանիքը',
  // [0] the ceremony, [1] the celebration. The address is also what the
  // «how to get there» button searches on the map.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Հովհաննես եկեղեցի', address: 'Երևան, Աբովյան 24' },
    { label: 'Հարսանյաց խնջույք', time: '18:30', name: '«Արարատ» սրահ', address: 'Երևան, Մաշտոցի 5' },
  ],
  mapButton: 'ԻՆՉՊԵՍ ՀԱՍՆԵԼ',
  scheduleTitle: 'Օրվա ծրագիրը',
  // `icon`: one of the line icons in components/Icons.jsx (tap it while
  // editing to change it).
  schedule: [
    { time: '16:00', label: 'Պսակադրություն', icon: 'rings' },
    { time: '18:00', label: 'Հյուրերի դիմավորում', icon: 'pin' },
    { time: '18:30', label: 'Կենացներ', icon: 'glasses' },
    { time: '19:30', label: 'Հարսանյաց ընթրիք', icon: 'plate' },
    { time: '22:00', label: 'Տորթ', icon: 'cake' },
    { time: '23:00', label: 'Պարեր մինչև առավոտ', icon: 'disco' },
  ],
  instagram: {
    title: 'Instagram',
    text: 'Չենք ուզում բաց թողնել ոչ մի պահ։ Կիսվեք օրվա լուսանկարներով և նշեք մեր հեշթեգը, որ միասին վերապրենք այս օրը։',
    // «#tag» opens the hashtag, «@name» the account.
    handle: '#LianaHayk2027',
  },
  playlist: {
    title: 'Երաժշտություն',
    text: 'Տոնը Դուք եք ստեղծում։ Ասեք մեզ այն երգը, որը անպայման պետք է հնչի։',
    button: 'ԱՌԱՋԱՐԿԵԼ ԵՐԳ',
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև օգոստոսի 25-ը։',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    songLabel: 'Երգ, որը պետք է անպայման հնչի',
    button: 'ՈՒՂԱՐԿԵԼ',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: { line: 'Սիրով՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
