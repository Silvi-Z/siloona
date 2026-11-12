// All guest-facing text and the one canonical date for the "bd-animals"
// birthday invitation. Mirrors wd-beige/data.js's approach — components
// read this shape via the shared editing context (../shared/EditableContext),
// nothing invitation-specific is hardcoded in the component tree.
export const bdAnimalsDefaultData = {
  gate: { teaser: 'Դու հրավիրված ես…' },
  child: { name: 'Նարե', age: '1' },
  // The hero's opening line. `personal` replaces it on a guest's personal
  // link ({name} → the guest's first name).
  greeting: {
    general: 'Կենդանիները հրավիրում են խնջույքի',
    personal: '{name}, կենդանիները քեզ հրավիրում են խնջույքի',
  },
  eventDate: '2027-06-12T15:00:00',
  message: 'Մեր փոքրիկ արևը դառնում է մեկ տարեկան։ Սիրով սպասում ենք ձեզ՝ այս ուրախ օրը մեզ հետ կիսելու',
  venue: {
    name: '«Արևային տնակ» խաղասենյակ',
    address: 'Աբովյան 15, Երևան',
  },
  rsvp: {
    deadlineLabel: 'մինչև հունիսի 5-ը',
    contactName: 'Աննա',
    contactPhone: '+374 00 000 000',
    thanksYes: 'Շատ ենք ուրախ։ Սպասում ենք ձեզ հունիսի 12-ին՝ ժամը 15:00-ին։',
    thanksNo: 'Ցավում ենք, որ չեք կարող գալ։ Մեծ գրկախառնություն ձեզ։',
  },
  signature: 'և իր ընտանիքը',
  // Sections hidden by the family (ids from sections.js); content is kept.
  hidden: {},
}
