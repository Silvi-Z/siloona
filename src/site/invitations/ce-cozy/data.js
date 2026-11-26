import background from './assets/background.webp'

// "ce-cozy" — a warm New Year evening: a decorated tree by a snowy window
// (red ribbons, pinecones, the glow of lights), held still behind the page.
// Same layout as ce-sparkle (ce-sparkle/CeSparkleInvitation.jsx
// NewYearParty) in cream, gold and deep red; its own texts below.
//
// eventDate drives the date ring, the weekday line and the calendar link.
export const ceCozyDefaultData = {
  eventDate: '2026-12-27T18:30:00',
  background,
  // Who invites — the small line at the very top and the signature.
  company: '«Լուսաբաց» ընկերություն',
  cover: {
    // Latin words in the handwritten and the wide display faces.
    script: 'Happy',
    word: 'NEW YEAR',
    year: '2027',
  },
  // The guest's personal link replaces the general greeting
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Երբ պատուհանից դուրս ձյուն է գալիս, իսկ ներսում վառվում են լույսերը, ամենալավ ժամանակն է հավաքվելու մեկ սեղանի շուրջ։ Սիրով հրավիրում ենք Ձեզ մեր ձմեռային տոնին՝ ջերմ զրույցների, երաժշտության և Նոր տարվա առաջին մաղթանքների։',
  venue: {
    name: '«Ձմեռային այգի» ռեստորան',
    address: 'Երևան, Թումանյան 21',
  },
  mapButton: 'Ինչպես հասնել',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիրը',
  schedule: [
    { time: '18:30', label: 'Տաք գինի և դիմավորում' },
    { time: '19:00', label: 'Տոնական ընթրիք' },
    { time: '20:00', label: 'Ձմեռ պապի այցը' },
    { time: '20:30', label: 'Նվերների փոխանակում' },
    { time: '21:30', label: 'Երաժշտություն և պարեր' },
    { time: '23:00', label: 'Ավարտ' },
  ],
  rsvp: {
    title: 'Կմիանա՞ք մեզ',
    intro: 'Խնդրում ենք պատասխանել մինչև դեկտեմբերի 20-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Կգամ',
    no: 'Ցավոք, չեմ կարող',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: { line: 'Սպասում ենք Ձեզ' },
  // Sections hidden by the host (ids from sections.js); content is kept.
  hidden: {},
}
