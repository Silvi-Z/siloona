// All guest-facing text, dates and colors for the "gp-balloons" gender
// party invitation. Same approach as bd-animals/data.js — components read
// this shape via the shared editing context (../shared/EditableContext),
// nothing invitation-specific is hardcoded in the component tree.
//
// eventDate is the single source of truth for every displayed date (hero
// line, venue card, countdown target) — see lib/formatDate.js.
export const gpBalloonsDefaultData = {
  kicker: 'ԳԵՆԴԵՐ ԵՐԵԿՈՒՅԹ',
  title: { first: 'Տղա՞', or: 'թե՞', second: 'Աղջի՞կ' },
  parents: { first: 'Անի', second: 'Դավիթ', trail: 'սպասում են ձեզ' },
  eventDate: '2026-12-12T15:00:00',
  // The invitation's heading. `personal` replaces it on a guest's personal
  // link ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի՛ հյուրեր',
    personal: 'Սիրելի՛ {name}',
  },
  message: 'Հրավիրում ենք ձեզ ջերմ երեկոյի, որտեղ կիմանանք մեր ապագա փոքրիկի սեռը։ Մեկ փուչիկ, մեկ ակնթարթ — և դուք մեր կողքին կլինեք, երբ գաղտնիքը բացահայտվի։',
  countdownDone: 'Այսօր է այդ օրը։',
  schedule: [
    { time: '14:30', label: 'հյուրերի հավաք' },
    { time: '15:00', label: 'ֆուրշետ' },
    { time: '16:00', label: 'զվարճալի ծրագիր' },
    { time: '17:00', label: 'բացահայտում ենք փոքրիկի սեռը' },
  ],
  venue: {
    name: '«Kitchen» ընտանեկան սրճարան',
    address: 'Տերյան 50, Երևան',
  },
  dressCode: {
    text: 'Մեզ համար ամենակարևորը ձեր ներկայությունն է։ Բայց եթե ցանկանաք աջակցել օրվա գունային գամմային, մենք շատ կուրախանանք։',
    colors: ['#8fc4e6', '#d9ecf8', '#ef9fb4', '#fbdde5', '#d8bb8c'],
  },
  rsvp: {
    intro: 'Խնդրում ենք հաստատել մինչև դեկտեմբերի 1-ը և կատարել ձեր գուշակությունը։',
    thanksYes: 'Սպասում ենք ձեզ դեկտեմբերի 12-ին՝ ժամը 15:00-ին։',
    thanksNo: 'Մեզ կպակասեք․ անպայման կկիսվենք նորությամբ ձեզ հետ։',
  },
  closing: {
    title: 'Շուտով ամեն ինչ կիմանանք',
    signature: 'Անի և Դավիթ',
  },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
