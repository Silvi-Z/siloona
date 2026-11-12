import { useState } from 'react';
import { ModalHeader } from '../components/Overlays';
import { TimeField } from '../components/Controls';
import * as actions from '../data/actions';
import { toISO } from '../utils/format';
import { VENUE_TYPES } from '../data/constants';

const ADD_KIND = '__add';

function LocationBody({ dash, ev, id }) {
  const l = id ? ev.locations.find(x => x.id === id) : { kind: ev.type === 'wedding' ? 'Սրահ' : 'Այլ', name: '', address: '', time: '' };
  const kinds = [...VENUE_TYPES, ...ev.customVenueTypes.filter(k => !VENUE_TYPES.includes(k))];
  const [kind, setKind] = useState(kinds.includes(l.kind) ? l.kind : (l.kind || kinds[0]));
  const [addingKind, setAddingKind] = useState(!kinds.includes(l.kind) && !!l.kind);
  const [newKind, setNewKind] = useState(!kinds.includes(l.kind) ? l.kind : '');
  const [time, setTime] = useState(l.time);
  const [name, setName] = useState(l.name);
  const [address, setAddress] = useState(l.address);
  const [err, setErr] = useState('');
  const pickKind = (v) => { if (v === ADD_KIND) { setAddingKind(true); setNewKind(''); } else { setAddingKind(false); setKind(v); } };
  const save = () => {
    let finalKind = kind;
    if (addingKind) {
      const res = actions.addCustomVenueType(ev, newKind);
      if (res.error) { setErr(res.error); return; }
      finalKind = res.kind;
    }
    const res = actions.saveLocation(ev, id, { kind: finalKind, time, name, address });
    if (res.error) { setErr(res.error); return; }
    dash.closeModal(); dash.bump(); dash.toast('Վայրը պահպանվեց');
  };
  return (
    <>
      <ModalHeader title={id ? 'Խմբագրել վայրը' : 'Նոր վայր'} />
      <div className="m-b">
        <div className="form">
          <label>Տեսակ
            <select className="input" value={addingKind ? ADD_KIND : kind} onChange={e => pickKind(e.target.value)}>
              {kinds.map(k => <option key={k} value={k}>{k}</option>)}
              <option value={ADD_KIND}>+ Ավելացնել</option>
            </select>
          </label>
          {addingKind && <label>Նոր տեսակ<input className="input" value={newKind} onChange={e => setNewKind(e.target.value)} placeholder="Օրինակ՝ Այգի" autoFocus /></label>}
          <label>Ժամ<TimeField value={time} onChange={setTime} /></label>
          <label className="full">Անվանում *<input className="input" value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="full">Հասցե<input className="input" value={address} onChange={e => setAddress(e.target.value)} /></label>
          <div className="err full">{err}</div>
        </div>
      </div>
      <div className="m-f"><button className="btn ghost" onClick={dash.closeModal}>Չեղարկել</button><button className="btn primary" onClick={save}>Պահպանել</button></div>
    </>
  );
}
export function openLocationModal(dash, ev, id) { dash.openModal(<LocationBody dash={dash} ev={ev} id={id} />, 'narrow'); }

function ScheduleBody({ dash, ev, id }) {
  const x = id ? ev.schedule.find(s => s.id === id) : { time: '', title: '', place: '' };
  const [time, setTime] = useState(x.time);
  const [title, setTitle] = useState(x.title);
  const [place, setPlace] = useState(x.place);
  const [err, setErr] = useState('');
  const save = () => {
    const res = actions.saveScheduleItem(ev, id, { time, title, place });
    if (res.error) { setErr(res.error); return; }
    dash.closeModal(); dash.bump(); dash.toast('Ծրագիրը թարմացվեց');
  };
  return (
    <>
      <ModalHeader title={id ? 'Խմբագրել ծրագրի կետը' : 'Նոր կետ ծրագրում'} />
      <div className="m-b">
        <div className="form">
          <label>Ժամ *<TimeField value={time} onChange={setTime} /></label>
          <label>Վայր<input className="input" list="schPlaces" value={place} onChange={e => setPlace(e.target.value)} />
            <datalist id="schPlaces">{ev.locations.map(l => <option key={l.id} value={l.name} />)}</datalist>
          </label>
          <label className="full">Անվանում *<input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Օրինակ՝ Առաջին պար" /></label>
          <div className="err full">{err}</div>
        </div>
      </div>
      <div className="m-f"><button className="btn ghost" onClick={dash.closeModal}>Չեղարկել</button><button className="btn primary" onClick={save}>Պահպանել</button></div>
    </>
  );
}
export function openScheduleModal(dash, ev, id) { dash.openModal(<ScheduleBody dash={dash} ev={ev} id={id} />, 'narrow'); }

function MilestoneBody({ dash, ev, id }) {
  const m = id ? ev.milestones.find(x => x.id === id) : { date: new Date(), title: '', note: '' };
  const [title, setTitle] = useState(m.title);
  const [date, setDate] = useState(toISO(m.date));
  const [note, setNote] = useState(m.note);
  const [err, setErr] = useState('');
  const save = () => {
    const res = actions.saveMilestone(ev, id, { title, date, note });
    if (res.error) { setErr(res.error); return; }
    dash.closeModal(); dash.bump(); dash.toast('Ամսաթիվը պահպանվեց');
  };
  const del = () => { actions.deleteMilestone(ev, id); dash.closeModal(); dash.bump(); dash.toast('Ջնջվեց'); };
  return (
    <>
      <ModalHeader title={id ? 'Խմբագրել ամսաթիվը' : 'Նոր կարևոր ամսաթիվ'} sub="Օրինակ՝ զգեստի փորձ, սրահի հետ հանդիպում" />
      <div className="m-b">
        <div className="form">
          <label className="full">Անվանում *<input className="input" value={title} onChange={e => setTitle(e.target.value)} /></label>
          <label>Ամսաթիվ<input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label>Նշում<input className="input" value={note} onChange={e => setNote(e.target.value)} /></label>
          <div className="err full">{err}</div>
        </div>
      </div>
      <div className="m-f">
        {id && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={del}>Ջնջել</button>}
        <button className="btn ghost" onClick={dash.closeModal}>Չեղարկել</button>
        <button className="btn primary" onClick={save}>Պահպանել</button>
      </div>
    </>
  );
}
export function openMilestoneModal(dash, ev, id) { dash.openModal(<MilestoneBody dash={dash} ev={ev} id={id} />, 'narrow'); }
