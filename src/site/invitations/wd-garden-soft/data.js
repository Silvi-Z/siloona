// All guest-facing text, dates and colors for the "wd-garden-soft"
// (lavender stripes, painted garden) wedding invitation. Same approach as
// wd-beige/data.js — components read this shape via the shared editing
// context; nothing invitation-specific is hardcoded in the component tree.
//
// eventDate drives every displayed date: the "12 • 12 • 2026" line, the
// long date under the arch and the highlighted day in the week strip.
export const wdGardenSoftDefaultData = {
  couple: { first: 'Աննա', second: 'Միքայել' },
  gate: {
    lead: 'Դուք հրավիրված եք',
    line1: 'հարսանիքի',
    line2: 'մասնակցելու',
    hint1: 'Սեղմեք էկրանի ցանկացած տեղում՝',
    hint2: 'բոլոր մանրամասները իմանալու համար…',
  },
  eventDate: '2026-12-12T14:30:00',
  hero: {
    line: 'Մենք ամուսնանում ենք',
    caption: 'Այս օրը կդառնա ավելի գեղեցիկ, եթե անցկացնեք այն մեզ հետ',
    note: 'Բարի գալուստ մեր պարտեզ, որտեղ սկսվում է մեր պատմությունը',
    city: 'ԵՐԵՎԱՆ',
  },
  // The heading under the arch. `personal` replaces it on a guest's
  // personal link ({name} → the guest's first name).
  greeting: {
    general: 'Հարգելի հյուրեր',
    personal: 'Հարգելի {name}',
  },
  message: 'Շատ շուտով կգա օրը, որը կդառնա մեր նոր գլխի սկիզբը։',
  message2: 'Մենք ուրախ կլինենք կիսել այն մեր ամենամոտ և թանկագին մարդկանց հետ։ Հրավիրում ենք ձեզ անցկացնել այս առանձնահատուկ օրը մեզ հետ։',
  venue: {
    name: 'Կալվածք «Սպիտակ այգի»',
    address: 'Երևան, Բարեկամության 12',
    note: 'Հենց այստեղ մենք միմյանց կասենք «այո»',
  },
  scheduleSub: 'Մեր օրը ըստ ժամերի',
  schedule: [
    { time: '14:30', label: 'Հյուրերի հավաք' },
    { time: '15:00', label: 'Պսակադրություն' },
    { time: '15:45', label: 'Տոնական ընթրիք' },
    { time: '18:00', label: 'Առաջին պար' },
    { time: '21:00', label: 'Տորթ' },
    { time: '23:00', label: 'Երեկոյի ավարտ' },
  ],
  scheduleCaption: 'Թող այս օրը հոսի թեթև՝ առաջին գրկախառնություններից մինչև երեկոյան լույսեր',
  dressCode: {
    intro: 'Մեզ համար առանձնահատուկ հաճելի կլինի, եթե ձեր կերպարներում աջակցեք մեր տոնի գունային պալիտրային',
    colors: ['#fbf4e6', '#d9a8ac', '#8a9c7b', '#b9a9d3', '#c07f87', '#b7aa95'],
    // Caption under each swatch, by index (edited in place on the page).
    colorNames: ['Կրեմագույն', 'Փոշեգույն', 'Անանուխ', 'Լավանդա', 'Մոխրավարդ', 'Բեժ'],
    note: 'Սիրելի աղջիկներ, խնդրում ենք պահպանել մեկ հարսանեկան ավանդույթ. մի ընտրեք սպիտակ գույնը և նրա երանգները, թողնենք այն հարսի համար։',
  },
  detailsTitle: 'Մի քանի խոսք կարևորի մասին',
  gifts: { title: 'Նվերներ', text: 'Խնդրում ենք չծանրաբեռնել ձեզ ծաղիկների և նվերների ընտրությամբ։ Լավագույն նվերը մեզ համար ձեր ներկայությունն է և ջերմ խոսքերը։' },
  contribution: { title: 'Ներդրում', text: 'Եթե ցանկանաք նվիրել արժեքավոր և անհրաժեշտ ինչ-որ բան, շնորհակալ կլինենք ներդրման համար մեր երիտասարդ ընտանիքի բյուջեում։' },
  kids: { title: 'Փոքրիկներ', text: 'Խնդրում ենք տոնի ժամանակ փոքրիկներին թողնել վստահելի ձեռքերում, քանի որ վայրը մանկական անկյուն և անիմատորներ չի նախատեսում։' },
  rsvp: {
    intro: 'Խնդրում ենք լրացնել մինչև դեկտեմբերի 1-ը, որպեսզի կարողանանք լավագույնս պատրաստվել հարսանիքին։',
    // Index = companions beyond the guest who answers.
    guestOptions: ['1 հոգի', '2 հոգի', '3 հոգի', '4 հոգի'],
    drinkOptions: ['Շամպայն', 'Կարմիր գինի', 'Սպիտակ գինի', 'Վիսկի', 'Օղի', 'Կոնյակ', 'Անալկոհոլային'],
    thanksYes: 'Սպասում ենք ձեզ դեկտեմբերի 12-ին՝ ժամը 14:30-ին։ Ձեր ներկայությունը մեզ համար ամենամեծ նվերն է։',
    thanksNo: 'Ցավում ենք, որ չեք կարող գալ։ Շնորհակալ ենք ջերմ խոսքերի համար։',
  },
  contacts: {
    intro: 'Եթե հարցեր ունեք տոնի վերաբերյալ, կարող եք դիմել մեր կազմակերպչին՝',
    name: 'Աննա',
    phone: '+374 00 000 000',
  },
  closing: 'Սպասում ենք ձեզ անհամբերությամբ',
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
