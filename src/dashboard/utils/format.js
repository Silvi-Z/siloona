// Fixed "demo clock" — the prototype pins today's date so the seeded mock
// data (RSVP stats, event statuses, countdowns) is always the same on load.
export const MS_DAY = 864e5;
export const TODAY = new Date(2026, 10, 6);
export const NOW = new Date(2026, 10, 6, 17, 30);
const T0 = Date.now();
export const nowX = () => new Date(NOW.getTime() + (Date.now() - T0));

export const strip = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dayDiff = (a, b) => Math.round((strip(a) - strip(b)) / MS_DAY);
export const sameDay = (a, b) => a && b && dayDiff(a, b) === 0;
export const sameMonth = (a, m) => a && a.getFullYear() === m.getFullYear() && a.getMonth() === m.getMonth();
export const minD = (a, b) => a < b ? a : b;
export const maxD = (a, b) => a > b ? a : b;
export const sum = (arr, f = x => x) => arr.reduce((s, x) => s + f(x), 0);

export const MONTHS   = ['հունվար','փետրվար','մարտ','ապրիլ','մայիս','հունիս','հուլիս','օգոստոս','սեպտեմբեր','հոկտեմբեր','նոյեմբեր','դեկտեմբեր'];
export const MONTHS_G = ['հունվարի','փետրվարի','մարտի','ապրիլի','մայիսի','հունիսի','հուլիսի','օգոստոսի','սեպտեմբերի','հոկտեմբերի','նոյեմբերի','դեկտեմբերի'];
export const MONTHS_S = ['հնվ','փտր','մրտ','ապր','մյս','հնս','հլս','օգս','սեպ','հոկ','նոյ','դեկ'];
export const WEEK_S = ['Կիր','Երկ','Երք','Չրք','Հնգ','Ուրբ','Շբթ'];
export const WEEK_L = ['Կիրակի','Երկուշաբթի','Երեքշաբթի','Չորեքշաբթի','Հինգշաբթի','Ուրբաթ','Շաբաթ'];
export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtD  = d => d ? `${d.getDate()} ${MONTHS_S[d.getMonth()]} ${d.getFullYear()}` : '—';
export const fmtDL = d => d ? `${d.getDate()} ${MONTHS_G[d.getMonth()]}, ${d.getFullYear()}` : '—';
export const fmtDay = d => `${WEEK_L[d.getDay()]}, ${d.getDate()} ${MONTHS_G[d.getMonth()]}, ${d.getFullYear()}`;
export const toISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const fromISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
export const num = n => Math.round(n).toLocaleString('en-US').replace(/,/g, ' ');
export const money = n => num(n) + ' ֏';
export const moneyShort = n => n >= 1e6 ? (n/1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.0','') + ' մլն' : n >= 1e3 ? Math.round(n/1e3) + ' հզ' : String(Math.round(n));
export const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

export const relTime = at => {
  if (!at) return '';
  if (at === 'now') return 'հենց հիմա';
  const h = (NOW - at) / 36e5;
  if (h < 1) return Math.max(1, Math.round(h * 60)) + ' րոպե առաջ';
  if (h < 24 && sameDay(at, TODAY)) return Math.round(h) + ' ժամ առաջ';
  const d = dayDiff(TODAY, at);
  if (d <= 1) return 'երեկ';
  if (d < 7) return d + ' օր առաջ';
  return fmtD(at);
};
export const untilLabel = d => {
  const n = dayDiff(d, TODAY);
  if (n === 0) return 'այսօր';
  if (n === 1) return 'վաղը';
  if (n > 0) return `${n} օրից`;
  if (n === -1) return 'երեկ';
  return `${-n} օր առաջ`;
};
export const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');
