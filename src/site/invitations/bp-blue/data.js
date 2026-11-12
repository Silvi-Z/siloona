// All guest-facing text for the "bp-blue" (blue hydrangea) baptism
// invitation. Same approach as the other designs' data.js — components read
// this shape via the shared editing context; nothing is hardcoded in them.
//
// eventDate drives the big date block (month / weekday / day / year). Each
// place keeps its own time text, since the service and the celebration
// start at different hours.
export const bpBlueDefaultData = {
  veil: 'Մկրտության հրավեր',
  prayer: 'Տե՛ր, վերցրու իմ փոքրիկ սիրտն այսօրվանից՝ քո օրհնյալ ձեռքերի մեջ։ Թող իմ մանկության անմեղությունը քեզ նվիրվի, և երբեք չհեռանամ քեզնից։',
  // The child's name in the genitive, as the title needs it («Սամվելի»).
  childName: 'Սամվելի',
  title: 'ՄԿՐՏՈՒԹՅՈՒՆԸ',
  parents: { label: 'Իմ ծնողները', first: 'Արամ Պետրոսյան', second: 'Լիլիթ Պետրոսյան' },
  godparents: { label: 'Իմ կնքահայրը և կնքամայրը', first: 'Դավիթ Հակոբյան', second: 'Մարիամ Ավետիսյան' },
  // Shown only on a guest's personal link ({name} → the guest's first
  // name), above the message; the general link shows nothing extra, as in
  // the source design.
  greeting: { general: '', personal: 'Սիրելի {name},' },
  message: 'Սիրով հրավիրում ենք ձեզ մեր որդու մկրտությանը՝ մեր ընտանիքի համար հատուկ պահին, երբ նա կստանա Աստծո օրհնությունը և կընդունվի Նրա հավատացյալ ընտանիքի մեջ…',
  eventDate: '2027-06-26T11:00:00',
  // [0] the church service, [1] the celebration. The map link searches
  // "name, address".
  places: [
    { time: 'Ժամը 11:00', title: 'Պատարագ', name: 'Սուրբ Հովհաննես եկեղեցի', address: 'Երևան' },
    { time: 'Ժամը 13:00', title: 'Տոնակատարություն', name: '«Երազանք» ռեստորան', address: 'Երևան' },
  ],
  rsvp: {
    title: 'Հաստատում',
    text: 'Շնորհակալ կլինենք, եթե հաստատեք ձեր ներկայությունը հնարավորինս շուտ',
    contacts: [
      { label: 'Զանգահարել մայրիկին', phone: '+374 00 000 001' },
      { label: 'Զանգահարել հայրիկին', phone: '+374 00 000 002' },
    ],
  },
  dressCode: { title: 'Հագուստի կոդ', text: 'Տոնական' },
  closing: { line: 'Սպասում ենք ձեր ներկայությանը', thanks: 'Շնորհակալություն' },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
