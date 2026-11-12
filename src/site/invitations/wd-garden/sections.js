// What this design is made of, for editors — same shape as
// wd-beige/sections.js (see there for the field meanings).
export const wdGardenSections = [
  {
    id: 'couple', title: 'Զույգը և ամսաթիվը', hideable: false, fromEvent: true,
    fields: [
      { path: 'couple.first', label: 'Հարսնացու', type: 'text' },
      { path: 'couple.second', label: 'Փեսացու', type: 'text' },
      { path: 'eventDate', label: 'Ամսաթիվ և ժամ', type: 'date' },
      { path: 'hero.label', label: 'Վերին տող', type: 'text' },
    ],
  },
  { id: 'intro', title: 'Բացման էկրան', hideable: false, fields: [{ path: 'gate.hint', label: 'Հուշում', type: 'text' }] },
  {
    id: 'story', title: 'Մեր պատմությունը',
    fields: [
      { path: 'story.title', label: 'Վերնագիր', type: 'text' },
      { path: 'story.text', label: 'Տեքստը', type: 'textarea' },
    ],
  },
  {
    id: 'date', title: 'Ամսաթիվ և օրացույց', hint: 'Ամսաթիվը, օրերի հետհաշվարկը և օրացույցը հաշվվում են ավտոմատ՝ միջոցառման ամսաթվից։',
    fields: [
      { path: 'date.title', label: 'Վերնագիր', type: 'text' },
      { path: 'date.before', label: 'Հետհաշվարկից առաջ', type: 'text' },
      { path: 'date.after', label: 'Հետհաշվարկից հետո', type: 'text' },
    ],
  },
  {
    id: 'venue', title: 'Վայրը', fromEvent: true,
    fields: [
      { path: 'venue.title', label: 'Վերնագիր', type: 'text' },
      { path: 'venue.name', label: 'Անվանում', type: 'text' },
      { path: 'venue.address', label: 'Հասցե (քարտեզի հղման համար)', type: 'text' },
      { path: 'venue.note', label: 'Լրացուցիչ տող', type: 'text' },
      { path: 'venue.button', label: 'Կոճակը', type: 'text' },
    ],
  },
  {
    id: 'schedule', title: 'Ծրագիր', fromEvent: true,
    fields: [
      { path: 'scheduleTitle', label: 'Վերնագիր', type: 'text' },
      { path: 'schedule', label: 'Ծրագիր', type: 'schedule' },
    ],
  },
  {
    id: 'rsvp', title: 'Հաստատում (RSVP)', rsvpSettings: true,
    fields: [
      { path: 'rsvp.title', label: 'Վերնագիր', type: 'text' },
      { path: 'rsvp.placeholder', label: 'Անվան դաշտի հուշում', type: 'text' },
      { path: 'rsvp.drinkQuestion', label: 'Խմիչքի հարցը', type: 'text' },
      { path: 'rsvp.drinks.0', label: '1-ին տարբերակ', type: 'text' },
      { path: 'rsvp.drinks.1', label: '2-րդ տարբերակ', type: 'text' },
      { path: 'rsvp.drinks.2', label: '3-րդ տարբերակ', type: 'text' },
      { path: 'rsvp.guestQuestion', label: 'Հյուրերի թվի հարցը', type: 'text' },
      { path: 'rsvp.button', label: 'Կոճակը', type: 'text' },
      { path: 'rsvp.sentButton', label: 'Կոճակը՝ ուղարկելուց հետո', type: 'text' },
      { path: 'rsvp.thanks', label: 'Պատասխան ({name}՝ հյուրի անունը)', type: 'text' },
    ],
  },
  { id: 'closing', title: 'Ավարտ', fields: [{ path: 'closing.line', label: 'Տողը անուններից ներքև', type: 'text' }] },
]
