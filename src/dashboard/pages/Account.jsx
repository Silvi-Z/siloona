import { useState } from 'react';
import { useDashboard } from '../state/DashboardContext';
import { SETTINGS } from '../data/mockMeta';
import { LANGS } from '../data/constants';
import * as actions from '../data/actions';

const TABS = [['profile', 'Պրոֆիլ'], ['account', 'Հաշիվ'], ['lang', 'Լեզու'], ['notif', 'Ծանուցումներ']];

function Row({ l, s, children }) {
  return <div className="set-row"><div className="rl">{l}{s && <small>{s}</small>}</div><div>{children}</div></div>;
}
function Switch({ checked, onChange }) {
  return <label className="sw"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span /></label>;
}

export default function Account() {
  const dash = useDashboard();
  const tab = dash.ui.set.tab;
  const setTab = t => { dash.ui.set.tab = t; dash.bump(); };

  return (
    <div className="set">
      <nav className="set-nav">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
      <div className="set-body">
        {tab === 'profile' && <ProfileTab dash={dash} />}
        {tab === 'account' && <AccountTab dash={dash} />}
        {tab === 'lang' && <LangTab dash={dash} />}
        {tab === 'notif' && <NotifTab dash={dash} />}
      </div>
    </div>
  );
}

function SaveBar({ onSave, onCancel }) {
  return <div className="save-bar"><button className="btn ghost" onClick={onCancel}>Չեղարկել</button><button className="btn primary" onClick={onSave}>Պահպանել</button></div>;
}

function ProfileTab({ dash }) {
  const P = dash.mode === 'couple' ? SETTINGS.couple.profile : SETTINGS.org.profile;
  const [form, setForm] = useState({ ...P });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => { actions.saveProfile(dash.mode, form); dash.bump(); dash.toast('Կարգավորումները պահպանվեցին'); };
  const cancel = () => setForm({ ...P });
  return (
    <>
      <div className="set-sec">
        <h3>Պրոֆիլ</h3>
        <p>{dash.mode === 'couple' ? 'Ձեր հաշվի տվյալները։' : 'Ձեր տվյալները երևում են հյուրերին՝ որպես կազմակերպչի կոնտակտ։'}</p>
        {dash.mode === 'couple' ? (
          <Row l="Անուն Ազգանուն"><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></Row>
        ) : (
          <>
            <Row l="Անուն Ազգանուն"><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></Row>
            <Row l="Ընկերություն"><input className="input" value={form.company} onChange={e => set('company', e.target.value)} /></Row>
            <Row l="Պաշտոն"><input className="input" value={form.role} onChange={e => set('role', e.target.value)} /></Row>
          </>
        )}
        <Row l="Email"><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Row>
        <Row l="Հեռախոս"><input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} /></Row>
      </div>
      <SaveBar onSave={save} onCancel={cancel} />
    </>
  );
}

function AccountTab({ dash }) {
  const P = dash.mode === 'couple' ? SETTINGS.couple.profile : SETTINGS.org.profile;
  const [cur, setCur] = useState(''); const [pw1, setPw1] = useState(''); const [pw2, setPw2] = useState('');
  const [twofa, setTwofa] = useState(SETTINGS.account.twofa);
  const [err, setErr] = useState('');
  const save = async () => {
    const res = await actions.saveAccountSecurity({ cur, pw1, pw2, twofa });
    if (res.error) { setErr(res.error); return; }
    setErr(''); setCur(''); setPw1(''); setPw2(''); dash.bump(); dash.toast('Կարգավորումները պահպանվեցին');
  };
  const del = () => dash.confirm('Ջնջե՞լ հաշիվը', 'Հաշվի ամբողջական ջնջումը դեռ հասանելի չէ վահանակից (պահանջում է սերվերային ադմին գործողություն)։ Գրեք մեզ՝ Ձեր տվյալները հեռացնելու համար։', 'Հասկանալի է', () => {});
  return (
    <>
      <div className="set-sec">
        <h3>Հաշիվ</h3><p>Մուտք և անվտանգություն։</p>
        <Row l="Մուտքի email"><span>{P.email}</span></Row>
        <Row l="Ընթացիկ գաղտնաբառ"><input className="input" type="password" value={cur} onChange={e => setCur(e.target.value)} /></Row>
        <Row l="Նոր գաղտնաբառ" s="Առնվազն 8 նիշ"><input className="input" type="password" value={pw1} onChange={e => setPw1(e.target.value)} /></Row>
        <Row l="Կրկնել"><input className="input" type="password" value={pw2} onChange={e => setPw2(e.target.value)} /></Row>
        <Row l="Երկքայլ նույնականացում" s="Մուտքի կոդ SMS-ով"><Switch checked={twofa} onChange={setTwofa} /></Row>
        <div className="err">{err}</div>
      </div>
      <SaveBar onSave={save} onCancel={() => { setCur(''); setPw1(''); setPw2(''); setTwofa(SETTINGS.account.twofa); setErr(''); }} />
      <div className="set-sec" style={{ marginTop: 28 }}>
        <h3>Ջնջել հաշիվը</h3><p>Բոլոր միջոցառումները, հյուրերի ցուցակները և հրավիրատոմսերը կջնջվեն անվերադարձ։</p>
        <button className="btn danger" onClick={del}>Ջնջել հաշիվը</button>
      </div>
    </>
  );
}

function LangTab({ dash }) {
  const L = SETTINGS.lang;
  const [ui, setUi] = useState(L.ui); const [inv, setInv] = useState(L.inv); const [dateFmt, setDateFmt] = useState(L.dateFmt);
  const toggleInv = k => setInv(l => l.includes(k) ? l.filter(x => x !== k) : [...l, k]);
  const save = () => { const res = actions.saveLang({ ui, inv, dateFmt }); dash.bump(); dash.toast(res.changedUi ? 'Պահպանվեց · prototype-ում ինտերֆեյսը հասանելի է հայերենով' : 'Կարգավորումները պահպանվեցին'); };
  return (
    <>
      <div className="set-sec">
        <h3>Լեզու</h3><p>Վահանակի և հրավիրատոմսերի լեզուները։</p>
        <Row l="Վահանակի լեզու">
          <div className="radio-cards">
            {[['hy', 'Հայերեն', 'Հիմնական'], ['en', 'English', 'Interface'], ['ru', 'Русский', 'Интерфейс']].map(([k, l, sub]) => (
              <label key={k}><input type="radio" checked={ui === k} onChange={() => setUi(k)} /><b>{l}</b><small>{sub}</small></label>
            ))}
          </div>
        </Row>
        <Row l="Նոր հրավիրատոմսերի լեզուներ" s="Ըստ նախնականի">
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>{Object.entries(LANGS).map(([k, l]) => <label className="check" key={k}><input type="checkbox" checked={inv.includes(k)} onChange={() => toggleInv(k)} />{l}</label>)}</div>
        </Row>
        <Row l="Ամսաթվի ձևաչափ">
          <select className="input" value={dateFmt} onChange={e => setDateFmt(e.target.value)}>
            <option value="long">19 դեկտեմբերի, 2026</option>
            <option value="short">19.12.2026</option>
          </select>
        </Row>
      </div>
      <SaveBar onSave={save} onCancel={() => { setUi(L.ui); setInv(L.inv); setDateFmt(L.dateFmt); }} />
    </>
  );
}

function NotifTab({ dash }) {
  const N = SETTINGS.notif;
  const [form, setForm] = useState({ ...N });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => { actions.saveNotif(form); dash.bump(); dash.toast('Կարգավորումները պահպանվեցին'); };
  return (
    <>
      <div className="set-sec">
        <h3>Ծանուցումներ</h3><p>Ինչի մասին տեղեկացնել։</p>
        <Row l="Նոր RSVP պատասխան" s="Ամեն անգամ, երբ հյուրը պատասխանում է"><Switch checked={form.rsvp} onChange={v => set('rsvp', v)} /></Row>
        <Row l="Օրական ամփոփում" s="Երեկոյան՝ օրվա պատասխանները"><Switch checked={form.digest} onChange={v => set('digest', v)} /></Row>
        <Row l="Վերջնաժամկետի հիշեցում" s="3 օր առաջ"><Switch checked={form.deadline} onChange={v => set('deadline', v)} /></Row>
        <Row l="Դիտումների ամփոփում" s="Շաբաթական"><Switch checked={form.views} onChange={v => set('views', v)} /></Row>
        <Row l="Ալիքներ">
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <label className="check"><input type="checkbox" checked={form.email} onChange={e => set('email', e.target.checked)} />Email</label>
            <label className="check"><input type="checkbox" checked={form.telegram} onChange={e => set('telegram', e.target.checked)} />Telegram</label>
            <label className="check"><input type="checkbox" checked={form.sms} onChange={e => set('sms', e.target.checked)} />SMS</label>
          </div>
        </Row>
      </div>
      <SaveBar onSave={save} onCancel={() => setForm({ ...N })} />
    </>
  );
}
