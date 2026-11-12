import Icon from '../utils/icons';
import { MenuItem } from './Overlays';
import * as actions from '../data/actions';
import { RSVP } from '../data/constants';
import { fullName, grp } from '../data/selectors';
import { openSendInvites } from '../modals/SendInvitesModal';

export default function BulkBar({ dash, ev }) {
  const sel = dash.ui.g.sel;
  const n = sel.size;
  if (dash.page !== 'guests' || !n) return null;

  const openRsvpMenu = (anchorEl) => dash.openMenu(anchorEl, (
    <>
      <div className="mh">Կիրառել {n} հյուրին</div>
      {Object.entries(RSVP).map(([k, v]) => (
        <MenuItem key={k} label={v.l} onClick={() => { actions.bulkSetRsvp(ev, sel, k); dash.closeMenu(); dash.bump(); dash.toast(`${n} հյուր · ${v.l}`); }} />
      ))}
    </>
  ));
  const openGroupMenu = (anchorEl) => dash.openMenu(anchorEl, (
    <>
      <div className="mh">Տեղափոխել խումբ</div>
      {ev.groups.map(g => (
        <button key={g.id} className="mi" onClick={() => { actions.bulkSetGroup(ev, sel, g.id); dash.closeMenu(); dash.bump(); dash.toast(`${n} հյուր տեղափոխվեց «${g.name}»`); }}>
          <span className="gdot" style={{ background: g.color, margin: 0 }} />{g.name}
        </button>
      ))}
    </>
  ));
  const remind = () => { const c = actions.bulkRemind(ev, sel); dash.bump(); dash.toast(c ? `Հիշեցում ուղարկվեց ${c} հյուրի` : 'Ընտրվածների մեջ չպատասխանած հյուրեր չկան'); };
  const copyPhones = () => {
    const ph = ev.guests.filter(g => sel.has(g.id) && g.phone).map(g => `${fullName(g)}: ${g.phone}`);
    navigator.clipboard?.writeText(ph.join('\n')).then(() => dash.toast(`${ph.length} հեռախոսահամար պատճենվեց`));
  };
  const del = () => dash.confirm(n > 1 ? `Ջնջե՞լ ${n} հյուրի` : 'Ջնջե՞լ հյուրին', `Ընտրված ${n} հյուրը կհեռացվի${n > 1 ? 'ն' : ''} հյուրերի ցուցակից և RSVP վիճակագրությունից։`, 'Ջնջել', () => {
    const removed = actions.deleteGuests(ev, [...sel]); sel.clear(); dash.bump();
    dash.toast(n > 1 ? `${n} հյուր ջնջվեց` : 'Հյուրը ջնջվեց', () => { actions.undoDeleteGuests(ev, removed); dash.bump(); dash.toast('Վերականգնվեց'); });
  });

  return (
    <div className="bulk on">
      <span className="bn">{n} ընտրված</span>
      <button onClick={() => openSendInvites(dash, ev, [...sel])}><Icon name="send" /> Ուղարկել հրավեր</button>
      <button onClick={e => openRsvpMenu(e.currentTarget)}><Icon name="rsvp" /> RSVP</button>
      <button onClick={e => openGroupMenu(e.currentTarget)}><Icon name="layers" /> Խումբ</button>
      <button onClick={remind}><Icon name="send" /> Հիշեցնել</button>
      <button onClick={copyPhones}><Icon name="copy" /> Հեռախոսներ</button>
      <button className="dz" onClick={del}><Icon name="trash" /> Ջնջել</button>
      <button onClick={() => { sel.clear(); dash.bump(); }} aria-label="Չեղարկել ընտրությունը"><Icon name="close" /></button>
    </div>
  );
}
