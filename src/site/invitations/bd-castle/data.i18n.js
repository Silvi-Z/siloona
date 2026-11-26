import { bdCastleDefaultData } from './data'

// bd-castle's demo content in Russian and English — the same shape as
// data.js, plus `lang` (see invitationDefaults.js INVITATION_DEFAULTS_I18N).
// The name sentences match invitationPrefill.js CASTLE_PHRASES.
export const bdCastleRu = {
  ...bdCastleDefaultData,
  lang: 'ru',
  child: { name: 'Элен', age: '4' },
  gate: { kicker: 'Королевское письмо', hint: 'Нажмите на печать, чтобы открыть приглашение' },
  hero: { kicker: 'Королевское приглашение', title: 'Элен исполняется' },
  greeting: { general: 'Дорогие гости', personal: 'Привет, {name}!' },
  message: 'Ворота замка открываются, и наша маленькая принцесса с любовью приглашает вас на свой сказочный праздник — с играми, музыкой, сладкими сюрпризами и множеством улыбок.',
  countdownTitle: 'До праздника',
  scheduleTitle: 'Программа праздника',
  schedule: [
    { time: '13:00', label: 'Встреча гостей в замке' },
    { time: '13:30', label: 'Игры и сказочные сюрпризы' },
    { time: '14:30', label: 'Королевский стол' },
    { time: '15:30', label: 'Торт, свечи и пожелания' },
  ],
  venue: { title: 'Где', name: 'Детский зал «Сказка»', address: 'Ереван', button: 'Открыть на карте' },
  dressCode: {
    title: 'Королевские наряды',
    text: 'Маленьких принцесс и принцев ждём в самых красивых нарядах — с коронами и блёстками.',
  },
  rsvp: {
    ...bdCastleDefaultData.rsvp,
    title: 'Придёте в замок?',
    intro: 'Пожалуйста, ответьте до 1 июня.',
    nameLabel: 'Ваше имя',
    yes: 'Да, придём',
    no: 'К сожалению, нет',
    guestLabel: 'Сколько вас будет?',
    button: 'Отправить',
    thanksYes: 'Спасибо, {name}! Ворота замка открыты для вас.',
    thanksNo: 'Спасибо, {name}! Будем скучать.',
    nameError: 'Пожалуйста, укажите ваше имя.',
  },
  closing: { line: 'С любовью ждём вас', signature: 'Элен и родные' },
}

export const bdCastleEn = {
  ...bdCastleDefaultData,
  lang: 'en',
  child: { name: 'Elen', age: '4' },
  gate: { kicker: 'A royal letter', hint: 'Tap the seal to open the invitation' },
  hero: { kicker: 'A royal invitation', title: 'Elen turns' },
  greeting: { general: 'Dear guests', personal: 'Dear {name}' },
  message: 'The castle gates are opening, and our little princess warmly invites you to her fairy-tale party — with games, music, sweet surprises and lots and lots of smiles.',
  countdownTitle: 'Until the party',
  scheduleTitle: 'Party programme',
  schedule: [
    { time: '13:00', label: 'Guests arrive at the castle' },
    { time: '13:30', label: 'Games and fairy-tale surprises' },
    { time: '14:30', label: 'The royal table' },
    { time: '15:30', label: 'Cake, candles and wishes' },
  ],
  venue: { title: 'Where', name: 'Fairy Tale kids’ hall', address: 'Yerevan', button: 'Open in maps' },
  dressCode: {
    title: 'Royal attire',
    text: 'Little princesses and princes are welcome in their most beautiful outfits — with crowns and sparkle.',
  },
  rsvp: {
    ...bdCastleDefaultData.rsvp,
    title: 'Will you come to the castle?',
    intro: 'Please reply by 1 June.',
    nameLabel: 'Your name',
    yes: 'Yes, we’ll be there',
    no: 'Sadly, no',
    guestLabel: 'How many of you will come?',
    button: 'Send',
    thanksYes: 'Thank you, {name}! The castle gates are open for you.',
    thanksNo: 'Thank you, {name}. We’ll miss you.',
    nameError: 'Please enter your name.',
  },
  closing: { line: 'We can’t wait to see you', signature: 'Elen’s family' },
}
