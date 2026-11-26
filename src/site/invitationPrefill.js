// Maps an event's own details onto each invitation design's content shape,
// so a design shows the real names, date and venue instead of the demo
// ones. Only fields that are actually filled in are returned — anything
// missing keeps the design's demo default.
//
// Pure data mapping with no dashboard state, so both the dashboard
// (dashboard/data/designPrefill.js) and the public invitation page
// (/i/:code, filled from the checkout details) use the same rules.
import { toISO, MONTHS_G } from '../dashboard/utils/format'
import { INVITATION_DEFAULTS, defaultsFor } from './invitationDefaults'

const compact = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) { if (v.length) out[k] = v; }
    else if (v && typeof v === 'object') { const c = compact(v); if (Object.keys(c).length) out[k] = c; }
    else if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
};

function eventDateTime(ev) {
  if (!(ev.date instanceof Date) || Number.isNaN(ev.date.getTime())) return undefined;
  const time = /^\d{1,2}:\d{2}$/.test(ev.time || '') ? ev.time.padStart(5, '0') : '12:00';
  return `${toISO(ev.date)}T${time}:00`;
}

// Armenian name forms for sentences: «Լիլիթը / Նարեն դառնում է» (definite
// article) and «Լիլիթի / Աննայի ընտանիք» (genitive).
const VOWEL_END = /[աեէիոօ]$|ու$/;
const withArticle = (n) => n && `${n}${VOWEL_END.test(n) ? 'ն' : 'ը'}`;
const genitive = (n) => n && (n.endsWith('ա') ? `${n}յի` : `${n}ի`);

// wd-noir and wd-noir-lite. The day's places in order: a location's kind
// names it; without one the places line up with the last of the demo's
// (a church and a hall → «Պսակադրություն», «Հարսանյաց երեկո»). Fields the
// event leaves empty stay empty — never the demo's addresses.
const NOIR_KIND = { 'Եկեղեցի': 'Պսակադրություն', 'Ռեստորան': 'Հարսանյաց երեկո', 'Սրահ': 'Հարսանյաց երեկո', 'Բացօթյա վայր': 'Հարսանյաց երեկո', 'Հարսի տուն': 'Հարսի տուն', 'Փեսայի տուն': 'Փեսայի տուն' };
function noirPrefill(ev, defaults) {
  const locs = (ev.locations || []).slice(0, 6);
  const tail = defaults.slice(Math.max(0, defaults.length - locs.length));
  return {
    // Groom first, as on the cover (person1 is the bride).
    couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
    eventDate: eventDateTime(ev),
    places: locs.length ? locs.map((l, i) => ({
      label: NOIR_KIND[l.kind] || tail[i]?.label || defaults[defaults.length - 1].label,
      time: l.time || '', name: l.name || '', address: l.address || '',
    })) : undefined,
    schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  };
}

function venue(ev) {
  const l = ev.locations?.[0];
  return l ? { name: l.name, address: l.address } : {};
}

// bd-castle's sentences with the child's name, per invitation language.
// Russian and English are worded so the name needs no case ending.
const CASTLE_PHRASES = {
  hy: { title: (n) => `${withArticle(n)} դառնում է`, signature: (n) => `${genitive(n)} ընտանիք` },
  ru: { title: (n) => `${n} исполняется`, signature: (n) => `${n} и родные` },
  en: { title: (n) => `${n} turns`, signature: (n) => `${n}’s family` },
};

// bd-dots: the title's two lines from the name and the age, and the
// closing signature, in the invitation's language.
const ruYears = (a) => { const n = Number(a) % 100; const k = n % 10; return n > 10 && n < 15 ? 'лет' : k === 1 ? 'год' : k > 1 && k < 5 ? 'года' : 'лет'; };
const enOrdinal = (a) => { const n = Number(a) % 100; const k = n % 10; return `${a}${n > 10 && n < 14 ? 'th' : k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'}`; };
const DOTS_PHRASES = {
  hy: { name: (n) => genitive(n), age: (a) => `${a}-${String(a) === '1' ? 'ին' : 'րդ'} ծննդյան տոնը`, signature: (n) => `${genitive(n)} ընտանիք` },
  ru: { name: (n) => n, age: (a) => `отмечает ${a} ${ruYears(a)}`, signature: (n) => `${n} и родные` },
  en: { name: (n) => `${n}’s`, age: (a) => `${enOrdinal(a)} birthday party`, signature: (n) => `${n}’s family` },
};

export const PREFILL = {
  'wd-beige': (ev) => {
    const bride = ev.person1?.first?.trim();
    const groom = ev.person2?.first?.trim();
    // Two places: [0] the ceremony, [1] the celebration. With only one,
    // it is the celebration (the main venue, as before).
    const locs = ev.locations || [];
    const place = (l) => (l ? { time: l.time, name: l.name, address: l.address } : {});
    const dl = ev.inv?.deadline instanceof Date && !Number.isNaN(ev.inv.deadline.getTime()) ? ev.inv.deadline : null;
    return {
      couple: { groomFirst: groom, brideFirst: bride, monogramLeft: groom?.[0], monogramRight: bride?.[0] },
      eventDate: eventDateTime(ev),
      ceremony: locs.length > 1 ? place(locs[0]) : {},
      venue: place(locs.length > 1 ? locs[1] : locs[0]),
      // One place only: don't show the demo church as the ceremony.
      hidden: locs.length === 1 ? { ceremony: true } : undefined,
      rsvp: { deadline: dl ? `Խնդրում ենք պատասխանել մինչև ${MONTHS_G[dl.getMonth()]} ${dl.getDate()}-ը` : undefined },
      closingNames: groom && bride ? `${groom} և ${bride}` : undefined,
      // The event's own program (Details page), when it has one.
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-animals': (ev) => ({
    child: { name: ev.celebrant?.first?.trim(), age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
    eventDate: eventDateTime(ev),
    venue: venue(ev),
  }),
  'bd-planet': (ev) => {
    const name = ev.celebrant?.first?.trim();
    return {
      child: { name, age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
      hero: { title: name ? `${withArticle(name)} դառնում է` : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? `${genitive(name)} ընտանիք` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-balloons': (ev) => {
    const name = ev.celebrant?.first?.trim();
    return {
      child: { name, age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
      hero: { title: name ? `${withArticle(name)} դառնում է` : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? `${genitive(name)} ընտանիք` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-stitch': (ev) => {
    const name = ev.celebrant?.first?.trim();
    return {
      child: { name, age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
      hero: { title: name ? `${withArticle(name)} դառնում է` : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? `${genitive(name)} ընտանիք` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-cars': (ev) => {
    const name = ev.celebrant?.first?.trim();
    return {
      child: { name, age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
      hero: { title: name ? `${withArticle(name)} դառնում է` : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? `${genitive(name)} ընտանիք` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-build': (ev) => {
    const name = ev.celebrant?.first?.trim();
    return {
      child: { name, age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
      hero: { title: name ? `${withArticle(name)} դառնում է` : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? `${genitive(name)} ընտանիք` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-castle': (ev, lang) => {
    const name = ev.celebrant?.first?.trim();
    const p = CASTLE_PHRASES[lang] || CASTLE_PHRASES.hy;
    return {
      child: { name, age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined },
      hero: { title: name ? p.title(name) : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? p.signature(name) : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bd-dots': (ev, lang) => {
    const name = ev.celebrant?.first?.trim();
    const age = ev.celebrant?.age ? String(ev.celebrant.age).trim() : '';
    const p = DOTS_PHRASES[lang] || DOTS_PHRASES.hy;
    return {
      hero: { title1: name ? p.name(name) : undefined, title2: age ? p.age(age) : undefined },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? p.signature(name) : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'card-mouse': (ev) => ({
    child: { name: ev.celebrant?.first?.trim() },
    ageLine: ev.celebrant?.age ? `${ev.celebrant.age} տարեկան` : undefined,
    eventDate: eventDateTime(ev),
    venue: venue(ev),
  }),
  'wd-green': (ev) => ({
    couple: { first: ev.person1?.first?.trim(), second: ev.person2?.first?.trim() },
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
  'wd-garden': (ev) => ({
    couple: { first: ev.person1?.first?.trim(), second: ev.person2?.first?.trim() },
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
  'wd-chateau': (ev, lang) => {
    // Two places: [0] the ceremony, [1] the reception.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = defaultsFor('wd-chateau', lang).places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-noir': (ev) => noirPrefill(ev, INVITATION_DEFAULTS['wd-noir'].places),
  'wd-noir-lite': (ev) => noirPrefill(ev, INVITATION_DEFAULTS['wd-noir-lite'].places),
  'wd-portrait': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-portrait'].places;
    return {
      // Bride first, as on the cover (person1 is the bride).
      couple: { first: ev.person1?.first?.trim(), second: ev.person2?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-cherry': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-cherry'].places;
    return {
      // Bride first (person1 is the bride).
      couple: { first: ev.person1?.first?.trim(), second: ev.person2?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-rouge': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-rouge'].places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-mono': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-mono'].places;
    return {
      // Bride first, as on the cover (person1 is the bride).
      couple: { first: ev.person1?.first?.trim(), second: ev.person2?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map((x, i) => ({ time: x.time, label: x.title, icon: x.icon || INVITATION_DEFAULTS['wd-mono'].schedule[i]?.icon })) : undefined,
    };
  },
  'wd-velvet': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-velvet'].places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-line': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-line'].places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-calla': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-calla'].places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'wd-meadow': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-meadow'].places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'bp-blue': (ev) => {
    const name = ev.child?.first?.trim();
    // Two places: [0] the church service, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time ? `Ժամը ${l.time}` : undefined, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['bp-blue'].places;
    return {
      childName: genitive(name),
      parents: { first: ev.parents?.father?.trim(), second: ev.parents?.mother?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
    };
  },
  'gp-balloons': (ev) => {
    const a = ev.person1?.first?.trim();
    const b = ev.person2?.first?.trim();
    return {
      parents: { first: a, second: b },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: a && b ? `${a} և ${b}` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'gp-stork': (ev) => {
    const a = ev.person1?.first?.trim();
    const b = ev.person2?.first?.trim();
    return {
      parents: { first: a, second: b },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: a && b ? `${a} և ${b}` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'ce-garland': (ev) => {
    const company = ev.company?.trim();
    return {
      company,
      hero: { title: ev.title?.trim() },
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: company },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  // The hosts are the event's company / organiser, or its title.
  'ce-pine': (ev) => ({
    hosts: ev.company?.trim(),
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
  // Same as ce-pine; the end time stays the design's own.
  'ce-truck': (ev) => ({
    hosts: ev.company?.trim(),
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
  'ce-jingle': (ev) => {
    const company = ev.company?.trim();
    return {
      company,
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: company },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'ce-groovy': (ev) => {
    const company = ev.company?.trim();
    return {
      company,
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: company },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'ce-holly': (ev) => {
    const company = ev.company?.trim();
    return {
      company,
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: company },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
  'ce-sparkle': (ev) => ({
    company: ev.company?.trim() || ev.title?.trim(),
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
  'ce-cozy': (ev) => ({
    company: ev.company?.trim() || ev.title?.trim(),
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
  'ce-toast': (ev) => ({
    company: ev.company?.trim(),
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
  }),
};

// `lang`: the invitation's language — designs that build sentences from a
// name (or keep demo labels) build them in it.
export function prefillFromEvent(slug, ev, lang = 'hy') {
  const fn = PREFILL[slug];
  return fn ? compact(fn(ev, lang)) : {};
}

// ---------------------------------------------------------------------------
// From checkout details (orders.customization) — the public /i/:code page.
// The checkout asks for one free-text «names» field, so it is read as either
// two people («Աննա & Միքայել», «Աննա և Միքայել») or one person/company
// («Նարե», «Siloona LLC»), and offered in every identity slot; each design's
// mapping above picks only the fields it uses.
// ---------------------------------------------------------------------------
export function eventFromCustomization(c = {}) {
  const names = (c.names || '').trim()
  const [a, b] = names.split(/\s*(?:&|\+|,|\s+և\s+|\s+ու\s+|\s+and\s+)\s*/i).map((x) => x.trim()).filter(Boolean)
  const date = /^\d{4}-\d{2}-\d{2}$/.test(c.eventDate || '') ? new Date(`${c.eventDate}T00:00:00`) : undefined
  const time = /^\d{2}:\d{2}$/.test(c.eventTime || '') ? c.eventTime : undefined
  return {
    title: names,
    company: names,
    person1: { first: a },
    person2: { first: b },
    celebrant: { first: a },
    child: { first: a },
    date,
    time,
    locations: c.venue ? [{ name: c.venue.trim(), address: '', time }] : [],
    schedule: [],
    inv: {},
  }
}

export function prefillFromCustomization(slug, customization, lang = 'hy') {
  return prefillFromEvent(slug, eventFromCustomization(customization), lang)
}
