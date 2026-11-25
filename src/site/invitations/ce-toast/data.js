// All guest-facing text, dates and colours for the "ce-toast" corporate
// New Year party invitation, in the reference card's retro style: Santa
// tumbling into a cocktail glass, tilted handwritten lines in black and
// red on textured paper. Components read this shape via the shared
// editing context; data.i18n.js has Russian and English.
//
// eventDate drives the cover's date line, the countdown and the calendar
// link.
export const ceToastDefaultData = {
  eventDate: '2026-12-18T19:00:00',
  // Who invites — big, in black, after `hero.hostedBy`.
  company: '«Նովա» թիմը',
  hero: {
    // The big black title, top left.
    title1: 'Ձմեռ Պապի',
    title2: 'կենացը',
    // Bottom left: the black lead-in, then the event in red.
    lead: 'Կախեք փայլազարդերը՝ եկել է ժամանակը',
    event1: 'Ամանորյա',
    event2: 'խնջույքի',
    hostedBy: 'Հյուրընկալում է',
  },
  // The cover's last red line.
  rsvpLine: 'Պատասխանեք մինչև դեկտեմբերի 12-ը',
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի գործընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Տարին դժվար էր, բայց մենք հաղթեցինք։ Հիմա ժամանակն է բաժակ բարձրացնելու մեր թիմի, մեր հաջողությունների և գալիք տարվա կենացը։',
  countdownTitle: 'Մինչև խնջույքը մնացել է',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիր',
  schedule: [
    { time: '19:00', label: 'Դիմավորում և կոկտեյլներ' },
    { time: '19:45', label: 'Ղեկավարության կենացը' },
    { time: '20:15', label: 'Տոնական ընթրիք' },
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
    text: 'Կոկտեյլային՝ կարմիրի կամ փայլի մի դետալով։ Ձմեռ Պապի գլխարկը նույնպես ընդունելի է։',
    colors: ['#c8412f', '#1d1b1b', '#8e9a3f', '#f7f3ec'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք հաստատել ձեր մասնակցությունը մինչև դեկտեմբերի 12-ը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Այո, կգամ',
    no: 'Ցավոք, ոչ',
    plusLabel: 'Ինչպե՞ս կգաք',
    // [0] alone, [1] with a companion — the index is the RSVP's `plus`.
    plusOptions: ['Միայնակ', 'Ուղեկցորդով'],
    noteLabel: 'Սննդային նախընտրություններ կամ հարց (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Կսպասենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք ձեզ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: { line: 'Կենա՛ց և շնորհավոր Նոր տարի' },
  // Sections hidden by the hosts (ids from sections.js); content is kept.
  hidden: {},
}
