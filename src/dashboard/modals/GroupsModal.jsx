import { useState } from 'react';
import { ModalHeader } from '../components/Overlays';
import * as actions from '../data/actions';
import Icon from '../utils/icons';

function GroupsBody({ dash, ev }) {
  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const [newName, setNewName] = useState('');

  const add = () => {
    const name = newName.trim(); if (!name) return;
    const res = actions.addGroup(ev, name);
    if (res.error === 'exists') { dash.toast('Այդպիսի խումբ արդեն կա'); return; }
    setNewName(''); refresh();
  };
  const del = (g) => {
    const n = ev.guests.filter(x => x.group === g.id).length;
    const doIt = () => {
      const res = actions.deleteGroup(ev, g.id);
      if (res.error) { dash.toast(res.error); return; }
      if (dash.ui.g.group === g.id) dash.ui.g.group = 'all';
      dash.bump(); refresh();
      dash.toast(`«${res.name}» խումբը հեռացվեց`);
    };
    n ? dash.confirm('Հեռացնե՞լ խումբը', `«${g.name}» խմբի ${n} հյուրը կտեղափոխվի մյուս խմբին։`, 'Հեռացնել', doIt) : doIt();
  };
  const done = () => { actions.finalizeGroups(ev); dash.closeModal(); dash.bump(); };

  return (
    <>
      <ModalHeader title="Հյուրերի խմբեր" sub="Վերանվանեք, ավելացրեք կամ հեռացրեք խմբերը։ Փոփոխությունները կիրառվում են միայն այս միջոցառման համար։" />
      <div className="m-b">
        <div>
          {ev.groups.map(g => (
            <div className="gr-row" key={g.id}>
              <span className="gdot" style={{ background: g.color, margin: 0 }} />
              <input className="input" value={g.name} onChange={e => { actions.renameGroup(ev, g.id, e.target.value); refresh(); }} />
              <span className="muted small">{ev.guests.filter(x => x.group === g.id).length} հյուր</span>
              <button className="icon-btn sm bare" onClick={() => del(g)} aria-label="Ջնջել"><Icon name="trash" /></button>
            </div>
          ))}
        </div>
        <div className="who" style={{ marginTop: 16 }}>
          <input className="input" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Նոր խմբի անվանում" style={{ flex: 1 }} />
          <button className="btn" onClick={add}><Icon name="plus" /> Ավելացնել</button>
        </div>
      </div>
      <div className="m-f"><button className="btn primary" onClick={done}>Պատրաստ է</button></div>
    </>
  );
}

export function openGroupsModal(dash, ev) { dash.openModal(<GroupsBody dash={dash} ev={ev} />); }

function ImportBody({ dash, ev }) {
  const [text, setText] = useState('');
  const [groupId, setGroupId] = useState(ev.groups[0]?.id || '');
  const [family, setFamily] = useState('');
  const [err, setErr] = useState('');
  const count = text.split('\n').filter(l => l.trim()).length;
  const submit = () => {
    const res = actions.importGuests(ev, text, groupId, family);
    if (res.error) { setErr(res.error); return; }
    dash.closeModal(); dash.bump();
    dash.toast(`${res.added.length} հյուր ներմուծվեց`);
  };
  return (
    <>
      <ModalHeader title="Ներմուծել հյուրեր" sub="Տեղադրեք ցուցակը՝ ամեն տողում մեկ հյուր։ Ձևաչափ՝ Անուն Ազգանուն, հեռախոս, ուղեկցողներ" />
      <div className="m-b">
        <div className="form">
          <label className="full">Ցուցակ
            <textarea className="input" style={{ minHeight: 180, fontSize: 12.5 }} value={text} onChange={e => setText(e.target.value)}
              placeholder={'Արամ Պողոսյան, +374 91 11 22 33, 1\nԼիանա Պողոսյան, , 0\nԳևորգ Ադամյան'} />
          </label>
          <label>Խումբ
            <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)}>
              {ev.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
          <label>Ընտանիք (ըստ ցանկության)<input className="input" value={family} onChange={e => setFamily(e.target.value)} placeholder="Օրինակ՝ Պողոսյանների ընտանիք" /></label>
          <div className="err full">{err}</div>
        </div>
      </div>
      <div className="m-f">
        <span className="small muted" style={{ marginRight: 'auto' }}>{count} հյուր</span>
        <button className="btn ghost" onClick={dash.closeModal}>Չեղարկել</button>
        <button className="btn primary" onClick={submit}>Ներմուծել</button>
      </div>
    </>
  );
}
export function openImportModal(dash, ev) { dash.openModal(<ImportBody dash={dash} ev={ev} />); }
