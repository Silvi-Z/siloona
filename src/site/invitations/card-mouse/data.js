// All text and the date for the "card-mouse" printed birthday card
// (A5, soft clouds and stars around the cartoon mouse). Same approach as
// the web designs' data.js, so the card is edited in place the same way.
//
// eventDate drives the whole date row: «ԿԻՐԱԿԻ · 18 ԱՊՐԻԼԻ · ԺԱՄԸ 14:00».
export const cardMouseDefaultData = {
  child: { name: 'Էրիկ' },
  ageLine: '1 տարեկան',
  subtitle: 'Եկեք միասին նշենք',
  eventDate: '2027-04-18T14:00:00',
  venue: {
    name: '«Արևածագ» այգի',
    address: 'Ուրախության փ. 1, Երևան',
  },
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
