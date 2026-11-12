// Each event type carries its own "identity" shape — what the event is
// fundamentally about — so the rest of the dashboard (titles, Details
// form, invitation summary) can render the right fields instead of
// assuming every event is a wedding:
//   pair          — two people (wedding, gender reveal), labeled per type
//   child-parents — a child plus their parents (christening)
//   celebrant     — one person being celebrated, with an age (birthday)
//   child         — a child's name only (children's event)
//   company       — a company/organization name (corporate)
//   none          — no special identity, just the event title (other)
export const TYPES = {
  wedding:      { l: 'Հարսանիք',                  inv: 'ՀԱՐՍԱՆԵԿԱՆ ՀՐԱՎԵՐ',     cls: 'ty-wedding',   icon: 'tyWedding',   identity: 'pair',          pairLabels: ['Հարսնացու', 'Փեսացու'] },
  christening:  { l: 'Մկրտություն',                inv: 'ՄԿՐՏՈՒԹՅԱՆ ՀՐԱՎԵՐ',     cls: 'ty-christening', icon: 'tyChristening', identity: 'child-parents' },
  birthday:     { l: 'Ծննդյան տոն',                inv: 'ԾՆՆԴՅԱՆ ՏՈՆ',          cls: 'ty-birthday',  icon: 'tyBirthday',   identity: 'celebrant' },
  genderReveal: { l: 'Gender Reveal',              inv: 'GENDER REVEAL',        cls: 'ty-gender',    icon: 'tyGender',     identity: 'pair',          pairLabels: ['Ծնող 1', 'Ծնող 2'] },
  kids:         { l: 'Մանկական միջոցառում',        inv: 'ՀՐԱՎԵՐ',               cls: 'ty-kids',      icon: 'tyKids',       identity: 'child' },
  corporate:    { l: 'Կորպորատիվ միջոցառում',      inv: 'ՀՐԱՎԵՐ',               cls: 'ty-corporate', icon: 'tyCorporate',  identity: 'company' },
  other:        { l: 'Այլ միջոցառում',             inv: 'ՀՐԱՎԵՐ',               cls: 'ty-misc',      icon: 'tyOther',      identity: 'none' },
};
export const TYPE_ORDER = ['wedding', 'christening', 'birthday', 'genderReveal', 'kids', 'corporate', 'other'];
export const RSVP = { confirmed: { l: 'Կգա', c: 'b-sage' }, declined: { l: 'Չի գա', c: 'b-rose' }, pending: { l: 'Չի պատասխանել', c: 'b-terracotta' } };
export const RSVP_PL = { confirmed: 'Կգան', declined: 'Չեն գա', pending: 'Չեն պատասխանել' };
export const ATT = { arrived: { l: 'Ներկա', c: 'b-sage' }, absent: { l: 'Բացակա', c: 'b-red' }, unknown: { l: 'Չնշված', c: 'b-grey' } };
export const GENDER = { m: 'Արական', f: 'Իգական', n: 'Նշված չէ' };
export const GENDER_PL = { m: 'Տղամարդիկ', f: 'Կանայք', n: 'Սեռը նշված չէ' };
// Which side of a wedding a guest belongs to — only meaningful for
// ev.type === 'wedding' (see GuestModal.jsx/Guests.jsx gating).
export const GUEST_SIDE = { bride: 'Հարսի կողմ', groom: 'Փեսայի կողմ' };
export const EV_ST = { draft: { l: 'Սևագիր', c: 'b-amber' }, active: { l: 'Ակտիվ', c: 'b-sage' }, today: { l: 'Այսօր', c: 'b-wine' }, done: { l: 'Ավարտված', c: 'b-grey' } };
export const INV_ST = { published: { l: 'Հրապարակված', c: 'b-sage' }, draft: { l: 'Հրապարակված չէ', c: 'b-amber' } };
export const LANGS = { hy: 'Հայերեն', en: 'English', ru: 'Русский' };

// Guest delivery channels. None of these have a real backend/API
// integration in this project (no server, no credentials) — `auto: false`
// everywhere is intentional and load-bearing: the send flow must never
// claim a channel delivered automatically when it didn't. `contact` says
// which guest field the channel needs; `link(contact, text, url)` builds a
// real, working deep link (wa.me / t.me / sms: / mailto:) that opens the
// guest's own app with the personalized message prefilled — the honest
// "manual sending workflow" the channel actually supports. Viber has no
// public web deep-link for messaging an arbitrary phone number, so it gets
// a copy-to-clipboard fallback instead of a fabricated link.
export const CHANNELS = {
  whatsapp: {
    l: 'WhatsApp', icon: 'chWhatsapp', contact: 'phone',
    link: (contact, text) => `https://wa.me/${contact.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`,
  },
  telegram: {
    l: 'Telegram', icon: 'chTelegram', contact: 'phone',
    link: (contact, text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  viber: {
    l: 'Viber', icon: 'chViber', contact: 'phone', copyOnly: true,
  },
  sms: {
    l: 'SMS', icon: 'chSms', contact: 'phone',
    link: (contact, text) => `sms:${contact.replace(/[^\d+]/g, '')}?&body=${encodeURIComponent(text)}`,
  },
  email: {
    l: 'Email', icon: 'chEmail', contact: 'email',
    link: (contact, text, url, subject) => `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
  },
};
export const INVITE_ST = {
  draft:  { l: 'Սպասում է', c: 'b-grey' },
  manual: { l: 'Պահանջում է ձեռքով ուղարկում', c: 'b-amber' },
  sent:   { l: 'Ուղարկված (ձեռքով)', c: 'b-sage' },
  failed: { l: 'Չհաջողվեց', c: 'b-red' },
};
// Fixed venue-type options for the "New venue" modal's Type select. Accounts
// can extend this list with their own custom types (see
// ev.customVenueTypes), persisted per-event alongside the rest of its data.
export const VENUE_TYPES = ['Ռեստորան', 'Եկեղեցի', 'Հարսի տուն', 'Փեսայի տուն', 'Սրահ', 'Բացօթյա վայր', 'Այլ'];

export const GROUP_COLORS = ['#6B1D2C', '#B0843F', '#C99A9A', '#6B8A72', '#7A8293', '#A0826A', '#8E6F86', '#5F7F87'];
export const GROUP_PRESETS = {
  wedding:      [['Հարսնացուի ընտանիք', 'family', 24], ['Փեսացուի ընտանիք', 'family', 24], ['Հարսնացուի ընկերներ', 'ind', 15], ['Փեսացուի ընկերներ', 'ind', 15], ['Աշխատանքային գործընկերներ', 'ind', 9], ['Այլ', 'ind', 4]],
  christening:  [['Ընտանիք', 'family', 45], ['Կնքահայր / Կնքամայր կողմ', 'family', 20], ['Ընկերներ', 'ind', 25], ['Այլ', 'ind', 10]],
  birthday:     [['Ընտանիք', 'family', 30], ['Ընկերներ', 'ind', 45], ['Գործընկերներ', 'ind', 18], ['Այլ', 'ind', 7]],
  genderReveal: [['Ընտանիք', 'family', 50], ['Ընկերներ', 'ind', 40], ['Այլ', 'ind', 10]],
  kids:         [['Ընտանիքներ', 'family', 60], ['Դասընկերներ', 'ind', 30], ['Այլ', 'ind', 10]],
  corporate:    [['Ղեկավարություն', 'ind', 10], ['Աշխատակիցներ', 'ind', 52], ['Գործընկեր ընկերություններ', 'ind', 24], ['Մամուլ', 'ind', 7], ['Այլ հյուրեր', 'ind', 7]],
  other:        [['Ընտանիք', 'family', 35], ['Ընկերներ', 'ind', 45], ['Այլ', 'ind', 20]],
};
