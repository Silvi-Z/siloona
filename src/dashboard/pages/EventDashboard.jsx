import Icon from '../utils/icons';
import Kpi from '../components/Kpi';
import RsvpBar from '../components/RsvpBar';
import EmptyState from '../components/EmptyState';
import EventTitle from '../components/EventTitle';
import { DesignThumb } from '../../site/DesignCard';
import { findDesign } from '../../site/designCatalog';
import { linkedOrder } from '../data/orderLinks';
import CountdownClock from '../components/CountdownClock';
import MilestoneRow from '../components/MilestoneRow';
import { Badge } from '../components/Badge';
import { stats, evStatus, grp, fullName, ppl, evDateTime, invUrl } from '../data/selectors';
import { EV_ST, INV_ST, LANGS, GENDER_PL, TYPES } from '../data/constants';
import { TODAY, dayDiff, fmtDay, fmtD, num, pct, relTime, sum } from '../utils/format';
import { useDashboard } from '../state/DashboardContext';
import * as actions from '../data/actions';
import { openGuestForm } from '../modals/GuestModal';
import { openPublicPreview } from '../modals/PublicPreviewModal';
import { openRef } from '../refs';

// The chosen design's own artwork (its catalog picture, or the card itself).
function DesignMini({ design }) {
  if (design.kind === 'card' && design.Art) return <design.Art />;
  if (design.image) return <img src={design.image} alt="" />;
  return <div className="sil-catalog"><DesignThumb design={design} /></div>;
}

export default function EventDashboard({ ev }) {
  const dash = useDashboard();
  const { mode, go } = dash;
  const couple = mode === 'couple';
  const s = stats(ev);
  const st = evStatus(ev);
  const d = dayDiff(ev.date, TODAY);
  const pub = ev.inv.status === 'published';
  // what guests actually get: the paid design once an order is linked
  const live = linkedOrder(ev);
  const design = findDesign((live?.live && live.designId) || ev.inv.design);

  const guestsBy = (filter = {}) => { dash.patchUi('g', { rsvp: filter.rsvp || 'all', gender: filter.gender || 'all', group: filter.group || 'all', q: '', att: 'all', page: 1, view: 'table' }); go('guests'); };
  const copyLink = () => navigator.clipboard?.writeText(`https://${invUrl(ev)}`).then(() => dash.toast('Հղումը պատճենվեց'));
  const publish = () => { const r = actions.publishInvitation(ev); if (r?.error) { dash.toast(r.error); return; } dash.bump(); dash.toast('Հրավիրատոմսը հրապարակվեց · հղումն ակտիվ է'); };
  const remindAll = () => dash.confirm('Ուղարկե՞լ հիշեցում', `Հիշեցում կուղարկվի ${ev.guests.filter(g => g.rsvp === 'pending').length} հյուրի, ովքեր դեռ չեն պատասխանել «${ev.title}» հրավերին։`, 'Ուղարկել', () => {
    const n = actions.remindAll(ev); dash.bump(); dash.toast(`Հիշեցումն ուղարկվեց ${n} հյուրի`);
  }, false);

  const right = d > 0
    ? <div><div className="eyebrow" style={{ marginBottom: 8, textAlign: 'right' }}>Մնաց</div><CountdownClock target={evDateTime(ev)} /></div>
    : d === 0
      ? <div className="today-box"><div className="eyebrow">Այսօր · {ev.time}</div><div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 8px' }}><span className="serif" style={{ fontSize: 26 }}>{s.arrived}</span><span className="muted">/ {s.confirmed} հյուր ժամանել է</span></div><RsvpBar stats={{ confirmed: s.arrived, declined: 0, pending: s.confirmed - s.arrived }} /></div>
      : <div className="muted">Միջոցառումն ավարտվել է {-d} օր առաջ</div>;

  const groupsRows = ev.groups.map(g => {
    const gs = stats(ev, ev.guests.filter(x => x.group === g.id));
    if (!gs.records) return null;
    return (
      <div key={g.id} style={{ padding: '9px 0', borderTop: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => guestsBy({ group: g.id })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, gap: 10 }}>
          <span><span className="gdot" style={{ background: g.color }} />{g.name}</span>
          <span className="muted small nowrap">{gs.confirmed} / {gs.people} կգա</span>
        </div>
        <RsvpBar stats={gs} />
      </div>
    );
  });

  const recent = ev.guests.filter(g => g.at).sort((a, b) => b.at - a.at).slice(0, 7);
  const mss = (ev.milestones || []).filter(x => !x.done && x.date >= TODAY).sort((a, b) => a.date - b.date).slice(0, 4);
  const lastKpi = d <= 0
    ? <Kpi label="Ժամանել են" value={num(s.arrived)} detail={`${pct(s.arrived, s.confirmed)}% հաստատածներից`} onClick={() => guestsBy({ rsvp: 'confirmed' })} tone="sage" icon="check" />
    : <Kpi label="Պատասխանի տոկոս" value={`${s.rate}%`} detail={pub ? `վերջնաժամկետ՝ ${fmtD(ev.inv.deadline)}` : 'հրավերները դեռ ուղարկված չեն'} onClick={() => go('rsvp')} />;

  return (
    <>
      {!couple && st === 'draft' && (
        <div className="banner">
          <div><b style={{ fontWeight: 500 }}>Հրավիրատոմսը դեռ հրապարակված չէ։</b> Հյուրերը չեն կարող տեսնել այն և պատասխանել։</div>
          <div className="spacer" /><button className="btn sm primary" onClick={publish}>Հրապարակել</button>
        </div>
      )}
      <section className="hero">
        <div>
          <div className="eyebrow">{couple ? TYPES[ev.type].l : <>{ev.client ? ev.client + ' · ' : ''}{EV_ST[st].l}</>} {!couple && <Badge map={EV_ST} value={st} />}</div>
          <h2><EventTitle ev={ev} /></h2>
          <div className="hero-meta">
            <span><Icon name="events" /> {fmtDay(ev.date)}</span>
            <span><Icon name="clock" /> {ev.time}</span>
            {ev.locations.map(l => <span key={l.id}><Icon name="details" /> {l.name}{l.time && ev.locations.length > 1 ? `, ${l.time}` : ''}</span>)}
          </div>
        </div>
        {right}
      </section>
      <div className="kpis k5">
        <Kpi label="Հրավիրված հյուրեր" value={num(s.people)} detail={`${s.records} հրավեր · ${s.m} տղ., ${s.f} կին`} onClick={() => guestsBy()} />
        <Kpi label="Կգան" value={num(s.confirmed)} detail={`${pct(s.confirmed, s.people)}% հրավիրվածներից`} onClick={() => guestsBy({ rsvp: 'confirmed' })} tone="sage" icon="check" />
        <Kpi label="Չեն գա" value={num(s.declined)} detail={`${s.dR} պատասխան`} onClick={() => guestsBy({ rsvp: 'declined' })} tone="rose" icon="close" />
        <Kpi label="Չեն պատասխանել" value={num(s.pending)} detail={`${s.pR} հրավեր`} onClick={() => guestsBy({ rsvp: 'pending' })} tone="terracotta" icon="clock" />
        {lastKpi}
      </div>
      <div className="grid g-21">
        <section className="panel">
          <div className="panel-h"><h3>Հյուրերի վիճակագրություն</h3><div className="spacer" /><button className="link" onClick={() => go('guests')}>Հյուրերի ցուցակ</button></div>
          <div className="panel-b">
            {s.records ? (
              <>
                <RsvpBar stats={s} lg />
                <div className="legend" style={{ margin: '12px 0 18px' }}>
                  <span><i className="c-conf" /> Կգան {s.confirmed} · {pct(s.confirmed, s.people)}%</span>
                  <span><i className="c-dec" /> Չեն գա {s.declined}</span>
                  <span><i className="c-pend" /> Չեն պատասխանել {s.pending}</span>
                </div>
                <div className="g-11 grid" style={{ margin: 0, gap: 28 }}>
                  <div><div className="eyebrow" style={{ marginBottom: 4 }}>Ըստ խմբերի</div>{groupsRows}</div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>Ըստ սեռի</div>
                    <div className="stat3">
                      {['m', 'f', 'n'].map(k => { const gs = stats(ev, ev.guests.filter(x => x.gender === k)); return (
                        <div key={k} style={{ cursor: 'pointer' }} onClick={() => guestsBy({ gender: k })}><div className="v">{gs.records}</div><div className="l">{GENDER_PL[k]}</div><div className="small muted" style={{ marginTop: 4 }}>{gs.cR} կգա</div></div>
                      ); })}
                    </div>
                    <div className="eyebrow" style={{ margin: '20px 0 6px' }}>Ընտանիքներ</div>
                    <div className="small muted">{new Set(ev.guests.filter(g => g.family).map(g => g.family)).size} ընտանիք · {ev.guests.filter(g => !g.family).length} անհատական հրավեր · {sum(ev.guests, g => +g.companions)} ուղեկցող</div>
                  </div>
                </div>
              </>
            ) : <EmptyState title="Հյուրերի ցուցակը դատարկ է" sub="Ավելացրեք հյուրերին կամ ներմուծեք ցուցակը"><button className="btn primary" onClick={() => openGuestForm(dash, ev, null)}><Icon name="plus" /> Ավելացնել հյուր</button></EmptyState>}
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Հրավիրատոմս</h3><div className="spacer" /><Badge map={INV_ST} value={ev.inv.status} /></div>
          <div className="panel-b">
            <div className="inv-mini">
              {design
                ? <figure className="inv-fig"><button type="button" className="thumb inv-thumb" onClick={() => openPublicPreview(dash, ev)} aria-label={`Բացել՝ ${design.code}`}><DesignMini design={design} /></button><figcaption>{design.code}</figcaption></figure>
                : <button type="button" className="thumb inv-thumb empty" onClick={() => go('designs')}><Icon name="plus" /><span>Ընտրել դիզայն</span></button>}
              <dl className="kv" style={{ gridTemplateColumns: '112px 1fr', fontSize: 12.5, gap: '8px 12px' }}>
                <dt>Դիտումներ</dt><dd>{num(ev.inv.views)}</dd>
                <dt>Հրապարակվել է</dt><dd>{ev.inv.published && pub ? fmtD(ev.inv.published) : '—'}</dd>
                <dt>Ժամկետ</dt><dd>{fmtD(ev.inv.deadline)}</dd>
                <dt>Լեզուներ</dt><dd>{ev.inv.langs.map(l => LANGS[l]).join(', ')}</dd>
              </dl>
            </div>
            <div className="url" style={{ margin: '18px 0 12px', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 4px 4px 12px', background: 'var(--bg)' }}>
              <span className="mono" style={{ flex: 1 }}>{invUrl(ev)}</span>
              <button className="icon-btn sm bare" onClick={copyLink} aria-label="Պատճենել"><Icon name="copy" /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={() => openPublicPreview(dash, ev)}><Icon name="ext" /> Բացել</button>
              <button className="btn sm" onClick={() => go('invitation')}>Կառավարել</button>
              {!pub && <button className="btn sm primary" onClick={publish}>Հրապարակել</button>}
            </div>
          </div>
        </section>
      </div>
      <div className="grid g-11">
        <section className="panel">
          <div className="panel-h"><h3>Վերջին պատասխանները</h3><div className="spacer" /><button className="link" onClick={() => go('rsvp')}>Բոլորը</button></div>
          {recent.length ? (
            <ul className="feed">
              {recent.map(g => (
                <li key={g.id} style={{ cursor: 'pointer' }} onClick={() => openRef(dash, `guest:${ev.id}:${g.id}`)}>
                  <span className="fd" style={{ background: g.rsvp === 'confirmed' ? 'var(--sage)' : 'var(--rose)' }} />
                  <span><b>{fullName(g)}</b> {g.rsvp === 'confirmed' ? `կգա${ppl(g) > 1 ? ` · ${ppl(g)} հոգի` : ''}` : 'չի կարողանա գալ'}<span className="muted"> · {grp(ev, g.group).name}</span></span>
                  <span className="ft">{relTime(g.at)}</span>
                </li>
              ))}
            </ul>
          ) : <EmptyState title="Պատասխաններ դեռ չկան" sub={pub ? 'Կերևան այստեղ, երբ հյուրերը պատասխանեն' : 'Հրապարակեք հրավիրատոմսը, որ հյուրերը կարողանան պատասխանել'} />}
        </section>
        <section className="panel">
          <div className="panel-h"><h3>Արագ գործողություններ</h3></div>
          <div>
            <button className="qa" onClick={() => openGuestForm(dash, ev, null)}><Icon name="plus" /><span>Ավելացնել հյուր</span><span className="r">{s.records} հրավեր</span></button>
            <button className="qa" onClick={copyLink}><Icon name="copy" /><span>Պատճենել հրավերի հղումը</span><span className="r mono">{invUrl(ev)}</span></button>
            <button className="qa" onClick={() => openPublicPreview(dash, ev)}><Icon name="eye" /><span>Դիտել ինչպես հյուր</span><span className="r"><Icon name="chevSm" /></span></button>
            {d >= 0 && pub && <button className="qa" onClick={remindAll}><Icon name="send" /><span>Հիշեցնել չպատասխանածներին</span><span className="r">{s.pR} հյուր</span></button>}
            {d === 0 && <button className="qa" onClick={() => guestsBy({ rsvp: 'confirmed' })}><Icon name="check" /><span>Հյուրերի ժամանման նշում</span><span className="r">{s.arrived} / {s.confirmed}</span></button>}
            <button className="qa" onClick={() => go('details')}><Icon name="clock" /><span>{couple ? 'Վայրեր և օրվա ծրագիր' : 'Միջոցառման մանրամասներ'}</span><span className="r">{ev.schedule.length} կետ</span></button>
          </div>
          {couple && mss.length > 0 && (
            <>
              <div className="panel-h" style={{ borderTop: '1px solid var(--line)' }}><h3>Առաջիկա քայլեր</h3><div className="spacer" /><button className="link" onClick={() => go('calendar')}>Օրացույց</button></div>
              <div className="panel-b" style={{ paddingTop: 4, paddingBottom: 6 }}>{mss.map(m => <MilestoneRow key={m.id} dash={dash} ev={ev} m={m} />)}</div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
