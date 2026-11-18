// "wd-portrait" — Save the Date. Two children, seen from behind, look at a
// framed silhouette of a bride and groom: the couple they will grow up to
// be. Quiet ivory paper, a thin brown frame line as the recurring motif, a
// handwritten Latin «Save the Date» and spaced serif capitals. The closing
// shows the portrait again without the children — now it's real.
//
// Art: the user's illustration (assets/scene.webp, portrait.webp — cut
// from it; its paper is the sheet colour #EDE9E0, so it sits frameless).
//
// Names are shown in capitals (made in JS, not CSS text-transform, which
// turns «և» into «ԵՒ»). eventDate drives the cover date, the calendar and
// the countdown.
export const wdPortraitDefaultData = {
  // Bride first, as on the cover (person1 is the bride).
  couple: { first: 'Լիլիթ', second: 'Արման' },
  eventDate: '2027-05-29T16:00:00',
  hero: {
    // Handwritten line on top (Latin — no handwriting font draws Armenian).
    script: 'Save the Date',
    // Under the names.
    line: 'ԱՄՈՒՍՆԱՆՈՒՄ ԵՆ',
  },
  // The guest's personal link replaces the general greeting
  // ({name} → the guest's first name).
  greeting: {
    general: 'Սիրելի հարազատներ և ընկերներ',
    personal: 'Սիրելի {name}',
  },
  message: 'Մի օր մենք պարզապես նայում էինք այս նկարին։ Հիմա պատրաստվում ենք դառնալ դրա մի մասը։ Սիրով հրավիրում ենք Ձեզ կիսելու մեզ հետ մեր կյանքի ամենաջերմ օրը։',
  story: {
    title: 'Մեր պատմությունը',
    text: 'Մենք մեծացել ենք նույն բակում։ Երեխա ժամանակ խոստացանք, որ միշտ միասին կլինենք, և այդ խոստումը պահեցինք։',
  },
  dateTitle: 'Նշեք այս օրը',
  countdownTitle: 'Մինչև մեր օրը մնաց',
  scheduleTitle: 'Օրվա ծրագիրը',
  schedule: [
    { time: '13:00', label: 'Փեսայի տուն' },
    { time: '14:30', label: 'Հարսի տուն' },
    { time: '16:00', label: 'Պսակադրություն' },
    { time: '18:00', label: 'Հարսանյաց խնջույք' },
  ],
  venueTitle: 'Վայրերը',
  // [0] the ceremony, [1] the celebration. The address is what the map
  // button searches.
  places: [
    { label: 'Պսակադրություն', time: '16:00', name: 'Սուրբ Հռիփսիմե եկեղեցի', address: 'Էջմիածին, Մաշտոցի 1' },
    { label: 'Հարսանյաց խնջույք', time: '18:00', name: '«Արարատ Հոլ» ռեստորան', address: 'Երևան, Իսակովի պողոտա 50' },
  ],
  mapButton: 'Ինչպես հասնել',
  dresscode: {
    title: 'Դրես-կոդ',
    text: 'Կուրախանանք, եթե ընտրեք բաց, մեղմ երանգներ՝ փղոսկրագույն, բեժ, մոխրագույն։',
  },
  rsvp: {
    title: 'Կմիանա՞ք մեզ',
    intro: 'Խնդրում ենք պատասխանել մինչև մայիսի 1-ը։',
    yes: 'Սիրով կգամ',
    no: 'Ցավոք, չեմ կարող',
    // Number of people, including the guest who answers.
    guestLabel: 'Քանի՞ հոգով կգաք',
    guestOptions: ['1', '2', '3', '4'],
    button: 'Ուղարկել',
    // {name} → the guest's first name.
    thanksYes: 'Շնորհակալություն, {name}։ Սպասում ենք Ձեզ։',
    thanksNo: 'Շնորհակալություն, {name}։ Կկարոտենք Ձեզ։',
    nameError: 'Խնդրում ենք նշել Ձեր անունը։',
  },
  closing: {
    script: 'with love',
    line: 'Սպասում ենք Ձեզ',
  },
  // Sections hidden by the couple (ids from sections.js); content is kept.
  hidden: {},
}
