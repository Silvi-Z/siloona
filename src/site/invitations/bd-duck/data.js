// All guest-facing text and the one canonical date for the "bd-duck"
// (geese storybook) birthday invitation. Same approach as
// bd-animals/data.js — components read this shape via the shared editing
// context, nothing invitation-specific is hardcoded in the component tree.
export const bdDuckDefaultData = {
  gate: {
    kicker: 'Հրավեր',
    hint: 'Սեղմեք սագուհու վրա՝ հրավերը բացելու համար',
  },
  kicker: 'Մեր փոքրիկ սագուհին',
  // The name with its article, as the sentence needs it («Լիլիթը», «Նարեն»).
  title: 'Լիլիթը դառնում է',
  age: '5',
  ageLabel: 'տարեկան',
  heroText: 'Եկեք միասին նշենք այս քնքուշ ու ուրախ օրը՝ թիթեռների, ծաղիկների և շատ-շատ ժպիտների հետ։',
  // The message heading. `personal` replaces it on a guest's personal
  // link ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի ընտանիք և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Մեր Լիլիթը մեծանում է, և այս տարի նա հրավիրում է ձեզ իր փոքրիկ հեքիաթային տոնին՝ լի քաղցրավենիքով, խաղերով և քնքշությամբ։ Շատ կուրախանանք, եթե կիսեք այս օրը մեզ հետ։',
  dateNote: 'Մեզ համար մեծ ուրախություն կլինի, որ ներկա լինեք',
  eventDate: '2027-05-29T12:00:00',
  countdown: {
    label: 'Տոնին մնացել է',
    done: 'Այսօր մեր տոնն է։',
  },
  venue: {
    name: '«Կանաչ այգի» սրճարան-այգի',
    address: 'Աբովյան 25, Երևան',
  },
  schedule: [
    { time: '12:00', label: 'Հյուրերի հավաք' },
    { time: '12:30', label: 'Խաղեր և արհեստանոց' },
    { time: '14:00', label: 'Տորթ և մաղթանքներ' },
    { time: '15:30', label: 'Հրաժեշտ՝ քաղցր նվերներով' },
  ],
  dressCode: { text: 'Նուրբ վարդագույն, մոխրավարդ և սպիտակ երանգներ՝ սագուհիների ժապավենների նման։' },
  gifts: { text: 'Լավագույն նվերը ձեր ժպիտն է։ Եթե ցանկանաք նվիրել՝ Լիլիթը կուրախանա գրքի, նկարչական պիտույքների կամ նուրբ խաղալիքի։' },
  rsvp: {
    intro: 'Սիրով խնդրում ենք պատասխանել մինչև մայիսի 20-ը։',
    // Index = companions beyond the guest who answers (1 person → 0 extra).
    guestOptions: ['1 մեծահասակ', '2 մեծահասակ', '2 մեծահասակ և 1 երեխա', '2 մեծահասակ և 2 երեխա'],
    thanksYes: 'Սպասում ենք ձեզ մայիսի 29-ին՝ ժամը 12:00-ին։ Լիլիթն արդեն անհամբեր սպասում է ձեր գրկախառնություններին։',
    thanksNo: 'Ցավում ենք, որ չեք կարող գալ։ Շնորհակալ ենք ջերմ խոսքերի համար։',
  },
  closing: {
    title: 'Սպասում ենք ձեզ',
    signature: 'Լիլիթի ընտանիք',
  },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
