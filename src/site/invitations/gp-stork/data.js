// All guest-facing text, dates and colours for the "gp-stork" gender party
// invitation: a painted stork carrying a baby in a bundle (the supplied
// artwork). The core keys match gp-balloons (kicker, title, parents,
// eventDate, venue, schedule, closing.signature …) so the dashboard
// prefill is the same; the rest are this design's own labels.
//
// eventDate drives every displayed date: the cover's date line, the
// countdown and the calendar link.
export const gpStorkDefaultData = {
  kicker: 'Գենդեր երեկույթ',
  title: { first: 'Տղա՞', or: 'թե՞', second: 'Աղջի՞կ' },
  parents: { first: 'Մարի', second: 'Արթուր', trail: 'սպասում են ձեզ' },
  eventDate: '2027-03-13T16:00:00',
  // The welcome heading. `personal` replaces it on a guest's personal link
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հարազատներ և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Արագիլն արդեն ճանապարհին է, բայց դեռ չի ասում՝ ում է բերում։ Եկեք միասին բացենք այս քաղցր գաղտնիքը՝ մեր ամենամտերիմ մարդկանց շրջապատում։',
  countdownTitle: 'Մինչև գաղտնիքի բացահայտումը',
  countdownDone: 'Այսօր է այդ օրը։',
  calendarButton: 'Ավելացնել օրացույցում',
  scheduleTitle: 'Երեկոյի ծրագիրը',
  schedule: [
    { time: '16:00', label: 'Հյուրերի դիմավորում' },
    { time: '16:30', label: 'Ֆուրշետ և խաղեր' },
    { time: '17:30', label: 'Գուշակությունների պահը' },
    { time: '18:00', label: 'Բացահայտում ենք փոքրիկի սեռը' },
  ],
  venueTitle: 'Որտեղ',
  venue: {
    name: '«Ամպիկ» ընտանեկան սրճարան',
    // Also the map link's search query.
    address: 'Երևան',
  },
  mapButton: 'Ինչպես հասնել',
  dressCode: {
    title: 'Գույները',
    text: 'Ընտրեք ձեր գուշակության գույնը՝ երկնագույն, եթե կարծում եք՝ տղա է, վարդագույն, եթե՝ աղջիկ։',
    colors: ['#9cc0de', '#dbe9f4', '#f3c6d1', '#e597ab'],
  },
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև մարտի 5-ը և կատարել ձեր գուշակությունը։',
    nameLabel: 'Անուն, ազգանուն',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    guessLabel: 'Ձեր գուշակությունը',
    boy: 'Տղա',
    girl: 'Աղջիկ',
    wishLabel: 'Մաղթանք (ըստ ցանկության)',
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Անպայման կկիսվենք նորությամբ ձեզ հետ։',
    nameError: 'Խնդրում ենք նշել ձեր անունը։',
  },
  closing: {
    title: 'Շուտով ամեն ինչ կիմանանք',
    signature: 'Մարի և Արթուր',
  },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
