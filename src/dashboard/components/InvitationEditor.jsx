import { useState } from 'react';
import Icon from '../utils/icons';
import EmptyState from './EmptyState';
import { getByPath } from '../../site/invitations/shared/pathUtils';
import { fillName } from '../../site/invitations/shared/GuestGreeting';
import { eventDesignContent, designSections, setDesignField, sampleGuestName } from '../data/designPrefill';
import { toISO } from '../utils/format';
import * as actions from '../data/actions';
import TimeSelect from '../../site/invitations/shared/TimeSelect';

// «Հրավերի բովանդակություն» — the one place on «Իմ հրավերը» where the
// invitation's content is edited. Built entirely from the selected design's
// own section list (site/invitations/<design>/sections.js): a design
// without a dress code simply has no dress-code row. Every row is one real
// part of the invitation, with its own eye (show/hide — content is kept)
// and its fields. Changes save immediately into the same per-event content
// the preview, the published invitation and guests' links all render.
const ROLE_TITLES = { greeting: 'Անհատականացված ողջույն', message: 'Ընդհանուր հաղորդագրություն' };
const ROLE_HINTS = {
  greeting: 'Հյուրը, ով բացում է իր անհատական հղումը, կտեսնի այս ողջույնը իր անունով։ Ընդհանուր հղումով բացողները կտեսնեն ընդհանուր տարբերակը։',
  message: 'Հրավերի հիմնական տեքստը՝ նույնը բոլոր հյուրերի համար։',
};

const pad = (n) => String(n).padStart(2, '0');
function toLocalInput(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const short = (v, n = 64) => { const t = String(v ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

function Field({ field, value, onChange, sample }) {
  const id = `f-${field.path.replace(/\W/g, '-')}`;
  if (field.type === 'colors') {
    const colors = Array.isArray(value) ? value : [];
    return (
      <div className="fl full">{field.label}
        <div className="ed-colors">
          {colors.map((c, i) => (
            <span className="ed-color" key={i}>
              <input type="color" value={c} aria-label={`Գույն ${i + 1}`} onChange={(e) => onChange(colors.map((x, j) => (j === i ? e.target.value : x)))} />
              {colors.length > 1 && <button type="button" className="ed-x" aria-label="Հեռացնել գույնը" onClick={() => onChange(colors.filter((_, j) => j !== i))}>×</button>}
            </span>
          ))}
          {colors.length < 6 && <button type="button" className="btn sm ghost" onClick={() => onChange([...colors, colors[colors.length - 1] || '#c8b9a6'])}><Icon name="plus" /> Գույն</button>}
        </div>
      </div>
    );
  }
  if (field.type === 'schedule') {
    const rows = Array.isArray(value) ? value : [];
    const set = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
    return (
      <div className="fl full">{field.label}
        <div className="ed-rows">
          {rows.map((r, i) => (
            <div className="ed-row" key={i}>
              <input className="input ed-time" value={r.time} placeholder="00:00" aria-label="Ժամ" onChange={(e) => set(i, 'time', e.target.value)} />
              <input className="input" value={r.label} placeholder="Ինչ է տեղի ունենում" aria-label="Նկարագրություն" onChange={(e) => set(i, 'label', e.target.value)} />
              <button type="button" className="icon-btn sm bare" aria-label="Հեռացնել տողը" onClick={() => onChange(rows.filter((_, j) => j !== i))}><Icon name="close" /></button>
            </div>
          ))}
          <button type="button" className="btn sm ghost" onClick={() => onChange([...rows, { time: '', label: '' }])}><Icon name="plus" /> Ավելացնել տող</button>
        </div>
      </div>
    );
  }
  const input = field.type === 'textarea'
    ? <textarea id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    : field.type === 'date'
      ? (() => {
          // Date + 24-hour time lists (never AM/PM).
          const [day, time] = (toLocalInput(value) || 'T').split('T');
          const commit = (d, t) => d && onChange(`${d}T${t || '12:00'}:00`);
          return (
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input id={id} className="input" type="date" value={day} onChange={(e) => commit(e.target.value, time)} />
              <TimeSelect className="input" value={time} onChange={(t) => commit(day, t)} />
            </span>
          );
        })()
      : <input id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  return (
    <label className="full" htmlFor={id}>{field.label}{input}
      {field.personal && (
        String(value || '').includes('{name}')
          ? <span className="ed-note">Օրինակ՝ <b>{fillName(value, sample)}</b> · <code>{'{name}'}</code>-ի փոխարեն յուրաքանչյուր հյուր կտեսնի իր անունը։</span>
          : <span className="ed-note warn">Տեքստում չկա <code>{'{name}'}</code>, ուստի հյուրի անունը չի ավելանա։</span>
      )}
    </label>
  );
}

export default function InvitationEditor({ dash, ev, design, onFocus }) {
  const [open, setOpen] = useState(null);

  if (!design || !design.previewSlug) {
    return (
      <section className="panel inv-editor">
        <div className="panel-h"><h3>Հրավերի բովանդակություն</h3></div>
        <div className="panel-b">
          {design
            ? <p className="muted" style={{ margin: 0 }}>Քարտային դիզայնների բովանդակության խմբագրումը դեռ հասանելի չէ։ Վեբ հրավեր ընտրելու դեպքում այստեղ կհայտնվեն նրա բաժինները։</p>
            : <EmptyState title="Դիզայն դեռ ընտրված չէ" sub={<p className="muted" style={{ margin: '6px 0 0' }}>Ընտրված հրավերի բաժինները կհայտնվեն այստեղ՝ խմբագրման համար։</p>} />}
        </div>
      </section>
    );
  }

  const slug = design.previewSlug;
  const sections = designSections(slug);
  const { content, saved } = eventDesignContent(slug, ev);
  const sample = sampleGuestName(ev);
  const hiddenCount = sections.filter((s) => content.hidden?.[s.id]).length;

  const set = (path, value) => { setDesignField(ev, slug, path, value); dash.bump(); };
  const toggleOpen = (sec) => {
    const next = open === sec.id ? null : sec.id;
    setOpen(next);
    if (next && !content.hidden?.[sec.id]) onFocus?.({ id: sec.id, intro: sec.id === 'intro', n: Date.now() });
  };
  const toggleHidden = (sec) => {
    const hide = !content.hidden?.[sec.id];
    set(`hidden.${sec.id}`, hide);
    dash.toast(hide ? `«${sec.title || ROLE_TITLES[sec.role]}» բաժինը թաքցվեց · բովանդակությունը պահպանված է` : `«${sec.title || ROLE_TITLES[sec.role]}» բաժինը կրկին երևում է`);
    if (!hide) onFocus?.({ id: sec.id, n: Date.now() });
  };
  const resetAll = () => dash.confirm(
    'Վերակայե՞լ հրավերի բովանդակությունը',
    'Բոլոր տեքստերը կվերադառնան ձեր միջոցառման տվյալներին և դիզայնի սկզբնական տեքստերին, թաքցված բաժինները կրկին կերևան։',
    'Վերակայել',
    () => { actions.saveDesignContent(ev, slug, undefined); dash.bump(); dash.toast('Հրավերի բովանդակությունը վերակայվեց'); },
  );
  const summary = (sec) => {
    if (content.hidden?.[sec.id]) return 'Թաքցված է · բովանդակությունը պահպանված է';
    if (sec.role === 'greeting') return fillName(getByPath(content, sec.fields[0].path), sample);
    if (sec.hint && !sec.fields.length) return sec.hint;
    const f = sec.fields.find((x) => ['text', 'textarea'].includes(x.type) && getByPath(content, x.path));
    if (f) return getByPath(content, f.path);
    const sch = sec.fields.find((x) => x.type === 'schedule');
    if (sch) return `${(getByPath(content, sch.path) || []).length} տող`;
    return '';
  };

  return (
    <section className="panel inv-editor">
      <div className="panel-h">
        <h3>Հրավերի բովանդակություն</h3>
        <div className="spacer" />
        {hiddenCount > 0 && <span className="sub">{hiddenCount} բաժին թաքցված</span>}
      </div>
      <p className="ed-intro muted small">Ընտրեք բաժինը՝ այն խմբագրելու համար. նախադիտումը ցույց կտա, թե որտեղ է այն հրավերում։ Փոփոխությունները պահպանվում են ավտոմատ։ <Icon name="eye" size={13} /> պատկերակով բաժինը կարող եք թաքցնել՝ առանց բովանդակությունը կորցնելու։</p>
      <div className="ed-list">
        {sections.map((sec) => {
          const isOpen = open === sec.id;
          const hidden = !!content.hidden?.[sec.id];
          const title = sec.title || ROLE_TITLES[sec.role];
          return (
            <div key={sec.id} className={`ed-sec${isOpen ? ' open' : ''}${hidden ? ' is-hidden' : ''}`}>
              <div className="ed-head">
                <button type="button" className="ed-toggle" aria-expanded={isOpen} aria-controls={`ed-${sec.id}`} onClick={() => toggleOpen(sec)}>
                  <span className="ed-title">{title}</span>
                  <span className="ed-sum">{short(summary(sec))}</span>
                  <Icon name="chevSm" className="ed-chev" />
                </button>
                {sec.hideable !== false && (
                  <button
                    type="button" className="icon-btn sm bare ed-eye" aria-pressed={!hidden}
                    aria-label={hidden ? `Ցուցադրել «${title}» բաժինը` : `Թաքցնել «${title}» բաժինը`}
                    title={hidden ? 'Թաքցված է · սեղմեք՝ ցուցադրելու համար' : 'Երևում է · սեղմեք՝ թաքցնելու համար'}
                    onClick={() => toggleHidden(sec)}
                  ><Icon name={hidden ? 'eyeOff' : 'eye'} /></button>
                )}
              </div>
              {isOpen && (
                <div className="ed-body form" id={`ed-${sec.id}`}>
                  {(ROLE_HINTS[sec.role] || (sec.fields.length && sec.hint)) && <p className="ed-hint full">{ROLE_HINTS[sec.role] || sec.hint}</p>}
                  {hidden && <p className="ed-hint full warn">Այս բաժինը թաքցված է և չի երևում հրավերում։ Տեքստերը պահպանված են։</p>}
                  {sec.fromEvent && (
                    <p className="ed-hint full">Լրացված է «Միջոցառման մանրամասներ»-ից։ Այստեղ փոխելը կփոխի միայն հրավերը։ <button type="button" className="link" onClick={() => dash.go('details')}>Բացել մանրամասները</button></p>
                  )}
                  {sec.fields.map((f) => (
                    <Field key={f.path} field={f} value={getByPath(content, f.path)} sample={sample} onChange={(v) => set(f.path, v)} />
                  ))}
                  {!sec.fields.length && sec.hint && <p className="ed-hint full">{sec.hint}</p>}
                  {sec.rsvpSettings && <RsvpSettings dash={dash} ev={ev} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {saved && (
        <div className="ed-foot">
          <button type="button" className="link" onClick={resetAll}>Վերակայել բոլոր փոփոխությունները</button>
        </div>
      )}
    </section>
  );
}

// Event-level RSVP rules shown inside the design's RSVP section — the
// answer deadline (also drives the dashboard's countdowns/reminders) and
// the companions limit for guests' answers.
function RsvpSettings({ dash, ev }) {
  const save = (patch) => { actions.saveRsvpSettings(ev, patch); dash.bump(); };
  return (
    <div className="full ed-sub">
      <div className="ed-subtitle">Պատասխանների կանոններ</div>
      <div className="ed-grid">
        <label>Պատասխանելու վերջնաժամկետ
          <input className="input" type="date" value={toISO(ev.inv.deadline)} onChange={(e) => e.target.value && save({ deadline: e.target.value })} />
        </label>
        <label>Ուղեկցողներ մեկ հյուրին՝ առավելագույնը
          <select className="input" value={ev.info.maxPlus} onChange={(e) => save({ maxPlus: e.target.value })}>{[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select>
        </label>
      </div>
    </div>
  );
}
