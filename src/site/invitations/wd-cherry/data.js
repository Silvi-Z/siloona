import kidsPhoto from './assets/kids.webp'
import dressPhoto from './assets/dress.webp'
import suitPhoto from './assets/suit.webp'
import redPhoto from './assets/red.webp'

// "wd-cherry" — a playful cherry-and-cream love note: a childhood photo of
// the two of them as a sticker under «վերջապես / ՄԵՆՔ ԱՄՈՒՍՆԱՆՈՒՄ ԵՆՔ»,
// little speech notes, a taped calendar with the day circled by hand, the
// day's plan on a looping line that ends in a heart, a dress-code palette
// with outfit ideas, and a «wine instead of flowers» wish.
// Everything is the customer's to change, photos and palette included.
// Demo photos: Unsplash (assets/CREDITS.md).
//
// eventDate drives «12.06.2027», the calendar's month and its circled day.
export const wdCherryDefaultData = {
  // Bride first (person1 is the bride).
  couple: { first: 'Անի', second: 'Դավիթ' },
  eventDate: '2027-06-12T16:00:00',
  hero: {
    kicker: 'վերջապես',
    title: 'ՄԵՆՔ ԱՄՈՒՍՆԱՆՈՒՄ ԵՆՔ',
    // The two little speech notes over the childhood photo.
    her: '— Հետաքրքիր է, ո՞վ կլինի իմ ամուսինը, երբ մեծանամ…',
    him: '— Ե՛ս կլինեմ',
    ribbon: 'Դուք հրավիրված եք',
  },
  photos: { kids: kidsPhoto, dress: dressPhoto, suit: suitPhoto, red: redPhoto },
  greeting: {
    general: 'Սիրելի՛ ընկերներ և հարազատներ',
    personal: 'Սիրելի՛ {name}',
  },
  message: 'Սիրով հրավիրում ենք Ձեզ կիսելու մեզ հետ մեր հարսանիքի օրը, որը տեղի կունենա',
  calendarNote: 'պահեք այս օրը',
  scheduleTitle: 'օրվա ծրագիրը',
  schedule: [
    { time: '16:00', label: 'պսակադրություն' },
    { time: '17:30', label: 'հյուրերի դիմավորում' },
    { time: '18:00', label: 'խնջույք' },
    { time: '22:00', label: 'տորթ և պարեր' },
  ],
  dressCode: {
    title: 'Դրես-կոդ',
    text: 'Կփորձենք տոնը դարձնել գեղեցիկ ու ոճային և ուրախ կլինենք, եթե Ձեր հագուստում լինեն մեր հարսանիքի գույները',
    colors: ['#2a1a1c', '#4b2a31', '#7b1a2c', '#a8445a', '#efe3d4'],
    refsNote: 'մի քանի օրինակ Ձեզ համար',
  },
  wishes: {
    title: 'Ցանկություններ',
    text: 'Ծաղկեփնջի փոխարեն մեզ կուրախացնի գինու շիշը կամ Ձեր սիրելի խմիչքը',
    note: 'ծաղիկների փոխարեն',
  },
  venueTitle: 'Վայրը',
  // [0] the ceremony, [1] the celebration. The address is what the map
  // button searches.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Զորավոր եկեղեցի', address: 'Երևան, Վարդանանց 3' },
    { label: 'Խնջույք', time: '18:00', name: '«Նռնենի» ռեստորան', address: 'Երևան, Իսահակյան 28' },
  ],
  mapButton: 'Ինչպես հասնել',
  rsvp: {
    title: 'Կգա՞ք',
    intro: 'Խնդրում ենք պատասխանել մինչև մայիսի 12-ը։',
    yes: 'Իհարկե՛',
    no: 'Ցավոք, ոչ',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Ուռա՜, {name}։ Սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: { line: 'սիրով՝' },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
