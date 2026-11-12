import { useState } from 'react';
import Icon from '../utils/icons';
import { ModalHeader } from '../components/Overlays';
import { CHANNELS, INVITE_ST } from '../data/constants';
import { fullName } from '../data/selectors';
import { buildDelivery } from '../utils/deliveryLinks';
import * as actions from '../data/actions';
import { openGuestForm } from './GuestModal';

// Delivery management, kept separate from guest management (GuestModal) and
// invitation personalization (InvitationEditor) — this component only
// knows how to take an already-selected list of guests and walk the
// organizer through sending each one's personalized invitation on their own
// channel. No channel here is auto-sendable (see CHANNELS in constants.js);
// every row ends in a real manual action the organizer takes themselves.
function SendRow({ dash, ev, g }) {
  const delivery = buildDelivery(ev, g);
  const ch = CHANNELS[g.channel];

  const openLink = () => {
    window.open(delivery.link, '_blank', 'noopener');
    actions.markInviteSent(ev, g);
    dash.bump();
  };
  const copyMessage = () => {
    navigator.clipboard?.writeText(delivery.text).then(() => dash.toast('Հաղորդագրությունը պատճենվեց'));
    actions.markInviteSent(ev, g);
    dash.bump();
  };
  const retry = () => { actions.queueInvites(ev, [g.id]); dash.bump(); };
  const fixContact = () => { dash.closeModal(); openGuestForm(dash, ev, g.id); };

  return (
    <div className="send-row">
      <div className="cell-2" style={{ flex: 1 }}>
        <span className="strong">{fullName(g)}</span>
        <small><Icon name={ch.icon} size={12} /> {ch.l}{g[ch.contact] ? ` · ${g[ch.contact]}` : ''}</small>
      </div>
      <span className={`badge ${INVITE_ST[g.inviteStatus].c}`}><i /> {INVITE_ST[g.inviteStatus].l}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {g.inviteStatus === 'failed' ? (
          <button type="button" className="btn sm" onClick={fixContact}>Լրացնել կոնտակտը</button>
        ) : g.inviteStatus === 'sent' ? (
          <button type="button" className="btn sm ghost" onClick={retry}>Կրկին ուղարկել</button>
        ) : delivery.copyOnly ? (
          <button type="button" className="btn sm primary" onClick={copyMessage}>Պատճենել հաղորդագրությունը</button>
        ) : (
          <button type="button" className="btn sm primary" onClick={openLink}><Icon name="ext" /> Բացել {ch.l}-ում</button>
        )}
      </div>
    </div>
  );
}

function SendBody({ dash, ev, guestIds }) {
  const [queued, setQueued] = useState(false);
  const guests = guestIds.map(id => ev.guests.find(g => g.id === id)).filter(Boolean);
  const byChannel = {};
  guests.forEach(g => { byChannel[g.channel] = (byChannel[g.channel] || 0) + 1; });
  const missing = guests.filter(g => !g[CHANNELS[g.channel].contact]);
  const ready = guests.length - missing.length;

  const start = () => {
    const res = actions.queueInvites(ev, guests.map(g => g.id));
    dash.bump();
    setQueued(true);
    dash.toast(`${res.manual} հրավեր պատրաստ է, ${res.failed} բաց կոնտակտի պատճառով`);
  };

  return (
    <>
      <ModalHeader title="Ուղարկել հրավերներ" sub={`${guests.length} հյուր ընտրված`} />
      <div className="m-b">
        {!queued ? (
          <>
            <div className="send-note">
              Ոչ մի ալիք այստեղ ավտոմատ կերպով չի ուղարկում. WhatsApp, Telegram, SMS և Email-ի համար կբացվի
              պատրաստի հաղորդագրությամբ պատուհան, իսկ Viber-ի համար՝ հաղորդագրությունը կպատճենվի, քանի որ
              Viber-ը հանրային հղում-ինտեգրացիա չունի կամայական համարի համար։ Իրական ավտոմատ ուղարկման համար
              անհրաժեշտ կլինեն պաշտոնական API-ներ (WhatsApp Business, Telegram Bot, SMS/Twilio, Email) և սերվերային մաս։
            </div>
            <div className="send-summary">
              {Object.entries(byChannel).map(([k, n]) => (
                <div key={k} className="ss-row"><Icon name={CHANNELS[k].icon} size={15} /><span>{CHANNELS[k].l}</span><b>{n}</b></div>
              ))}
            </div>
            <div className="send-counts">
              <span><b>{ready}</b> պատրաստ է ձեռքով ուղարկման</span>
              {missing.length > 0 && <span className="danger"><b>{missing.length}</b> բաց է կոնտակտի դաշտը</span>}
            </div>
          </>
        ) : (
          <div className="send-list">
            {guests.map(g => <SendRow key={g.id} dash={dash} ev={ev} g={g} />)}
          </div>
        )}
      </div>
      <div className="m-f">
        <button className="btn ghost" onClick={dash.closeModal}>{queued ? 'Փակել' : 'Չեղարկել'}</button>
        {!queued && <button className="btn primary" onClick={start}>Պատրաստել ուղարկման համար</button>}
      </div>
    </>
  );
}

export function openSendInvites(dash, ev, guestIds) {
  dash.openModal(<SendBody dash={dash} ev={ev} guestIds={guestIds} />, 'wide');
}
