import heroBouquet from './assets/hero-bouquet.jpg'
import closingEmbrace from './assets/closing-embrace.png'

// All guest-facing text, dates and colors for the "wd-beige" wedding
// invitation live here. Components read this shape via the shared
// editing context (see ../shared/EditableContext) — nothing invitation-
// specific is hardcoded in the component tree — so a future content
// editor only ever needs to produce an object like this one.
//
// eventDate is the single source of truth for every displayed date
// format (hero label, big numeric date, countdown target) — see
// lib/formatDate.js. Editing it keeps all of those in sync.
export const wdBeigeDefaultData = {
  couple: {
    groomFirst: 'Միքայել',
    brideFirst: 'Տաթև',
    monogramLeft: 'Մ',
    monogramRight: 'Տ',
  },
  eventType: 'հարսանիքի',
  eventDate: '2027-09-18T15:00:00',
  greeting: {
    // Shown on a guest's personal link instead of lead/trail; {name} is
    // replaced with the guest's first name.
    personal: 'Սիրելի {name}',
    lead: 'Սիրելի ընտանիք',
    trail: 'և ընկերներ',
    text: 'Ուզում ենք ձեզ հետ կիսել մեր հարսանեկան օրվա երջանիկ պահերը։',
  },
  // The couple's story: a few short moments, in order.
  story: [
    { year: '2019', title: 'Առաջին հանդիպումը', text: 'Ծանոթացանք ընկերների հետ ամառային մի երեկո ու զրուցեցինք մինչև լուսաբաց։' },
    { year: '2024', title: 'Առաջարկը', text: 'Սևանի ափին, մայրամուտին, Միքայելը հարցրեց, իսկ Տաթևն ասաց՝ այո։' },
    { year: '2027', title: 'Մեր օրը', text: 'Եվ հիմա ուզում ենք մեր նոր սկիզբը կիսել ձեզ հետ։' },
  ],
  // Two places: the church ceremony, then the celebration (`venue`, also
  // used for the calendar link).
  ceremony: {
    title: 'Պսակադրություն',
    time: '13:00',
    name: 'Սուրբ Սարգիս եկեղեցի',
    address: 'Իսրայելյան փողոց 21, Երևան',
  },
  venue: {
    title: 'Հարսանյաց խնջույք',
    time: '15:00',
    name: 'Խնջույքի սրահ «Գարուն»',
    address: 'Կոմիտասի պողոտա 20, Երևան',
  },
  schedule: [
    { time: '13:00', label: 'Պսակադրություն եկեղեցում' },
    { time: '15:00', label: 'Հյուրերի հավաք, ֆուրշետ' },
    { time: '16:00', label: 'Խնջույքի սկիզբ' },
    { time: '22:00', label: 'Երեկոյի ավարտ' },
  ],
  dressCode: {
    intro: 'Մեր հարսանիքի ամենագլխավոր զարդը դուք եք։',
    note: 'Իսկ եթե ձեր կերպարները կաջակցեն տոնի գունային գամմային, այս օրը կդառնա էլ ավելի ներդաշնակ։',
    colors: ['#dccfbf', '#a08d79', '#6d6c6b'],
  },
  rsvp: {
    intro: 'Որպեսզի կարողանանք պատշաճ պատրաստվել միջոցառմանը, խնդրում ենք լրացնել այս հարցաթերթիկը՝',
    deadline: 'Խնդրում ենք պատասխանել մինչև սեպտեմբերի 1-ը',
    guestCountOptions: ['1 հոգի', '2 հոգի', '3 հոգի'],
    drinkOptions: ['Շամպայն', 'Կարմիր գինի', 'Սպիտակ գինի', 'Անալկոհոլային'],
    thanksYes: 'Սպասում ենք ձեզ սեպտեմբերի 18-ին՝ ժամը 15:00-ին։ Ձեր ներկայությունը մեզ համար ամենամեծ նվերն է։',
    thanksNo: 'Ցավում ենք, որ չեք կարող գալ։ Շնորհակալ ենք ջերմ խոսքերի համար։',
  },
  gift: {
    flowersText: 'Ծաղիկները հրաշալի են, սակայն գեղեցկությունը այնքան անցողիկ է։ Շատ կուրախանանք, եթե ծաղկեփնջի փոխարեն նվիրեք ձեր սիրելի գինու շիշը՝ այն կբացենք մեր տարեդարձերից մեկին և ջերմությամբ կհիշենք մեր առանձնահատուկ օրը։',
    envelopeText: 'Մեզ համար գլխավոր նվերը ձեր ներկայությունն է։ Իսկ եթե ցանկանաք մեզ էլ ավելի ուրախացնել, շնորհակալ կլինենք ծրարով նվերի համար՝ այն կդառնա մեր երիտասարդ ընտանիքի երազանքների և ծրագրերի մասը։',
    signature: 'սիրով',
  },
  closingNames: 'Միքայել և Տաթև',
  // Index 0 is the hero photo, index 1 is the closing photo. An empty
  // string falls back to a generated black & white placeholder scene.
  photos: [heroBouquet, closingEmbrace],
  // Sections the couple chose to hide (ids from sections.js). Hiding never
  // clears a section's content.
  hidden: {},
}
