import { useState } from 'react';
import { ModalHeader } from '../components/Overlays';
import EventTypePicker from '../components/EventTypePicker';
import { TimeField } from '../components/Controls';
import * as actions from '../data/actions';
import { EV } from '../data/selectors';
import { toISO, addDays } from '../utils/format';

function EventBody({ dash, srcId }) {
  const src = srcId ? EV(srcId) : null;
  const [title, setTitle] = useState(src ? src.title + ' 2027' : '');
  const [type, setType] = useState(src?.type || null);
  const [client, setClient] = useState(src?.client || '');
  const [date, setDate] = useState(toISO(src ? new Date(src.date.getFullYear() + 1, src.date.getMonth(), src.date.getDate()) : addDays(new Date(), 60)));
  const [time, setTime] = useState(src?.time || '18:00');
  const [venue, setVenue] = useState(src?.locations[0]?.name || '');
  const [description, setDescription] = useState(src?.description || '');
  const [err, setErr] = useState('');

  const save = () => {
    const res = actions.createEvent({ title, type, client, date, time, venue, description }, src);
    if (res.error) { setErr(res.error); return; }
    dash.closeModal();
    dash.toast(src ? `Կրկնօրինակվեց · ${res.event.guests.length} հյուր` : 'Միջոցառումը ստեղծվեց');
    dash.setOrgEvent(res.event.id);
    dash.go('event');
    dash.bump();
  };

  return (
    <>
      <ModalHeader title={src ? 'Կրկնօրինակել միջոցառումը' : 'Նոր միջոցառում'}
        sub={src ? 'Կպատճենվեն խմբերը, հյուրերի ցուցակը, վայրերը և ծրագիրը։ RSVP պատասխանները կզրոյացվեն։' : 'Միջոցառումը կստեղծվի սևագիր հրավիրատոմսով և դատարկ հյուրերի ցուցակով'} />
      <div className="m-b">
        <div className="form">
          <label className="full">Միջոցառման տեսակ *<EventTypePicker value={type} onChange={setType} compact /></label>
          <label className="full">Անվանում *<input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Օրինակ՝ Սոնա & Գոռ կամ Ընկերության 10-ամյակ" /></label>
          <label>Պատվիրատու<input className="input" value={client} onChange={e => setClient(e.target.value)} placeholder="Ընկերություն կամ ընտանիք" /></label>
          <label>Ամսաթիվ *<input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label>Ժամ<TimeField value={time} onChange={setTime} /></label>
          <label className="full">Վայր<input className="input" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Օրինակ՝ Կասկադ թերաս, Երևան" /></label>
          <label className="full">Նկարագրություն<textarea className="input" style={{ minHeight: 64 }} value={description} onChange={e => setDescription(e.target.value)} /></label>
          <div className="err full">{err}</div>
        </div>
      </div>
      <div className="m-f">
        <button className="btn ghost" onClick={dash.closeModal}>Չեղարկել</button>
        <button className="btn primary" onClick={save} disabled={!type}>{src ? 'Կրկնօրինակել' : 'Ստեղծել'}</button>
      </div>
    </>
  );
}

export function openEventModal(dash, srcId) { dash.openModal(<EventBody dash={dash} srcId={srcId} />); }
