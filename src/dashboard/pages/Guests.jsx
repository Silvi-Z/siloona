import Icon from '../utils/icons';
import { Badge } from '../components/Badge';
import { MenuItem } from '../components/Overlays';
import { SearchField, SelectField, Tabs, Seg } from '../components/Controls';
import Kpi from '../components/Kpi';
import RsvpBar from '../components/RsvpBar';
import EmptyState from '../components/EmptyState';
import { useDashboard } from '../state/DashboardContext';
import { stats, grp, fullName, ppl } from '../data/selectors';
import { RSVP, ATT, GENDER, CHANNELS, INVITE_ST, GUEST_SIDE } from '../data/constants';
import { TODAY, dayDiff, num, sum } from '../utils/format';
import * as actions from '../data/actions';
import { openGuestForm, openGuestDrawer } from '../modals/GuestModal';
import { openGroupsModal, openImportModal } from '../modals/GroupsModal';

const GETTERS = (ev) => ({
  name: g => fullName(g).toLowerCase(), gender: g => g.gender, group: g => grp(ev, g.group).name,
  rsvp: g => ['confirmed', 'pending', 'declined'].indexOf(g.rsvp), att: g => g.att, plus: g => +g.companions,
  at: g => g.at || new Date(0), family: g => g.family || 'zzz',
});
function sortBy(rows, getters, key, dir) { const get = getters[key] || (x => x[key]); return rows.slice().sort((a, b) => { const va = get(a), vb = get(b); return (va > vb ? 1 : va < vb ? -1 : 0) * dir; }); }
function guestRows(ev, f) {
  const q = f.q.trim().toLowerCase(), qd = q.replace(/[\s+]/g, '');
  return ev.guests.filter(g => (f.rsvp === 'all' || g.rsvp === f.rsvp) && (f.gender === 'all' || g.gender === f.gender) && (f.group === 'all' || g.group === f.group) && (f.att === 'all' || g.att === f.att) && (f.channel === 'all' || g.channel === f.channel) && (f.side === 'all' || g.side === f.side) &&
    (!q || `${fullName(g)} ${g.family} ${g.notes}`.toLowerCase().includes(q) || (qd.length > 2 && /^\d+$/.test(qd) && g.phone.replace(/[\s+]/g, '').includes(qd))));
}
const csv = rows => rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
const guestCsv = (ev, list) => csv([['Անուն', 'Ազգանուն', 'Սեռ', 'Խումբ', 'Ընտանիք', 'Հեռախոս', 'Email', 'Ալիք', 'RSVP', 'Ներկայություն', 'Հրավերի կարգավիճակ', 'Ուղեկցողներ', 'Նշումներ'], ...list.map(g => [g.first, g.last, GENDER[g.gender], grp(ev, g.group).name, g.family, g.phone, g.email, CHANNELS[g.channel].l, RSVP[g.rsvp].l, ATT[g.att].l, INVITE_ST[g.inviteStatus].l, g.companions, g.notes])]);
function copyText(dash, text, msg) { navigator.clipboard?.writeText(text).then(() => dash.toast(msg)); }

export default function Guests() {
  const dash = useDashboard();
  const ev = dash.ctx();
  const f = dash.ui.g;
  const s = stats(ev);
  const d = dayDiff(ev.date, TODAY);
  const base = guestRows(ev, f);
  const allForTabs = guestRows(ev, { ...f, rsvp: 'all' });
  const tabCount = st => allForTabs.filter(g => st === 'all' || g.rsvp === st).length;
  const rows = sortBy(base, GETTERS(ev), f.sort, f.dir);
  const filtered = f.gender !== 'all' || f.group !== 'all' || f.att !== 'all' || f.channel !== 'all' || f.side !== 'all' || f.q;

  const guestMenu = (anchorEl, g) => {
    const past = d <= 0;
    dash.openMenu(anchorEl, (
      <>
        <div className="mh">{fullName(g)}</div>
        <MenuItem label="Մանրամասներ" icon="eye" onClick={() => { dash.closeMenu(); openGuestDrawer(dash, ev, g.id); }} />
        <MenuItem label="Խմբագրել" icon="edit" onClick={() => { dash.closeMenu(); openGuestForm(dash, ev, g.id); }} />
        <hr />
        {Object.entries(RSVP).map(([k, v]) => <MenuItem key={k} label={v.l} active={g.rsvp === k} onClick={() => { actions.setRsvp(ev, g, k); dash.closeMenu(); dash.bump(); dash.toast(`${fullName(g)} · ${v.l}`); }} />)}
        {past && g.rsvp === 'confirmed' && <><hr />{Object.entries(ATT).map(([k, v]) => <MenuItem key={k} label={v.l} active={g.att === k} onClick={() => { g.att = k; dash.closeMenu(); dash.bump(); dash.toast(`${fullName(g)} · ${v.l}`); }} />)}</>}
        <hr />
        {g.phone && <MenuItem label="Պատճենել հեռախոսը" icon="copy" onClick={() => { dash.closeMenu(); copyText(dash, g.phone, 'Պատճենվեց'); }} />}
        {g.rsvp === 'pending' && ev.inv.status === 'published' && <MenuItem label="Ուղարկել հիշեցում" icon="send" onClick={() => { actions.remindGuest(g); dash.closeMenu(); dash.bump(); dash.toast(`Հիշեցում ուղարկվեց՝ ${fullName(g)}`); }} />}
        <MenuItem label="Ջնջել" icon="trash" danger onClick={() => { dash.closeMenu(); del([g.id], fullName(g)); }} />
      </>
    ));
  };
  const del = (ids, label) => dash.confirm(ids.length > 1 ? `Ջնջե՞լ ${ids.length} հյուրի` : 'Ջնջե՞լ հյուրին', `${label} կհեռացվի${ids.length > 1 ? 'ն' : ''} հյուրերի ցուցակից և RSVP վիճակագրությունից։`, 'Ջնջել', () => {
    const removed = actions.deleteGuests(ev, ids); ids.forEach(i => f.sel.delete(i)); dash.bump();
    dash.toast(ids.length > 1 ? `${ids.length} հյուր ջնջվեց` : 'Հյուրը ջնջվեց', () => { actions.undoDeleteGuests(ev, removed); dash.bump(); dash.toast('Վերականգնվեց'); });
  });
  const checkin = (g) => { actions.checkin(ev, g.id); dash.bump(); dash.toast(`${fullName(g)} · ժամանեց`, () => { actions.undoCheckin(g); dash.bump(); }); };
  const clearFilters = () => dash.patchUi('g', { q: '', gender: 'all', group: 'all', att: 'all', channel: 'all', side: 'all', rsvp: 'all', page: 1 });

  return (
    <>
      <div className="toolbar">
        <SearchField value={f.q} onChange={v => dash.setPath('g.q', v)} placeholder="Որոնել անունով, ընտանիքով, հեռախոսով…" />
        <div className="spacer" />
        <button className="btn" onClick={() => openGroupsModal(dash, ev)}><Icon name="layers" /> Խմբեր</button>
        <button className="btn" onClick={() => openImportModal(dash, ev)}><Icon name="import" /> Ներմուծել</button>
        <button className="btn" onClick={() => copyText(dash, guestCsv(ev, rows), `${rows.length} հյուր պատճենվեց CSV ձևաչափով`)}><Icon name="copy" /> CSV</button>
        <button className="btn primary" onClick={() => openGuestForm(dash, ev, null)}><Icon name="plus" /> Ավելացնել հյուր</button>
      </div>

      <div className="kpis k6">
        <Kpi label="Հյուրեր" value={num(s.people)} detail={`${s.records} հրավեր · ${sum(ev.guests, g => +g.companions)} ուղեկցող`} />
        <Kpi label="Կգան" value={num(s.confirmed)} detail={`${s.cR} հրավեր`} onClick={() => dash.setPath('g.rsvp', 'confirmed')} tone="sage" icon="check" />
        <Kpi label="Չեն գա" value={num(s.declined)} detail={`${s.dR} հրավեր`} onClick={() => dash.setPath('g.rsvp', 'declined')} tone="rose" icon="close" />
        <Kpi label="Չեն պատասխանել" value={num(s.pending)} detail={`${s.pR} հրավեր`} onClick={() => dash.setPath('g.rsvp', 'pending')} tone="terracotta" icon="clock" />
        <Kpi label="Տղամարդիկ" value={s.m} detail={`${s.records ? Math.round(s.m / s.records * 100) : 0}%`} onClick={() => dash.setPath('g.gender', 'm')} />
        <Kpi label="Կանայք" value={s.f} detail={`${s.records ? Math.round(s.f / s.records * 100) : 0}% · ${s.n} նշված չէ`} onClick={() => dash.setPath('g.gender', 'f')} />
      </div>

      <Tabs value={f.rsvp} onChange={v => dash.setPath('g.rsvp', v)} items={[['all', 'Բոլորը', tabCount('all')], ['confirmed', 'Կգան', tabCount('confirmed')], ['declined', 'Չեն գա', tabCount('declined')], ['pending', 'Չեն պատասխանել', tabCount('pending')]]} />

      <div className="filters">
        <SelectField value={f.gender} onChange={v => dash.setPath('g.gender', v)} options={[['all', 'Բոլոր սեռերը'], ...Object.entries(GENDER)]} ariaLabel="Սեռ" />
        <SelectField value={f.group} onChange={v => dash.setPath('g.group', v)} options={[['all', 'Բոլոր խմբերը'], ...ev.groups.map(g => [g.id, `${g.name} (${ev.guests.filter(x => x.group === g.id).length})`])]} ariaLabel="Խումբ" />
        {d <= 0 && <SelectField value={f.att} onChange={v => dash.setPath('g.att', v)} options={[['all', 'Ներկայություն՝ բոլորը'], ...Object.entries(ATT).map(([k, v]) => [k, v.l])]} ariaLabel="Ներկայություն" />}
        <SelectField value={f.channel} onChange={v => dash.setPath('g.channel', v)} options={[['all', 'Բոլոր ալիքները'], ...Object.entries(CHANNELS).map(([k, v]) => [k, v.l])]} ariaLabel="Ալիք" />
        {ev.type === 'wedding' && <SelectField value={f.side} onChange={v => dash.setPath('g.side', v)} options={[['all', 'Բոլոր կողմերը'], ...Object.entries(GUEST_SIDE)]} ariaLabel="Կողմ" />}
        {filtered && <button className="link" onClick={clearFilters}>Մաքրել ֆիլտրերը</button>}
        <span className="spacer" />
        {f.view === 'grouped' && <Seg value={f.by} onChange={v => dash.setPath('g.by', v)} items={[['group', 'Խմբեր'], ['family', 'Ընտանիքներ'], ['gender', 'Սեռ'], ['rsvp', 'RSVP']]} />}
        <Seg value={f.view} onChange={v => dash.setPath('g.view', v)} items={[['table', <>{<Icon name="table" />} Աղյուսակ</>], ['grouped', <>{<Icon name="layers" />} Խմբավորված</>]]} />
      </div>
      <div className="small muted" style={{ margin: '-4px 0 10px' }}>{rows.length} հրավեր · {num(sum(rows, ppl))} մարդ{(filtered || f.rsvp !== 'all') ? ' (ֆիլտրված)' : ''}</div>

      {!ev.guests.length ? (
        <div className="panel"><EmptyState title="Հյուրերի ցուցակը դատարկ է" sub="Սկսեք առաջին հյուրից կամ ներմուծեք ամբողջ ցուցակը մեկ քայլով">
          <button className="btn" onClick={() => openImportModal(dash, ev)}><Icon name="import" /> Ներմուծել ցուցակ</button>{' '}
          <button className="btn primary" onClick={() => openGuestForm(dash, ev, null)}><Icon name="plus" /> Ավելացնել հյուր</button>
        </EmptyState></div>
      ) : f.view === 'table' ? (
        <GuestTable dash={dash} ev={ev} rows={rows} d={d} onOpenMenu={guestMenu} onCheckin={checkin} />
      ) : (
        <GuestGrouped dash={dash} ev={ev} rows={rows} onOpenMenu={guestMenu} />
      )}
    </>
  );
}

function Th({ dash, ns, field, label, cls = '' }) {
  const st = dash.ui[ns], on = st.sort === field;
  return (
    <th className={`${cls} ${on ? 'sorted' : ''}`} onClick={() => { if (st.sort === field) st.dir *= -1; else { st.sort = field; st.dir = ['plus', 'at'].includes(field) ? -1 : 1; } dash.bump(); }}>
      {label}<span className="arr">{on ? (st.dir > 0 ? '▲' : '▼') : '▲▼'}</span>
    </th>
  );
}

function GuestTable({ dash, ev, rows, d, onOpenMenu, onCheckin }) {
  const f = dash.ui.g, per = f.per, pages = Math.max(1, Math.ceil(rows.length / per));
  if (f.page > pages) f.page = pages;
  const view = rows.slice((f.page - 1) * per, f.page * per);
  const allSel = view.length > 0 && view.every(g => f.sel.has(g.id));

  const attCell = g => d === 0 && g.rsvp === 'confirmed' && g.att !== 'arrived'
    ? <button className="checkin" onClick={() => onCheckin(g)}>Ժամանեց</button>
    : d <= 0 && g.rsvp === 'confirmed' ? <Badge map={ATT} value={g.att} /> : <span className="muted">—</span>;

  return (
    <div className="panel">
      {allSel && rows.length > view.length && f.sel.size < rows.length && (
        <div className="sel-note">Ընտրված է էջի {view.length} հյուրը․ <button className="link" onClick={() => { rows.forEach(g => f.sel.add(g.id)); dash.bump(); }}>ընտրել բոլոր {rows.length}-ը</button></div>
      )}
      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th className="cb"><input type="checkbox" className="cbx" checked={allSel} onChange={e => { view.forEach(g => e.target.checked ? f.sel.add(g.id) : f.sel.delete(g.id)); dash.bump(); }} aria-label="Ընտրել էջը" /></th>
              <Th dash={dash} ns="g" field="name" label="Հյուր" />
              <Th dash={dash} ns="g" field="gender" label="Սեռ" cls="c-sm" />
              <Th dash={dash} ns="g" field="group" label="Խումբ" cls="c-sm" />
              {ev.type === 'wedding' && <Th dash={dash} ns="g" field="side" label="Կողմ" cls="c-sm" />}
              <th className="c-sm">Հեռախոս</th>
              <th className="c-sm">Հրավեր</th>
              <Th dash={dash} ns="g" field="rsvp" label="RSVP" />
              {d <= 0 && <Th dash={dash} ns="g" field="att" label="Ներկայություն" cls="c-sm" />}
              <Th dash={dash} ns="g" field="plus" label="Ուղեկց." cls="num c-sm" />
              <th className="c-sm c-wide">Նշում</th>
              <th className="act" />
            </tr>
          </thead>
          <tbody>
            {view.map(g => { const gr = grp(ev, g.group); return (
              <tr key={g.id} className={f.sel.has(g.id) ? 'sel' : ''} onClick={() => openGuestDrawer(dash, ev, g.id)}>
                <td className="cb" onClick={e => e.stopPropagation()}><input type="checkbox" className="cbx" checked={f.sel.has(g.id)} onChange={e => { e.target.checked ? f.sel.add(g.id) : f.sel.delete(g.id); dash.bump(); }} aria-label="Ընտրել" /></td>
                <td><div className="cell-2"><span className="strong">{fullName(g)}</span><small>{g.family || <span style={{ opacity: .6 }}>Անհատական հրավեր</span>}</small></div></td>
                <td className="c-sm muted">{GENDER[g.gender]}</td>
                <td className="c-sm"><span className="gdot" style={{ background: gr.color }} />{gr.name}</td>
                {ev.type === 'wedding' && <td className="c-sm muted">{g.side ? GUEST_SIDE[g.side] : '—'}</td>}
                <td className="c-sm nowrap">{g.phone || <span className="muted">—</span>}</td>
                <td className="c-sm"><span className="badge" title={CHANNELS[g.channel].l}><Icon name={CHANNELS[g.channel].icon} size={13} /></span> <span className={`badge ${INVITE_ST[g.inviteStatus].c}`}><i /></span></td>
                <td><Badge map={RSVP} value={g.rsvp} /></td>
                {d <= 0 && <td className="c-sm">{attCell(g)}</td>}
                <td className="num c-sm">{+g.companions ? '+' + g.companions : <span className="muted">—</span>}</td>
                <td className="c-sm c-wide note-cell">{g.notes}</td>
                <td className="act" onClick={e => e.stopPropagation()}><button className="icon-btn sm bare" onClick={e => onOpenMenu(e.currentTarget, g)} aria-label="Գործողություններ"><Icon name="more" /></button></td>
              </tr>
            ); })}
          </tbody>
        </table>
        {!rows.length && <EmptyState title="Հյուրեր չեն գտնվել" sub="Փոխեք որոնումը կամ ֆիլտրերը"><button className="btn sm" onClick={() => dash.patchUi('g', { q: '', gender: 'all', group: 'all', att: 'all', rsvp: 'all' })}>Մաքրել ֆիլտրերը</button></EmptyState>}
      </div>
      <div className="pager">
        <span>{rows.length ? `${(f.page - 1) * per + 1}–${Math.min(f.page * per, rows.length)} / ${rows.length}` : '0'}</span>
        <span style={{ marginLeft: 14 }}>Ցույց տալ</span>
        <SelectField value={f.per} onChange={v => dash.setPath('g.per', v)} options={[[25, '25'], [50, '50'], [100, '100'], [500, 'Բոլորը']]} ariaLabel="Էջում" />
        <div className="spacer" />
        <button className="icon-btn sm" disabled={f.page <= 1} onClick={() => { f.page -= 1; dash.bump(); }} aria-label="Նախորդ"><Icon name="chevL" /></button>
        <span>{f.page} / {pages}</span>
        <button className="icon-btn sm" disabled={f.page >= pages} onClick={() => { f.page += 1; dash.bump(); }} aria-label="Հաջորդ"><Icon name="chevR" /></button>
      </div>
    </div>
  );
}

const GENDER_PL = { m: 'Տղամարդիկ', f: 'Կանայք', n: 'Սեռը նշված չէ' };
const RSVP_PL = { confirmed: 'Կգան', declined: 'Չեն գա', pending: 'Չեն պատասխանել' };

function GuestGrouped({ dash, ev, rows, onOpenMenu }) {
  const f = dash.ui.g, by = f.by;
  let secs;
  if (by === 'group') secs = ev.groups.map(g => ({ key: g.id, title: g.name, color: g.color, items: rows.filter(x => x.group === g.id), add: g.id }));
  else if (by === 'gender') secs = Object.keys(GENDER).map(k => ({ key: k, title: GENDER_PL[k], items: rows.filter(x => x.gender === k) }));
  else if (by === 'rsvp') secs = ['confirmed', 'pending', 'declined'].map(k => ({ key: k, title: RSVP_PL[k], items: rows.filter(x => x.rsvp === k) }));
  else {
    const m = new Map();
    rows.forEach(g => { const k = g.family || ''; if (!m.has(k)) m.set(k, []); m.get(k).push(g); });
    secs = [...m.entries()].filter(([k]) => k).sort((a, b) => b[1].length - a[1].length).map(([k, items]) => ({ key: k, title: k, items, sub: grp(ev, items[0].group).name }));
    if (m.get('')) secs.push({ key: '__none', title: 'Անհատական հրավերներ', items: m.get('') });
  }
  secs = secs.filter(x => x.items.length || x.add);
  const defOpen = by !== 'family';

  return (
    <>
      {by === 'family' && (
        <div style={{ margin: '-2px 0 10px', display: 'flex', gap: 14 }}>
          <button className="link" onClick={() => { const next = {}; new Set(ev.guests.map(g => g.family || '__none')).forEach(k => next[`family:${k || '__none'}`] = true); Object.assign(f.open, next); dash.bump(); }}>Բացել բոլորը</button>
          <button className="link" onClick={() => { const next = {}; new Set(ev.guests.map(g => g.family || '__none')).forEach(k => next[`family:${k || '__none'}`] = false); Object.assign(f.open, next); dash.bump(); }}>Փակել բոլորը</button>
        </div>
      )}
      {secs.length === 0 && <EmptyState title="Հյուրեր չեն գտնվել" />}
      {secs.map(sec => {
        const k = `${by}:${sec.key}`, open = f.open[k] ?? defOpen, ss = stats(ev, sec.items);
        return (
          <div className={`gsec ${open ? 'open' : ''}`} key={k}>
            <div className="gsec-h" onClick={() => { f.open[k] = !open; dash.bump(); }}>
              <span className="chev"><Icon name="chevSm" /></span>
              {sec.color && <span className="gdot" style={{ background: sec.color, margin: 0 }} />}
              <div><h4>{sec.title}</h4><div className="gs-meta">{sec.items.length} հրավեր · {ss.people} մարդ · {ss.confirmed} կգա{sec.sub ? ' · ' + sec.sub : ''}</div></div>
              <div className="spacer" />
              <RsvpBar stats={ss} />
              {sec.add && <button className="btn sm ghost" onClick={e => { e.stopPropagation(); openGuestForm(dash, ev, null, sec.add); }}><Icon name="plus" /><span className="c-sm">Ավելացնել</span></button>}
            </div>
            <div className="gsec-b">
              {sec.items.map(g => (
                <div className="gl" key={g.id} onClick={() => openGuestDrawer(dash, ev, g.id)}>
                  <div className="cell-2"><span className="strong">{fullName(g)}</span><small>{by === 'family' ? GENDER[g.gender] : (g.family || grp(ev, g.group).name)}{ev.type === 'wedding' && g.side ? ` · ${GUEST_SIDE[g.side]}` : ''}</small></div>
                  <span className="c-sm muted">{by === 'group' ? GENDER[g.gender] : grp(ev, g.group).name}</span>
                  <span><Badge map={RSVP} value={g.rsvp} /></span>
                  <span className="c-sm muted">{+g.companions ? '+' + g.companions : ''}</span>
                  <span className="c-sm muted nowrap">{g.phone}</span>
                  <button className="icon-btn sm bare" onClick={e => { e.stopPropagation(); onOpenMenu(e.currentTarget, g); }} aria-label="Գործողություններ"><Icon name="more" /></button>
                </div>
              ))}
              {!sec.items.length && <div className="empty" style={{ padding: 22 }}>Այս խմբում հյուրեր չկան</div>}
            </div>
          </div>
        );
      })}
    </>
  );
}
