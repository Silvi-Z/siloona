// All guest-facing text, dates and colours for the "ce-ornament" corporate
// Christmas / New Year invitation: a red watercolour ornament carrying the
// guest's name, hung on a cream satin bow, with a fan of white
// ornament-shaped cards behind it (after the supplied photo of a printed
// set). Components read this shape via the shared editing context.
//
// The ornament shows the guest's first name on a personal link; on the
// general link it shows `ornament.general`.
//
// eventDate drives every displayed date: the cover's date line, the date
// card, the countdown and the calendar link.
export const ceOrnamentDefaultData = {
  company: '«Նովա» ընկերություն',
  eventDate: '2026-12-26T19:00:00',
  hero: {
    kicker: 'Ամանորյա հրավեր',
    title: 'Ամանորյա երեկո',
  },
  ornament: { general: 'Սիրելի գործընկեր' },
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի գործընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Այս տարի միասին շատ բան ենք կառուցել։ Եկեք այն ավարտենք նույնքան ջերմ, որքան աշխատել ենք՝ լույսերով, երաժշտությամբ և լավ մարդկանց շրջապատում։',
  dateTitle: 'Ե՞րբ',
  countdownTitle: 'Մինչև երեկո մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և ապերիտիվ' },
    { time: '19:30', label: 'Ղեկավարության խոսքը' },
    { time: '20:00', label: 'Տոնական ընթրիք' },
    { time: '21:30', label: 'Տարվա մրցանակներ' },
    { time: '22:00', label: 'Երաժշտություն և պար' },
  ],
  venueTitle: 'Որտե՞ղ',
  venue: {
    name: '«Ձմեռային այգի» սրահ',
    // Also the map link's search query.
    address: 'Երևան',
  },
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Հագուստի ոճ',
    text: 'Երեկոյան հագուստ՝ կարմիրի, ոսկեգույնի կամ սպիտակի տոնական մի դետալով։',
    colors: ['#a3242c', '#d8b56a', '#f4efe6', '#2e2a2a'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք հաստատել ձեր մասնակցությունը մինչև դեկտեմբերի 18-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
    no: 'Ցավոք, ոչ',
    plusLabel: 'Ինչպե՞ս կգաք',
    // [0] alone, [1] with a companion — the index is the RSVP's `plus`.
    plusOptions: ['Միայնակ', 'Ուղեկցորդով'],
    dietLabel: 'Սննդային նախընտրություններ (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կսպասենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ այդ երեկո։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Ջերմ սպասում ենք ձեզ', signature: '«Նովա» ընկերության թիմ' },
  // Sections hidden by the organisers (ids from sections.js); content is kept.
  hidden: {},
}
