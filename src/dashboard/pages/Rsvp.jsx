import { useState } from 'react';
import Icon from '../utils/icons';
import Kpi from '../components/Kpi';
import RsvpBar from '../components/RsvpBar';
import EmptyState from '../components/EmptyState';
import { Tabs } from '../components/Controls';
import { BarChart } from '../utils/charts';
import { useDashboard } from '../state/DashboardContext';
import { stats, grp, fullName, ppl } from '../data/selectors';
import * as actions from '../data/actions';
import { TODAY, dayDiff, addDays, minD, num, fmtD, fmtDL, relTime, MONTHS_S } from '../utils/format';

const RSVP_PL = { confirmed: 'Կգան', declined: 'Չեն գա', pending: 'Չեն պատասխանել' };

export default function Rsvp() {
  const dash = useDashboard();
  const ev = dash.ctx();
  const s = stats(ev);
  const pub = ev.inv.status === 'published';
  const dl = dayDiff(ev.inv.deadline, TODAY);
  const r = dash.ui.r;
  const [query, setQuery] = useState(r.q);

  const weeks = [];
  if (ev.inv.published) {
    let w = addDays(ev.inv.published, -((ev.inv.published.getDay() + 6) % 7));
    const end = minD(TODAY, ev.date);
    while (w <= end) { weeks.push(w); w = addDays(w, 7); }
  }
  const wv = weeks.map(w => ev.guests.filter(g => g.at && g.at >= w && g.at < addDays(w, 7)).length);
  const byGroup = ev.groups.map(g => ({ g, s: stats(ev, ev.guests.filter(x => x.group === g.id)) })).filter(x => x.s.records);

  const q = r.q.trim().toLowerCase();
  const list = ev.guests.filter(g => g.rsvp === r.tab && (!q || fullName(g).toLowerCase().includes(q))).sort((a, b) => (b.at || 0) - (a.at || 0) || fullName(a).localeCompare(fullName(b), 'hy'));
  const per = 25, pages = Math.max(1, Math.ceil(list.length / per));
  if (r.page > pages) r.page = pages;
  const view = list.slice((r.page - 1) * per, r.page * per);

  const remindAll = () => dash.confirm('Ուղարկե՞լ հիշեցում', `Հիշեցում կուղարկվի ${s.pR} հյուրի, ովքեր դեռ չեն պատասխանել «${ev.title}» հրավերին։`, 'Ուղարկել', () => {
    const n = actions.remindAll(ev); dash.bump(); dash.toast(`Հիշեցումն ուղարկվեց ${n} հյուրի`);
  }, false);
  const copyList = () => {
    const rows = [['Անուն', 'Խումբ', 'Պատասխան']].concat(ev.guests.filter(g => g.rsvp === r.tab).map(g => [fullName(g), grp(ev, g.group).name, RSVP_PL[g.rsvp]]));
    navigator.clipboard?.writeText(rows.map(x => x.join(',')).join('\n')).then(() => dash.toast(`${RSVP_PL[r.tab]} · ցուցակը պատճենվեց`));
  };
  const setQ = v => { setQuery(v); r.q = v; r.page = 1; dash.bump(); };
  const qRsvp = (g, st) => { if (g.rsvp === st) return; actions.setRsvp(ev, g, st); dash.bump(); dash.toast(`${fullName(g)} · ${RSVP_PL[st]}`); };

  return (
    <>
      <div className="toolbar">
        <div className="small muted">
          {pub ? (dl >= 0 ? <>Պատասխանների վերջնաժամկետ՝ <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{fmtDL(ev.inv.deadline)}</b> · {dl} օր</> : `Վերջնաժամկետն անցել է ${fmtD(ev.inv.deadline)}-ին`) : 'Հրավիրատոմսը հրապարակված չէ'}
        </div>
        <div className="spacer" />
        <button className="btn" onClick={copyList}><Icon name="copy" /> Պատճենել ցուցակը</button>
        {dayDiff(ev.date, TODAY) >= 0 && pub && <button className="btn primary" onClick={remindAll}><Icon name="send" /> Հիշեցնել չպատասխանածներին · {s.pR}</button>}
      </div>

      {!pub && (
        <div className="banner">
          <div><b style={{ fontWeight: 500 }}>Հրավիրատոմսը դեռ հրապարակված չէ։</b> RSVP-ն կսկսի աշխատել հրապարակումից հետո։ Մինչ այդ կարող եք պատասխանները նշել ձեռքով։</div>
          <div className="spacer" /><button className="btn sm primary" onClick={() => { actions.publishInvitation(ev); dash.bump(); dash.toast('Հրավիրատոմսը հրապարակվեց · հղումն ակտիվ է'); }}>Հրապարակել</button>
        </div>
      )}

      <div className="kpis k6">
        <Kpi label="Հրավիրված" value={num(s.people)} detail={`${s.records} հրավեր`} />
        <Kpi label="Պատասխաններ" value={s.responded} detail={`${s.records - s.responded} դեռ սպասվում է`} />
        <Kpi label="Կգան" value={num(s.confirmed)} detail={`${s.cR} հրավեր`} onClick={() => dash.patchUi('r', { tab: 'confirmed' })} tone="sage" icon="check" />
        <Kpi label="Չեն գա" value={num(s.declined)} detail={`${s.dR} հրավեր`} onClick={() => dash.patchUi('r', { tab: 'declined' })} tone="rose" icon="close" />
        <Kpi label="Չեն պատասխանել" value={num(s.pending)} detail={`${s.pR} հրավեր`} onClick={() => dash.patchUi('r', { tab: 'pending' })} tone="terracotta" icon="clock" />
        <Kpi label="Պատասխանի տոկոս" value={`${s.rate}%`} detail={<div style={{ marginTop: 6 }}><RsvpBar stats={s} /></div>} />
      </div>

      <div className="grid g-21">
        <section className="panel">
          <div className="panel-h"><h3>Պատասխաններ ըստ շաբաթների</h3><span className="sub">հրապարակումից ի վեր</span></div>
          <div className="panel-b">{weeks.length ? <BarChart labels={weeks.map(w => `${w.getDate()} ${MONTHS_S[w.getMonth()]}`)} values={wv} h={220} fmt={v => `${v} պատասխան`} tipLabels={weeks.map(w => `${fmtD(w)} շաբաթ`)} /> : <EmptyState title="Տվյալներ դեռ չկան" />}</div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Ընդհանուր պատկեր</h3></div>
          <div className="panel-b">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}><span className="serif" style={{ fontSize: 34 }}>{s.rate}%</span><span className="muted">հյուրերը պատասխանել են</span></div>
            <RsvpBar stats={s} lg />
            <div style={{ marginTop: 16 }}>
              {[['confirmed', 'c-conf', s.confirmed, s.cR], ['declined', 'c-dec', s.declined, s.dR], ['pending', 'c-pend', s.pending, s.pR]].map(([k, cl, p, rc]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: '1px solid var(--line)', fontSize: 13, cursor: 'pointer' }} onClick={() => dash.patchUi('r', { tab: k })}>
                  <i className={cl} style={{ width: 9, height: 9, borderRadius: 2, display: 'inline-block' }} /><span style={{ flex: 1 }}>{RSVP_PL[k]}</span><span className="muted small">{rc} հրավեր</span><span className="serif" style={{ width: 50, textAlign: 'right' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid g-21">
        <section className="panel">
          <div className="panel-h"><h3>Ըստ խմբերի</h3></div>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Խումբ</th><th className="num">Հրավիրված</th><th className="num">Կգան</th><th className="num">Չեն գա</th><th className="num">Սպասվող</th><th style={{ width: '30%' }}>Պատասխանի տոկոս</th></tr></thead>
              <tbody>
                {byGroup.map(({ g, s: gs }) => (
                  <tr key={g.id} onClick={() => dash.patchUi('g', { rsvp: 'all', gender: 'all', group: g.id, q: '', att: 'all', page: 1, view: 'table' }) || dash.go('guests')}>
                    <td><span className="gdot" style={{ background: g.color }} />{g.name}</td>
                    <td className="num">{gs.people}</td><td className="num">{gs.confirmed}</td><td className="num">{gs.declined}</td><td className="num">{gs.pending}</td>
                    <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><RsvpBar stats={gs} /><span className="small muted" style={{ width: 34 }}>{gs.rate}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Ըստ սեռի</h3></div>
          <div className="panel-b">
            {['m', 'f', 'n'].map(k => { const gs = stats(ev, ev.guests.filter(x => x.gender === k)); const GL = { m: 'Տղամարդիկ', f: 'Կանայք', n: 'Սեռը նշված չէ' }; return (
              <div key={k} style={{ padding: '10px 0', borderTop: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => dash.patchUi('g', { rsvp: 'all', gender: k, group: 'all', q: '', att: 'all', page: 1, view: 'table' }) || dash.go('guests')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>{GL[k]}</span><span className="muted small">{gs.cR} կգա · {gs.dR} չի գա · {gs.pR} սպասվող</span></div>
                <RsvpBar stats={{ confirmed: gs.cR, declined: gs.dR, pending: gs.pR }} />
              </div>
            ); })}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-h" style={{ paddingBottom: 0, borderBottom: 0 }}>
          <h3>Պատասխանների կառավարում</h3><div className="spacer" />
          <div className="search-field" style={{ marginBottom: 4 }}><Icon name="search" /><input className="input" type="text" value={query} onChange={e => setQ(e.target.value)} placeholder="Որոնել հյուր…" style={{ width: 220 }} /></div>
        </div>
        <div style={{ padding: '0 20px' }}><Tabs value={r.tab} onChange={v => dash.patchUi('r', { tab: v, page: 1 })} items={[['pending', 'Չեն պատասխանել', s.pR], ['confirmed', 'Կգան', s.cR], ['declined', 'Չեն գա', s.dR]]} /></div>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Հյուր</th><th className="c-sm">Խումբ</th><th className="num c-sm">Մարդ</th><th className="c-sm">{r.tab === 'pending' ? 'Հիշեցում' : 'Պատասխան'}</th><th>Կարգավիճակ</th></tr></thead>
            <tbody>
              {view.map(g => (
                <tr key={g.id}>
                  <td><div className="cell-2"><span className="strong">{fullName(g)}</span><small>{g.phone || '—'}</small></div></td>
                  <td className="c-sm"><span className="gdot" style={{ background: grp(ev, g.group).color }} />{grp(ev, g.group).name}</td>
                  <td className="num c-sm">{ppl(g)}</td>
                  <td className="c-sm muted">{r.tab === 'pending' ? (g.reminded ? `ուղարկվել է ${relTime(g.reminded)}` : '—') : relTime(g.at)}</td>
                  <td>
                    <div className="qs">
                      <button className={g.rsvp === 'confirmed' ? 'on c' : ''} onClick={() => qRsvp(g, 'confirmed')}>Կգա</button>
                      <button className={g.rsvp === 'declined' ? 'on d' : ''} onClick={() => qRsvp(g, 'declined')}>Չի գա</button>
                      <button className={g.rsvp === 'pending' ? 'on p' : ''} onClick={() => qRsvp(g, 'pending')}>—</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <EmptyState title={r.tab === 'pending' ? 'Բոլորը պատասխանել են' : 'Այստեղ դեռ ոչ ոք չկա'} />}
        </div>
        {list.length > per && (
          <div className="pager">
            <span>{(r.page - 1) * per + 1}–{Math.min(r.page * per, list.length)} / {list.length}</span>
            <div className="spacer" />
            <button className="icon-btn sm" disabled={r.page <= 1} onClick={() => dash.patchUi('r', { page: r.page - 1 })} aria-label="Նախորդ"><Icon name="chevL" /></button>
            <span>{r.page} / {pages}</span>
            <button className="icon-btn sm" disabled={r.page >= pages} onClick={() => dash.patchUi('r', { page: r.page + 1 })} aria-label="Հաջորդ"><Icon name="chevR" /></button>
          </div>
        )}
      </section>
    </>
  );
}
