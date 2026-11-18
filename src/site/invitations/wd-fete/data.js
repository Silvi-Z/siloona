import guests1Photo from './assets/guests1.webp'
import guests2Photo from './assets/guests2.webp'

// "wd-fete" — a garden-party wedding sketched in coloured pens: a long
// banquet table, a disco ball, a chair with a bow, a chandelier; big thin
// names, the date in raspberry, a heart on the week strip, heart-shaped
// colour swatches, an organizer to call, and a guest questionnaire.
// All illustrations are SVG (components/Art.jsx); the two dress-code
// photos are the customer's to replace. Demo photos: Unsplash.
//
// eventDate drives «24. 09. 2027», the week strip and the countdown.
export const wdFeteDefaultData = {
  // Bride first (person1 is the bride).
  couple: { first: 'Նարինե', second: 'Գոռ' },
  eventDate: '2027-09-24T16:00:00',
  hero: { left: 'Մենք', right: 'ամուսնանում ենք։' },
  photos: { guests1: guests1Photo, guests2: guests2Photo },
  greeting: {
    general: 'Սիրելի հարազատներ և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Այս աշնանը տեղի կունենա կարևոր իրադարձություն՝ մենք կդառնանք ընտանիք։ Եվ շատ ենք ուզում այդ օրը կիսել Ձեզ հետ։',
  // [0] the ceremony, [1] the celebration. The address is what the map
  // button searches.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Աստվածածին եկեղեցի', address: 'Երևան, Արաբկիր, Կոմիտասի 40' },
    { label: 'Խնջույք', time: '17:30', name: '«Գարդեն Հաուս» այգի', address: 'Կոտայքի մարզ, Արզնի, Այգեստան 7' },
  ],
  mapButton: 'Բացել քարտեզը',
  scheduleTitle: 'Մեր օրվա ծրագիրը',
  // `icon`: one of the sketches in components/Art.jsx (tap it while
  // editing to change it).
  schedule: [
    { time: '15:30', label: 'Հյուրերի հավաք', icon: 'glasses' },
    { time: '16:00', label: 'Պսակադրություն', icon: 'rings' },
    { time: '17:30', label: 'Խնջույք', icon: 'plate' },
    { time: '22:00', label: 'Տորթ', icon: 'cake' },
    { time: '23:00', label: 'Պարեր', icon: 'disco' },
  ],
  dressCode: {
    title: 'Դրես-կոդ՝',
    style: 'cocktail attire',
    text: 'Շատ ենք ուզում պահպանել երեկոյի միասնական մթնոլորտը, ուստի ուրախ կլինենք, եթե աջակցեք այս գունային գամմային։',
    colors: ['#8C9273', '#F0D9A7', '#D9A23B', '#DD6B33', '#E0848F', '#C7375A', '#8E1537', '#4C5A35'],
    button: 'Կերպարների օրինակներ',
    // Where the button leads (a Pinterest board or any page with ideas).
    link: 'https://www.pinterest.com/search/pins/?q=cocktail%20attire%20wedding%20guest',
  },
  details: {
    title: 'Մանրամասներ',
    gifts: 'Որպեսզի մեր ձեռքերն ազատ լինեն գրկախառնությունների համար, ուրախ կլինենք թեթև նվերների՝ ծրարներով։',
    wine: 'Մեզ համար հաճելի կլինի, եթե ծաղիկների փոխարեն որոշեք նվիրել գինու մի շիշ մեր ընտանեկան գինու հավաքածուի համար։',
  },
  organizer: {
    text: 'Բոլոր հարցերով դիմեք մեր կազմակերպչին՝ Լիլիթին. նա սիրով կօգնի Ձեզ։',
    // Telegram: a @username or a phone number. Phone: for the call button.
    telegram: '+374 00 000000',
    phone: '+374 00 000000',
    tgButton: 'Գրել Telegram-ում',
    callButton: 'Զանգել',
  },
  rsvp: {
    title: 'Հյուրի հարցաթերթիկ',
    intro: 'Որպեսզի իմանանք, թե քանի աթոռ և բաժակ պատրաստել, խնդրում ենք լրացնել հարցաթերթիկը մինչև օգոստոսի 24-ը :)',
    nameLabel: 'Ձեր անունը և ազգանունը',
    attendQ: 'Կմասնակցե՞ք միջոցառմանը',
    yes: 'անպայման կգամ',
    no: 'ցավոք, չի ստացվի',
    transferQ: 'Տրանսֆեր պե՞տք կլինի',
    transferYes: 'այո',
    transferNo: 'ոչ',
    drinksQ: 'Ո՞ր խմիչքներն եք նախընտրում',
    drinks: ['փրփրուն գինի', 'սպիտակ գինի', 'կարմիր գինի', 'կոնյակ', 'օղի', 'վիսկի', 'ալկոհոլ չեմ խմում'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  countdownTitle: 'Արդեն հաշվում ենք րոպեները',
  closing: { line: 'Սիրով՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
