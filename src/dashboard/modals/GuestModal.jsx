import { useState } from 'react';
import { ModalHeader } from '../components/Overlays';
import { RSVP, ATT, GENDER, CHANNELS, INVITE_ST, GUEST_SIDE } from '../data/constants';
import { grp, fullName, ppl, guestInviteUrl } from '../data/selectors';
import { relTime, initials, dayDiff } from '../utils/format';
import { TODAY } from '../utils/format';
import * as actions from '../data/actions';
import Icon from '../utils/icons';
import { openPublicPreview } from './PublicPreviewModal';
import { openSendInvites } from './SendInvitesModal';

function GuestFormBody({ dash, ev, guestId, presetGroup, onSaved }) {
  const existing = guestId ? ev.guests.find(g => g.id === guestId) : null;
  const [first, setFirst] = useState(existing?.first || '');
  const [last, setLast] = useState(existing?.last || '');
  const [gender, setGender] = useState(existing?.gender || 'n');
  const [side, setSide] = useState(existing?.side || '');
  const [group, setGroup] = useState(existing?.group || presetGroup || ev.groups[0]?.id || '');
  const [newGroup, setNewGroup] = useState('');
  const [family, setFamily] = useState(existing?.family || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [channel, setChannel] = useState(existing?.channel || 'whatsapp');
  const [companions, setCompanions] = useState(existing?.companions ?? 0);
  const [rsvp, setRsvp] = useState(existing?.rsvp || 'pending');
  const [att, setAtt] = useState(existing?.att || 'unknown');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [err, setErr] = useState('');
  const [addMore, setAddMore] = useState(false);
  const fams = [...new Set(ev.guests.map(x => x.family).filter(Boolean))].sort();
  const attDisabled = dayDiff(ev.date, TODAY) > 0;

  const save = () => {
    const form = { first, last, gender, group, newGroup, family, phone, email, channel, companions, rsvp, att: attDisabled ? undefined : att, notes, side };
    const res = actions.saveGuest(ev, guestId, form);
    if (res.error) { setErr(res.error); return; }
    dash.bump();
    if (guestId) {
      dash.toast('Հյուրի տվյալները պահպանվեցին');
      dash.closeModal();
      openGuestDrawer(dash, ev, guestId);
    } else {
      dash.toast(`${fullName(res.guest)} ավելացվեց ցուցակում`);
      if (addMore) { openGuestForm(dash, ev, null, group); } else dash.closeModal();
    }
    onSaved?.(res.guest);
  };

  return (
    <>
      <ModalHeader title={guestId ? 'Խմբագրել հյուրին' : 'Նոր հյուր'} sub={ev.title} />
      <div className="m-b">
        <div className="form">
          <label>Անուն *<input className="input" value={first} onChange={e => setFirst(e.target.value)} placeholder="Օրինակ՝ Մարիամ" /></label>
          <label>Ազգանուն<input className="input" value={last} onChange={e => setLast(e.target.value)} placeholder="Օրինակ՝ Գրիգորյան" /></label>
          <div className="full fl">Սեռ
            <div className="seg3">
              {Object.entries(GENDER).map(([k, v]) => <button type="button" key={k} className={gender === k ? 'on' : ''} onClick={() => setGender(k)}>{v}</button>)}
            </div>
          </div>
          {ev.type === 'wedding' && (
            <label>Կողմ
              <select className="input" value={side} onChange={e => setSide(e.target.value)}>
                <option value="">Նշված չէ</option>
                {Object.entries(GUEST_SIDE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          )}
          <label>Խումբ
            <select className="input" value={group} onChange={e => setGroup(e.target.value)}>
              {ev.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              <option value="__new">+ Նոր խումբ…</option>
            </select>
          </label>
          <label>Ընտանիք
            <input className="input" list="famList" value={family} onChange={e => setFamily(e.target.value)} placeholder="Օրինակ՝ Գրիգորյանների ընտանիք" />
            <datalist id="famList">{fams.map(f => <option key={f} value={f} />)}</datalist>
          </label>
          {group === '__new' && <label className="full">Նոր խմբի անվանում<input className="input" value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="Օրինակ՝ Համալսարանական ընկերներ" /></label>}
          <label>Հեռախոս<input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+374 99 12 34 56" /></label>
          <label>Email<input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="guest@example.com" /></label>
          <label className="full">Նախընտրելի ալիք հրավերի ուղարկման համար
            <select className="input" value={channel} onChange={e => setChannel(e.target.value)}>
              {Object.entries(CHANNELS).map(([k, v]) => <option key={k} value={k}>{v.l} ({v.contact === 'phone' ? 'հեռախոս' : 'email'})</option>)}
            </select>
          </label>
          <label>Ուղեկցողներ<input className="input" type="number" min="0" max="10" value={companions} onChange={e => setCompanions(e.target.value)} /></label>
          <label>RSVP
            <select className="input" value={rsvp} onChange={e => setRsvp(e.target.value)}>
              {Object.entries(RSVP).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
            </select>
          </label>
          <label>Ներկայություն
            <select className="input" value={att} disabled={attDisabled} onChange={e => setAtt(e.target.value)}>
              {Object.entries(ATT).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
            </select>
          </label>
          <label className="full">Նշումներ<textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Օրինակ՝ բուսակեր, կժամանի ուշ" /></label>
          <div className="err full">{err}</div>
        </div>
      </div>
      <div className="m-f">
        {!guestId && <label className="check" style={{ marginRight: 'auto', fontSize: 12.5 }}><input type="checkbox" checked={addMore} onChange={e => setAddMore(e.target.checked)} /> Ավելացնել ևս մեկը</label>}
        <button className="btn ghost" onClick={dash.closeModal}>Չեղարկել</button>
        <button className="btn primary" onClick={save}>{guestId ? 'Պահպանել' : 'Ավելացնել'}</button>
      </div>
    </>
  );
}

export function openGuestForm(dash, ev, guestId, presetGroup) {
  dash.openModal(<GuestFormBody dash={dash} ev={ev} guestId={guestId} presetGroup={presetGroup} />);
}

function GuestDrawerBody({ dash, ev, guestId }) {
  const g = ev.guests.find(x => x.id === guestId);
  if (!g) return null;
  const d = dayDiff(ev.date, TODAY);
  const gr = grp(ev, g.group);
  const fam = g.family ? ev.guests.filter(x => x.family === g.family && x.id !== g.id) : [];
  const respLine = g.at ? `${g.rsvp === 'confirmed' ? 'Հաստատել է' : 'Մերժել է'} ${relTime(g.at)}` : ev.inv.status === 'published' ? `Պատասխան դեռ չկա${g.reminded ? ` · հիշեցում ուղարկվել է ${relTime(g.reminded)}` : ''}` : 'Հրավերը դեռ ուղարկված չէ';

  const setRsvp = st => { actions.setRsvp(ev, g, st); dash.bump(); dash.toast(`${fullName(g)} · ${RSVP[st].l}`); };
  const setAtt = st => { g.att = st; dash.bump(); dash.toast(`${fullName(g)} · ${ATT[st].l}`); };
  const del = () => dash.confirm('Ջնջե՞լ հյուրին', `${fullName(g)} կհեռացվի հյուրերի ցուցակից և RSVP վիճակագրությունից։`, 'Ջնջել', () => {
    const removed = actions.deleteGuests(ev, [g.id]);
    dash.ui.g.sel.delete(g.id);
    dash.closeDrawer(); dash.bump();
    dash.toast('Հյուրը ջնջվեց', () => { actions.undoDeleteGuests(ev, removed); dash.bump(); dash.toast('Վերականգնվեց'); });
  });
  const remind = () => { actions.remindGuest(g); dash.bump(); dash.toast(`Հիշեցում ուղարկվեց՝ ${fullName(g)}`); };

  return (
    <>
      <div className="dr-h">
        <span className="avatar lg soft">{initials(fullName(g))}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow"><span className="gdot" style={{ background: gr.color }} />{gr.name}</div>
          <h2 className="dr-title" style={{ margin: '2px 0' }}>{fullName(g)}</h2>
          <div className="muted small">{g.family ? g.family + ' · ' : ''}{ev.title}</div>
        </div>
        <button className="icon-btn sm" onClick={dash.closeDrawer} aria-label="Փակել"><Icon name="close" /></button>
      </div>
      <div className="dr-b">
        <div className="dr-sec">
          <h4>RSVP</h4>
          <div className="seg3">{['confirmed', 'declined', 'pending'].map(k => <button type="button" key={k} className={g.rsvp === k ? 'on' : ''} onClick={() => setRsvp(k)}>{RSVP[k].l}</button>)}</div>
          <div className="small muted" style={{ marginTop: 8 }}>{respLine}</div>
        </div>
        <div className="dr-sec">
          <h4>Ներկայություն</h4>
          {d <= 0 && g.rsvp === 'confirmed'
            ? <div className="seg3">{['arrived', 'absent', 'unknown'].map(k => <button type="button" key={k} className={g.att === k ? 'on' : ''} onClick={() => setAtt(k)}>{ATT[k].l}</button>)}</div>
            : <p className="muted small" style={{ margin: 0 }}>{d > 0 ? `Ներկայությունը նշվում է միջոցառման օրը։` : 'Հյուրը չի հաստատել մասնակցությունը։'}</p>}
        </div>
        <div className="dr-sec">
          <h4>Տվյալներ</h4>
          <dl className="kv">
            <dt>Անուն</dt><dd>{g.first}</dd><dt>Ազգանուն</dt><dd>{g.last || '—'}</dd><dt>Սեռ</dt><dd>{GENDER[g.gender]}</dd>
            {ev.type === 'wedding' && <><dt>Կողմ</dt><dd>{g.side ? GUEST_SIDE[g.side] : '—'}</dd></>}
            <dt>Խումբ</dt><dd><button className="link plain" onClick={() => { dash.closeDrawer(); dash.patchUi('g', { rsvp: 'all', gender: 'all', group: gr.id, q: '', att: 'all', page: 1, view: 'table' }); dash.go('guests'); }}><span className="gdot" style={{ background: gr.color }} />{gr.name}</button></dd>
            <dt>Ընտանիք</dt><dd>{g.family || '—'}</dd>
            <dt>Հեռախոս</dt><dd>{g.phone
              ? <div className="url"><span>{g.phone}</span><button className="icon-btn sm bare" onClick={() => navigator.clipboard?.writeText(g.phone).then(() => dash.toast('Պատճենվեց'))} aria-label="Պատճենել"><Icon name="copy" /></button></div>
              : '—'}</dd>
            <dt>Ուղեկցողներ</dt><dd>{+g.companions ? `+${g.companions} · ընդամենը ${ppl(g)} մարդ` : 'Չկան'}</dd>
            <dt>Նշումներ</dt><dd>{g.notes || '—'}</dd>
          </dl>
        </div>
        <div className="dr-sec">
          <h4>Հրավերի ուղարկում</h4>
          <dl className="kv">
            <dt>Ալիք</dt><dd><Icon name={CHANNELS[g.channel].icon} size={13} /> {CHANNELS[g.channel].l}</dd>
            <dt>Կարգավիճակ</dt><dd><span className={`badge ${INVITE_ST[g.inviteStatus].c}`}><i /> {INVITE_ST[g.inviteStatus].l}</span></dd>
            <dt>Հղում</dt><dd><div className="url"><span className="mono" style={{ fontSize: 11.5 }}>{guestInviteUrl(ev, g)}</span><button className="icon-btn sm bare" onClick={() => navigator.clipboard?.writeText(`https://${guestInviteUrl(ev, g)}`).then(() => dash.toast('Հղումը պատճենվեց'))} aria-label="Պատճենել"><Icon name="copy" /></button></div></dd>
            {g.inviteOpenedAt && <><dt>Դիտվել է</dt><dd>{relTime(g.inviteOpenedAt)}</dd></>}
          </dl>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn sm" onClick={() => openPublicPreview(dash, ev, g)}><Icon name="eye" /> Դիտել այս հյուրի հրավերը</button>
            <button className="btn sm" onClick={() => openSendInvites(dash, ev, [g.id])}><Icon name="send" /> Ուղարկել</button>
          </div>
        </div>
        {fam.length > 0 && (
          <div className="dr-sec">
            <h4>Ընտանիքի անդամներ · {fam.length + 1}</h4>
            {fam.map(x => (
              <div className="list-row" style={{ padding: '10px 0' }} key={x.id} onClick={() => openGuestDrawer(dash, ev, x.id)}>
                <div className="cell-2" style={{ flex: 1 }}><span>{fullName(x)}</span><small>{GENDER[x.gender]}</small></div>
                <span className={`badge ${RSVP[x.rsvp].c}`}><i /> {RSVP[x.rsvp].l}</span>
              </div>
            ))}
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => {
              const n = actions.famRsvp(ev, g.family, g.rsvp); dash.bump(); dash.closeDrawer();
              dash.toast(n ? `${n} անդամի կարգավիճակը թարմացվեց` : 'Բոլոր անդամներն արդեն ունեն այս կարգավիճակը');
            }}>Կիրառել «{RSVP[g.rsvp].l}» ամբողջ ընտանիքին</button>
          </div>
        )}
      </div>
      <div className="dr-f">
        <button className="btn danger" onClick={del}><Icon name="trash" /> Ջնջել</button>
        <div className="spacer" />
        {g.rsvp === 'pending' && ev.inv.status === 'published' && d >= 0 && <button className="btn" onClick={remind}><Icon name="send" /> Հիշեցնել</button>}
        <button className="btn primary" onClick={() => openGuestForm(dash, ev, g.id)}><Icon name="edit" /> Խմբագրել</button>
      </div>
    </>
  );
}

export function openGuestDrawer(dash, ev, guestId) {
  dash.openDrawer(<GuestDrawerBody dash={dash} ev={ev} guestId={guestId} />);
}
