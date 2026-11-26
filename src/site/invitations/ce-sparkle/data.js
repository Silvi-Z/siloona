import background from './assets/background.webp'

// "ce-sparkle" — a New Year party invitation (for a company or friends):
// one photograph of lit sparklers on a midnight-blue night held still
// behind the page (a fixed layer — iOS ignores background-attachment),
// the text scrolling straight over it. A handwritten «New Year», a wide
// «PARTY», the coming year in tall thin figures; the date inside a drawn
// gold ring with a spark on top; the programme; the reply.
//
// eventDate drives the date ring, the weekday line and the calendar link.
export const ceSparkleDefaultData = {
  eventDate: '2026-12-26T19:00:00',
  background,
  // Who invites — the small line at the very top and the signature.
  company: '«Նովա» ընկերություն',
  cover: {
    // Latin words in the handwritten and the wide display faces.
    script: 'New Year',
    word: 'PARTY',
    year: '2027',
  },
  // The guest's personal link replaces the general greeting
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի գործընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Տարվա վերջը լավագույն առիթն է՝ մի պահ կանգ առնելու, հիշելու այն ամենը, ինչ միասին ստեղծեցինք, և լույսերով ու երաժշտությամբ դիմավորելու նորը։ Սիրով հրավիրում ենք Ձեզ մեր ամանորյա երեկույթին։',
  venue: {
    name: '«Աստղ» սրահ',
    address: 'Երևան, Աբովյան 8',
  },
  mapButton: 'Ինչպես հասնել',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիրը',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և շամպայն' },
    { time: '19:30', label: 'Տոնական ֆուրշետ' },
    { time: '20:30', label: 'Կենդանի երաժշտություն' },
    { time: '21:30', label: 'Տարվա մրցանակներ' },
    { time: '22:00', label: 'DJ և պարեր' },
    { time: '23:30', label: 'Ավարտ' },
  ],
  rsvp: {
    title: 'Կմիանա՞ք մեզ',
    intro: 'Խնդրում ենք պատասխանել մինչև դեկտեմբերի 18-ը։',
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
