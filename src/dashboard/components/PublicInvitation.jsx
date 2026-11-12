import { useState } from 'react';
import InvitationArt from './InvitationArt';
import { personalizedGreeting, fullName } from '../data/selectors';
import { fmtDL } from '../utils/format';

export default function PublicInvitation({ ev, guest, compact, onSubmit }) {
  const pub = ev.inv.status === 'published';
  const [att, setAtt] = useState('confirmed');
  const [name, setName] = useState(guest ? fullName(guest) : '');
  const [plus, setPlus] = useState(0);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!name.trim()) { setErr('Գրեք Ձեր անունը։'); return; }
    onSubmit({ name: name.trim(), status: att, plus, note });
  };

  return (
    <>
      {!pub && <div className="pv-banner">Նախադիտում · հրավիրատոմսը դեռ հրապարակված չէ</div>}
      <div className="pv-art"><InvitationArt ev={ev} /></div>
      <div className="pv-sec"><div style={{ lineHeight: 1.7, fontSize: 13 }}>{personalizedGreeting(ev, guest)}</div></div>
      <div className="pv-sec">
        <h5>ՎԱՅՐԵՐ</h5>
        {ev.locations.map(l => (
          <div key={l.id} style={{ marginBottom: 12, fontSize: 13 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{l.name}</div>
            <div style={{ opacity: .7 }}>{l.kind} · {l.time} · {l.address}</div>
          </div>
        ))}
      </div>
      {ev.schedule.length > 0 && (
        <div className="pv-sec">
          <h5>ՕՐՎԱ ԾՐԱԳԻՐ</h5>
          {ev.schedule.map(x => (
            <div key={x.id} style={{ display: 'flex', gap: 14, justifyContent: 'center', fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--serif)', width: 44, textAlign: 'right' }}>{x.time}</span>
              <span style={{ width: 190, textAlign: 'left' }}>{x.title}</span>
            </div>
          ))}
        </div>
      )}
      {ev.inv.rsvp && (
        <div className="pv-sec">
          <h5>RSVP · ՄԻՆՉԵՎ {fmtDL(ev.inv.deadline).toUpperCase()}</h5>
          {compact ? (
            <span className="pi-body"><span className="pb-btn" style={{ background: '#7A2433', color: '#FBF6EE', display: 'inline-block', margin: 0 }}>Պատասխանել</span></span>
          ) : (
            <div className="pv-form">
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ձեր անունը և ազգանունը" autoComplete="off" />
              <div className="seg3">
                <button type="button" className={att === 'confirmed' ? 'on' : ''} onClick={() => setAtt('confirmed')}>Կգամ</button>
                <button type="button" className={att === 'declined' ? 'on' : ''} onClick={() => setAtt('declined')}>Չեմ կարող գալ</button>
              </div>
              {att === 'confirmed' && (
                <label className="fl">Ինձ հետ կլինեն
                  <select className="input" value={plus} onChange={e => setPlus(+e.target.value)}>
                    {Array.from({ length: (+ev.info.maxPlus || 0) + 1 }, (_, i) => <option key={i} value={i}>{i ? `${i} ուղեկցող` : 'Միայն ես'}</option>)}
                  </select>
                </label>
              )}
              <textarea className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ցանկություններ կամ նշում (ըստ ցանկության)" style={{ minHeight: 64 }} />
              <div className="err">{err}</div>
              <button className="btn primary" type="button" onClick={submit} style={{ justifyContent: 'center' }}>Ուղարկել պատասխանը</button>
            </div>
          )}
        </div>
      )}
      <div className="pv-sec" style={{ fontSize: 11, opacity: .55 }}>Ստեղծված է Siloona-ով</div>
    </>
  );
}
