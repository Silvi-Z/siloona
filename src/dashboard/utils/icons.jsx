// Thin-line icon set, ported verbatim from the HTML prototype's inline SVGs.
const PATHS = {
  overview:    ['<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>'],
  orders:      ['<path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z"/><path d="M9 8.5h6M9 12h6"/>'],
  invitations: ['<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 6.5 8 6 8-6"/>'],
  designs:     ['<rect x="4" y="3.5" width="11" height="15" rx="1"/><path d="M15 6.5l4.2 1.1a1 1 0 0 1 .7 1.2l-3 11.3a1 1 0 0 1-1.2.7L9 19"/>'],
  clients:     ['<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.8.8 3 2.6 3.5 5.2"/>'],
  calendarBox: ['<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'],
  rsvp:        ['<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.3 4.6-4.8"/>'],
  payments:    ['<rect x="2.5" y="5.5" width="19" height="13" rx="1.5"/><path d="M2.5 10h19M6.5 15h3"/>'],
  analytics:   ['<path d="M4 4v16h16"/><path d="m7.5 15 3.5-4 3 2.5 5-6.5"/>'],
  account:     ['<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>'],
  search:      ['<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'],
  bell:        ['<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'],
  plus:        ['<path d="M12 5v14M5 12h14"/>'],
  more:        ['<circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/>'],
  close:       ['<path d="M6 6l12 12M18 6 6 18"/>'],
  copy:        ['<rect x="8.5" y="8.5" width="12" height="12" rx="1.5"/><path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5"/>'],
  eye:         ['<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'],
  eyeOff:      ['<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/><path d="M4 20 20 4"/>'],
  edit:        ['<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>'],
  menu:        ['<path d="M4 7h16M4 12h16M4 17h10"/>'],
  chevL:       ['<path d="m15 6-6 6 6 6"/>'],
  chevR:       ['<path d="m9 6 6 6-6 6"/>'],
  arrow:       ['<path d="M5 12h14M13 6l6 6-6 6"/>', 14],
  send:        ['<path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4z"/>'],
  check:       ['<path d="m5 12.5 4.5 4.5L19 7.5"/>'],
  list:        ['<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', 14],
  cal:         ['<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', 14],
  globe:       ['<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>'],
  user:        ['<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>'],
  out:         ['<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16l-4-4 4-4M6 12h10"/>'],
  help:        ['<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6M12 17h.01"/>'],
  palette:     ['<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.7-.9 1.4-1.9-.4-1.2.4-2.1 1.6-2.1h1.8a3.7 3.7 0 0 0 3.7-3.7c0-5-3.8-9.3-8.5-9.3z"/><circle cx="7.8" cy="11" r=".9"/><circle cx="10.5" cy="7.3" r=".9"/><circle cx="15" cy="7.8" r=".9"/>'],
  details:     ['<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'],
  events:      ['<rect x="3.5" y="4" width="17" height="6.5" rx="1"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="1"/>'],
  archive:     ['<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5M10 12.5h4"/>'],
  trash:       ['<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 12.5a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>'],
  ext:         ['<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'],
  layers:      ['<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/>'],
  clock:       ['<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'],
  upDown:      ['<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>', 14],
  chevSm:      ['<path d="m9 6 6 6-6 6"/>', 14],
  table:       ['<rect x="3.5" y="4.5" width="17" height="15" rx="1"/><path d="M3.5 9.5h17M3.5 14.5h17M9 9.5v10"/>', 14],
  import:      ['<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>'],

  /* Event-type picker icons */
  tyWedding:     ['<circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/>'],
  tyChristening: ['<path d="M12 3v18M6 9h12"/>'],
  tyBirthday:    ['<rect x="3.5" y="12.5" width="17" height="8" rx="1.5"/><path d="M3.5 16.5h17M12 12.5V8"/><path d="M12 8c-1.2-1-1.2-2.4 0-3.5 1.2 1.1 1.2 2.5 0 3.5z"/>'],
  tyGender:      ['<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.8a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2-2.4 3.6M12 17h.01"/>'],
  tyKids:        ['<path d="M12 3.5a5 5 0 0 1 5 5c0 3-2 5.3-4 6l.6 2a1 1 0 0 1-1 1.2h-1.2a1 1 0 0 1-1-1.2l.6-2c-2-.7-4-3-4-6a5 5 0 0 1 5-5z"/><path d="M12 17.7v2.8"/>'],
  tyCorporate:   ['<rect x="3" y="7.5" width="18" height="12" rx="1.5"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/>'],
  tyOther:       ['<path d="M12 3.2 13.8 9l5.7 1.4-5.7 1.4L12 17.6l-1.8-5.8-5.7-1.4L10.2 9z"/>'],

  /* Delivery-channel icons */
  chWhatsapp: ['<path d="M7 20.5 8.1 16.6A8 8 0 1 1 11.3 19.3z"/><path d="M9 9.5c0 3.5 2.6 6 5.8 6"/>'],
  chTelegram: ['<path d="M3 11.2 20.5 4l-3 16-5.8-4.3-2.7 2.6-.4-4.1L19 6.6 7.3 13z"/>'],
  chViber:    ['<path d="M12 3.5c-5 0-8.5 3.2-8.5 8 0 3 1.6 5.4 4.2 6.9l-.7 3.1 3.6-1.9c.5.1 1 .1 1.4.1 5 0 8.5-3.2 8.5-8.2s-3.5-8-8.5-8z"/><path d="M8.5 9.5c0 3.2 2.3 5.5 5.6 5.7"/>'],
  chSms:      ['<rect x="3" y="5" width="18" height="13" rx="2"/><path d="m4 6 8 6 8-6"/>'],
  chEmail:    ['<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/>'],
};
// Aliases mirroring the original's post-hoc Object.assign overrides.
const ALIASES = { invitation: 'invitations', guests: 'clients', calendar: 'calendarBox', event: 'overview' };

export default function Icon({ name, size, className = '', style }) {
  const key = ALIASES[name] || name;
  const entry = PATHS[key];
  if (!entry) return null;
  const [inner, defaultSize = 16] = entry;
  const s = size || defaultSize;
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={className} style={style}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
