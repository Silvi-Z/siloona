// All guest-facing text, dates and colours for the "ce-groovy" corporate
// Christmas / New Year party invitation, in the reference card's retro
// seventies style: a rainbow arch over a blush panel, chunky lettering
// with a dark offset shadow, a disco ball, a cluster of bells and a stack
// of gifts. Components read this shape via the shared editing context;
// data.i18n.js has Russian and English.
//
// eventDate drives the date row, the countdown and the calendar link.
export const ceGroovyDefaultData = {
  eventDate: '2026-12-18T19:00:00',
  // Who invites — in blue, under the date.
  company: '«Նովա» թիմը',
  hero: {
    kicker: 'Միացեք մեզ',
    // The chunky title, one line each (green, then red).
    title1: 'Զնգ-զնգ',
    title2: 'ու պար',
    subtitle: 'Ամանորյա երեկույթ',
    // The red line at the bottom.
    note: 'Բերեք փոքրիկ նվեր՝ տոնական փոխանակման համար',
  },
  // The cover's reply-by line.
  rsvpLine: 'Պատասխանեք մինչև դեկտեմբերի 10-ը',
  greeting: {
    general: 'Սիրելի գործընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Տարին ավարտում ենք այնպես, ինչպես աշխատել ենք՝ միասին, ուրախ և մի քիչ աղմկոտ։ Կլինեն երաժշտություն, պարեր, նվերներ և շատ ծիծաղ։',
  countdownTitle: 'Մինչև երեկույթը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և կոկտեյլներ' },
    { time: '19:45', label: 'Ղեկավարության խոսքը' },
    { time: '20:15', label: 'Տոնական ընթրիք' },
    { time: '21:30', label: 'Նվերների փոխանակում' },
    { time: '22:00', label: 'Դիսկո' },
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
    text: 'Ռետրո դիսկո՝ փայլ, վառ գույներ և լավ տրամադրություն։',
    colors: ['#c8513b', '#e0a83c', '#5f8f6c', '#eaa597', '#9cc0d3'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև դեկտեմբերի 10-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
    no: 'Ցավոք, ոչ',
    plusLabel: 'Ինչպե՞ս կգաք',
    // [0] alone, [1] with a companion — the index is the RSVP's `plus`.
    plusOptions: ['Միայնակ', 'Ուղեկցորդով'],
    noteLabel: 'Սննդային նախընտրություններ կամ հարց (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կհանդիպենք պարահրապարակում։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Շնորհավոր Նոր տարի', signature: '«Նովա» թիմը' },
  // Sections hidden by the hosts (ids from sections.js); content is kept.
  hidden: {},
}
