// Maps an event's own details (Details page) onto each invitation design's
// content shape, so a design opened from the dashboard already shows the
// event's real names, date and venue instead of the demo couple's. Only
// fields the event actually has filled in are returned — anything missing
// keeps the design's demo default. The user's own edits in the editor are
// stored separately and always win over these (see InvitationStudio.jsx).
//
// Kept on the dashboard side on purpose: the invitation designs themselves
// know nothing about dashboard events.
import { toISO, MONTHS_G } from '../utils/format';
import { INVITATION_DEFAULTS, INVITATION_SECTIONS } from '../../site/invitationDefaults';
import { deepMerge, diffData, setByPath } from '../../site/invitations/shared/pathUtils';
import * as actions from './actions';

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

function venue(ev) {
  const l = ev.locations?.[0];
  return l ? { name: l.name, address: l.address } : {};
}

const PREFILL = {
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
  'bd-duck': (ev) => {
    const name = ev.celebrant?.first?.trim();
    return {
      title: name ? `${withArticle(name)} դառնում է` : undefined,
      age: ev.celebrant?.age ? String(ev.celebrant.age) : undefined,
      eventDate: eventDateTime(ev),
      venue: venue(ev),
      closing: { signature: name ? `${genitive(name)} ընտանիք` : undefined },
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
    };
  },
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
  'card-mouse': (ev) => ({
    child: { name: ev.celebrant?.first?.trim() },
    ageLine: ev.celebrant?.age ? `${ev.celebrant.age} տարեկան` : undefined,
    eventDate: eventDateTime(ev),
    venue: venue(ev),
  }),
  'wd-garden-soft': (ev) => ({
    couple: { first: ev.person1?.first?.trim(), second: ev.person2?.first?.trim() },
    eventDate: eventDateTime(ev),
    venue: venue(ev),
    schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
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
  'wd-tulip': (ev) => {
    // Two places: [0] the ceremony, [1] the celebration.
    const places = (ev.locations || []).slice(0, 2).map((l) => compact({ time: l.time, name: l.name, address: l.address }));
    const defaults = INVITATION_DEFAULTS['wd-tulip'].places;
    return {
      // Groom first, as on the cover (person1 is the bride).
      couple: { first: ev.person2?.first?.trim(), second: ev.person1?.first?.trim() },
      eventDate: eventDateTime(ev),
      places: places.length ? defaults.map((d, i) => ({ ...d, ...places[i] })) : undefined,
      schedule: ev.schedule?.length ? [...ev.schedule].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(x => ({ time: x.time, label: x.title })) : undefined,
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
  'ce-ornament': (ev) => {
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
};

export function prefillFromEvent(slug, ev) {
  const fn = PREFILL[slug];
  return fn ? compact(fn(ev)) : {};
}

// One design's content for one event, as every dashboard view shows it:
//   base    — the design's demo content overlaid with the event's details
//   saved   — the user's own edits (diffs against base), if any
//   content — base + saved, i.e. what the guest would actually see
// Used by both the editor (InvitationStudio) and the live preview on
// «Իմ հրավերը», so the two can never disagree.
export function eventDesignContent(slug, ev) {
  const defaults = INVITATION_DEFAULTS[slug];
  if (!defaults) return null;
  const base = deepMerge(defaults, prefillFromEvent(slug, ev));
  const saved = ev.inv.designContent?.[slug];
  return { base, saved, content: deepMerge(base, saved) };
}

// The design's declared sections (site/invitations/<design>/sections.js) —
// what the editor offers for it, and nothing else.
export const designSections = (slug) => INVITATION_SECTIONS[slug] || [];

// Save the whole edited content (the in-place editors hand over a complete
// object) — stored as a diff against the event-derived base.
export function saveDesignEdit(ev, slug, next) {
  actions.saveDesignContent(ev, slug, diffData(eventDesignContent(slug, ev).base, next));
  return eventDesignContent(slug, ev).content;
}

// Set one field (or `hidden.<id>`) — what the dashboard's section editor uses.
export function setDesignField(ev, slug, path, value) {
  return saveDesignEdit(ev, slug, setByPath(eventDesignContent(slug, ev).content, path, value));
}

// The name the dashboard preview personalizes the greeting with: the first
// guest on the list, so the organizer sees how a real guest's link reads.
export const sampleGuestName = (ev) => ev.guests?.find(g => g.first)?.first || 'Աննա';
