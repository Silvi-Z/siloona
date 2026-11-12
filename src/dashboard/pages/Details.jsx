import { useState } from 'react';
import Icon from '../utils/icons';
import EmptyState from '../components/EmptyState';
import EventTypePicker from '../components/EventTypePicker';
import { TimeField } from '../components/Controls';
import { useDashboard } from '../state/DashboardContext';
import { identityKind } from '../data/selectors';
import { TYPES } from '../data/constants';
import { fmtDay, untilLabel, toISO } from '../utils/format';
import * as actions from '../data/actions';
import { openLocationModal, openScheduleModal } from '../modals/DetailsModals';

const Row = ({ l, s, children }) => (
  <div className="set-row"><div className="rl">{l}{s && <small>{s}</small>}</div><div>{children}</div></div>
);

const NEXT_SWATCH = ['#B0843F', '#6B8A72', '#7A8293', '#C99A9A', '#8E6F86', '#5F7F87'];
function ColorPicker({ colors, onChange }) {
  const set = (i, v) => onChange(colors.map((c, k) => k === i ? v : c));
  const add = () => onChange([...colors, NEXT_SWATCH[colors.length % NEXT_SWATCH.length]]);
  const remove = (i) => onChange(colors.filter((_, k) => k !== i));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {colors.map((c, i) => (
        <div key={i} style={{ position: 'relative', width: 34, height: 34 }}>
          <input type="color" value={c} onChange={e => set(i, e.target.value)}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--line-2)', padding: 0, cursor: 'pointer', overflow: 'hidden' }}
            aria-label={`Գույն ${i + 1}`} />
          {colors.length > 1 && (
            <button type="button" onClick={() => remove(i)} aria-label="Հեռացնել գույնը"
              style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--line-2)', background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 10, lineHeight: 1, display: 'grid', placeItems: 'center', padding: 0 }}>×</button>
          )}
        </div>
      ))}
      {colors.length < 6 && (
        <button type="button" className="icon-btn sm" onClick={add} aria-label="Ավելացնել գույն"><Icon name="plus" /></button>
      )}
    </div>
  );
}

export default function Details() {
  const dash = useDashboard();
  const ev = dash.ctx();
  const couple = dash.mode === 'couple';
  const kind = identityKind(ev);
  const t = TYPES[ev.type];

  const [title, setTitle] = useState(ev.title);
  const [client, setClient] = useState(ev.client || '');
  const [description, setDescription] = useState(ev.description || '');
  const [p1First, setP1First] = useState(ev.person1?.first || '');
  const [p1Last, setP1Last] = useState(ev.person1?.last || '');
  const [p2First, setP2First] = useState(ev.person2?.first || '');
  const [p2Last, setP2Last] = useState(ev.person2?.last || '');
  const [childFirst, setChildFirst] = useState(ev.child?.first || '');
  const [childLast, setChildLast] = useState(ev.child?.last || '');
  const [motherName, setMotherName] = useState(ev.parents?.mother || '');
  const [fatherName, setFatherName] = useState(ev.parents?.father || '');
  const [celebrantFirst, setCelebrantFirst] = useState(ev.celebrant?.first || '');
  const [celebrantLast, setCelebrantLast] = useState(ev.celebrant?.last || '');
  const [celebrantAge, setCelebrantAge] = useState(ev.celebrant?.age || '');
  const [company, setCompany] = useState(ev.company || '');
  const [date, setDate] = useState(toISO(ev.date));
  const [time, setTime] = useState(ev.time);
  const [dress, setDress] = useState(ev.info.dress);
  const [dressColors, setDressColors] = useState(ev.info.dressColors || ['#6B1D2C']);
  const [kids, setKids] = useState(ev.info.kids);
  const [parking, setParking] = useState(ev.info.parking);
  const [maxPlus, setMaxPlus] = useState(ev.info.maxPlus);
  const [extra, setExtra] = useState(ev.info.extra);
  const [oName, setOName] = useState(ev.organizer?.name || '');
  const [oCompany, setOCompany] = useState(ev.organizer?.company || '');
  const [oPhone, setOPhone] = useState(ev.organizer?.phone || '');
  const [oEmail, setOEmail] = useState(ev.organizer?.email || '');
  const [changingType, setChangingType] = useState(false);

  const save = () => {
    const form = {
      title, client, description, date, time, dress, dressColors, kids, parking, maxPlus, extra, oName, oCompany, oPhone, oEmail,
      p1First, p1Last, p2First, p2Last, childFirst, childLast, motherName, fatherName, celebrantFirst, celebrantLast, celebrantAge, company,
    };
    const res = actions.saveDetails(ev, couple ? 'couple' : 'org', form);
    if (res.error) { dash.toast(res.error); return; }
    dash.bump(); dash.toast('Մանրամասները պահպանվեցին');
  };
  const cancel = () => dash.go('details');
  const changeType = (type) => { actions.setEventType(ev, type); setChangingType(false); dash.bump(); };

  return (
    <div className="set det-layout">
      <form onSubmit={e => e.preventDefault()}>
        <section className="set-sec">
          <h3>Միջոցառման տեսակ</h3>
          <p>Որոշում է, թե որ դաշտերն ու գործիքներն են տեսանելի վահանակում։</p>
          {changingType ? (
            <>
              <EventTypePicker value={ev.type} onChange={changeType} compact />
              <button type="button" className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setChangingType(false)}>Չեղարկել</button>
            </>
          ) : (
            <div className="ty-type-row">
              <span className={`ty-badge ${t.cls}`}><span className="ty-ic"><Icon name={t.icon} size={14} /></span>{t.l}</span>
              <button type="button" className="btn ghost sm" onClick={() => setChangingType(true)}>Փոխել</button>
            </div>
          )}
        </section>

        {!couple && (
          <section className="set-sec">
            <h3>Միջոցառում</h3><p>Հիմնական տվյալներ, որոնք երևում են հրավիրատոմսում։</p>
            <Row l="Պատվիրատու" s="Ընկերություն կամ ընտանիք"><input className="input" value={client} onChange={e => setClient(e.target.value)} /></Row>
            <Row l="Նկարագրություն"><textarea className="input" value={description} onChange={e => setDescription(e.target.value)} /></Row>
          </section>
        )}

        <section className="set-sec">
          <h3>{t.l}</h3>
          <p>Անունները կերևան հրավիրատոմսում։</p>
          {kind === 'pair' && (
            <>
              <Row l={t.pairLabels[0]}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><input className="input" value={p1First} onChange={e => setP1First(e.target.value)} placeholder="Անուն" /><input className="input" value={p1Last} onChange={e => setP1Last(e.target.value)} placeholder="Ազգանուն" /></div></Row>
              <Row l={t.pairLabels[1]}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><input className="input" value={p2First} onChange={e => setP2First(e.target.value)} placeholder="Անուն" /><input className="input" value={p2Last} onChange={e => setP2Last(e.target.value)} placeholder="Ազգանուն" /></div></Row>
            </>
          )}
          {kind === 'child-parents' && (
            <>
              <Row l="Երեխայի անունը"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><input className="input" value={childFirst} onChange={e => setChildFirst(e.target.value)} placeholder="Անուն" /><input className="input" value={childLast} onChange={e => setChildLast(e.target.value)} placeholder="Ազգանուն" /></div></Row>
              <Row l="Մայրիկ"><input className="input" value={motherName} onChange={e => setMotherName(e.target.value)} /></Row>
              <Row l="Հայրիկ"><input className="input" value={fatherName} onChange={e => setFatherName(e.target.value)} /></Row>
            </>
          )}
          {kind === 'celebrant' && (
            <>
              <Row l="Անունը"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><input className="input" value={celebrantFirst} onChange={e => setCelebrantFirst(e.target.value)} placeholder="Անուն" /><input className="input" value={celebrantLast} onChange={e => setCelebrantLast(e.target.value)} placeholder="Ազգանուն" /></div></Row>
              <Row l="Տարիքը"><input className="input" type="number" min="0" style={{ maxWidth: 100 }} value={celebrantAge} onChange={e => setCelebrantAge(e.target.value)} /></Row>
            </>
          )}
          {kind === 'child' && (
            <Row l="Երեխայի անունը"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><input className="input" value={childFirst} onChange={e => setChildFirst(e.target.value)} placeholder="Անուն" /><input className="input" value={childLast} onChange={e => setChildLast(e.target.value)} placeholder="Ազգանուն" /></div></Row>
          )}
          {kind === 'company' && (
            <>
              <Row l="Ընկերության անվանումը"><input className="input" value={company} onChange={e => setCompany(e.target.value)} /></Row>
              <Row l="Միջոցառման անվանումը"><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Օրինակ՝ 10-ամյակի երեկույթ" /></Row>
            </>
          )}
          {kind === 'none' && (
            <Row l="Միջոցառման անվանումը"><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></Row>
          )}
        </section>

        <section className="set-sec">
          <h3>Ամսաթիվ և ժամ</h3><p>{fmtDay(ev.date)} · {untilLabel(ev.date)}</p>
          <Row l={couple ? 'Միջոցառման օրը' : 'Ամսաթիվ'}><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></Row>
          <Row l="Սկիզբ"><TimeField value={time} onChange={setTime} /></Row>
        </section>
        <section className="set-sec">
          <h3>Հյուրերի համար</h3><p>Գործնական տեղեկություններ, որոնք կերևան հրավիրատոմսում։</p>
          <Row l="Դրեսս-կոդ"><input className="input" value={dress} onChange={e => setDress(e.target.value)} /></Row>
          <Row l="Դրեսս-կոդի գույներ"><ColorPicker colors={dressColors} onChange={setDressColors} /></Row>
          <Row l="Երեխաներ"><input className="input" value={kids} onChange={e => setKids(e.target.value)} /></Row>
          <Row l="Կայանատեղի / տրանսպորտ"><input className="input" value={parking} onChange={e => setParking(e.target.value)} /></Row>
          <Row l="Ուղեկցողներ" s="Առավելագույնը մեկ հյուրին"><select className="input" value={maxPlus} onChange={e => setMaxPlus(+e.target.value)}>{[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}</select></Row>
          <Row l="Լրացուցիչ"><textarea className="input" value={extra} onChange={e => setExtra(e.target.value)} /></Row>
        </section>
        {!couple && (
          <section className="set-sec">
            <h3>Կազմակերպիչ</h3><p>Հյուրերը կարող են կապ հաստատել այս տվյալներով։</p>
            <Row l="Անուն"><input className="input" value={oName} onChange={e => setOName(e.target.value)} /></Row>
            <Row l="Ընկերություն"><input className="input" value={oCompany} onChange={e => setOCompany(e.target.value)} /></Row>
            <Row l="Հեռախոս"><input className="input" type="tel" value={oPhone} onChange={e => setOPhone(e.target.value)} /></Row>
            <Row l="Email"><input className="input" type="email" value={oEmail} onChange={e => setOEmail(e.target.value)} /></Row>
          </section>
        )}
        <div className="save-bar" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="btn primary" onClick={save}>Պահպանել փոփոխությունները</button>
          <button type="button" className="btn ghost" onClick={cancel}>Չեղարկել</button>
        </div>
      </form>
      <div>
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-h"><h3>Վայրեր</h3><div className="spacer" /><button className="btn sm" onClick={() => openLocationModal(dash, ev, null)}><Icon name="plus" /> Ավելացնել</button></div>
          <div className="panel-b" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {ev.locations.length ? ev.locations.map(l => (
              <div className="loc" key={l.id}>
                <span className="lt">{l.time || '—'}</span>
                <div className="cell-2"><span className="strong">{l.name}</span><small>{l.kind} · {l.address}</small></div>
                <div className="row-edit">
                  <button className="icon-btn sm bare" onClick={() => openLocationModal(dash, ev, l.id)} aria-label="Խմբագրել"><Icon name="edit" /></button>
                  <button className="icon-btn sm bare" onClick={() => dash.confirm('Ջնջե՞լ վայրը', `«${l.name}» վայրը կհեռացվի հրավիրատոմսից։`, 'Ջնջել', () => { actions.deleteLocation(ev, l.id); dash.bump(); dash.toast('Վայրը ջնջվեց'); })} aria-label="Ջնջել"><Icon name="trash" /></button>
                </div>
              </div>
            )) : <EmptyState title="Վայր նշված չէ" />}
          </div>
        </section>
        <section className="panel">
          <div className="panel-h"><h3>{couple ? 'Օրվա ծրագիր' : 'Ծրագիր'}</h3><div className="spacer" /><button className="btn sm" onClick={() => openScheduleModal(dash, ev, null)}><Icon name="plus" /> Ավելացնել</button></div>
          <div className="panel-b">
            {ev.schedule.length ? (
              <ul className="tl">
                {ev.schedule.slice().sort((a, b) => a.time.localeCompare(b.time)).map(x => (
                  <li key={x.id}>
                    <span className="tm">{x.time}</span><span className="nd" />
                    <div className="cell-2"><span>{x.title}</span><small>{x.place}</small></div>
                    <div className="row-edit">
                      <button className="icon-btn sm bare" onClick={() => openScheduleModal(dash, ev, x.id)} aria-label="Խմբագրել"><Icon name="edit" /></button>
                      <button className="icon-btn sm bare" onClick={() => dash.confirm('Ջնջե՞լ կետը', `«${x.title}» (${x.time}) կհեռացվի ծրագրից։`, 'Ջնջել', () => { actions.deleteScheduleItem(ev, x.id); dash.bump(); dash.toast('Կետը ջնջվեց'); })} aria-label="Ջնջել"><Icon name="trash" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="Ծրագիրը դատարկ է" sub="Ավելացրեք օրվա հիմնական պահերը" />}
          </div>
        </section>
      </div>
    </div>
  );
}
