import { useState } from 'react';
import Icon from '../utils/icons';
import EmptyState from './EmptyState';
import StudioHost from './StudioHost';
import DesignCard, { DesignThumb } from '../../site/DesignCard';
import { designsForEventType, findDesign } from '../../site/designCatalog';
import { TYPES } from '../data/constants';
import * as actions from '../data/actions';

const KIND_LABELS = { web: 'Վեբ հրավիրատոմս', card: 'Քարտային հրավիրատոմս' };
const KIND_TABS = { web: 'Վեբ', card: 'Քարտային' };

function CardPreview({ dash, design }) {
  return (
    <>
      <div className="m-h">
        <div style={{ flex: 1 }}><h3>{design.code}</h3><div className="small muted">{design.type}</div></div>
        <button className="icon-btn sm bare" onClick={dash.closeModal} aria-label="Փակել"><Icon name="close" /></button>
      </div>
      <div className="m-b sil-catalog card-preview"><DesignThumb design={design} /></div>
    </>
  );
}

// «Բոլոր հրավերները»: every design made for this event's type
// (site/designCatalog.js `eventTypes`), shown with the same card as the
// public /invitations catalog, each with View / Edit / Select. The chosen
// one is what «Իմ հրավերը» (pages/Invitation.jsx) then shows.
export default function DesignPicker({ dash, ev }) {
  const designs = designsForEventType(ev.type);
  const selected = findDesign(ev.inv.design);
  const kinds = ['web', 'card'].filter((k) => designs[k].length);
  const [kind, setKind] = useState(() => (selected && kinds.includes(selected.kind) ? selected.kind : kinds[0]));
  const [studio, setStudio] = useState(null); // { design, editing }

  const select = (d) => {
    actions.selectInvitationDesign(ev, d);
    dash.bump();
    dash.toast(`Ընտրվեց ${d.code} դիզայնը`);
  };
  const view = (d) => {
    if (d.previewSlug) setStudio({ design: d, editing: false });
    else dash.openModal(<CardPreview dash={dash} design={d} />, 'narrow');
  };

  return (
    <section className="panel design-picker">
      <div className="panel-h">
        <h3>Հրավիրատոմսի դիզայններ</h3>
        <span className="sub">{TYPES[ev.type]?.l}</span>
        <div className="spacer" />
        {selected
          ? <span className="small">Ընտրված՝ <b>{selected.code}</b> · <button type="button" className="link" onClick={() => dash.go('invitation')}>Իմ հրավերը →</button></span>
          : <span className="small muted">Դիզայն դեռ ընտրված չէ</span>}
      </div>
      <div className="panel-b">
        {kinds.length === 0 ? (
          <EmptyState title="Այս տեսակի համար դիզայններ դեռ չկան" sub={<p className="muted" style={{ margin: '6px 0 0' }}>Նոր դիզայններն ավելանում են հավաքածուում. շուտով դրանք կհայտնվեն այստեղ։</p>} />
        ) : (
          <>
            {kinds.length > 1 && (
              <div className="seg" role="tablist" aria-label="Հրավիրատոմսի ձևաչափ" style={{ marginBottom: 18 }}>
                {kinds.map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
                    {KIND_TABS[k]} <span className="muted">· {designs[k].length}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="catalog-grid sil-catalog design-grid">
              {designs[kind].map((d) => {
                const isSel = ev.inv.design === d.id;
                const editable = !!d.previewSlug;
                return (
                  <DesignCard
                    key={d.id}
                    design={d}
                    label={KIND_LABELS[d.kind]}
                    className={isSel ? 'is-selected' : ''}
                    badge={isSel ? '✓ Ընտրված' : null}
                    actions={
                      <>
                        <button type="button" className="btn sm" onClick={() => view(d)}>Դիտել</button>
                        {editable && <button type="button" className="btn sm" onClick={() => setStudio({ design: d, editing: true })}>Խմբագրել</button>}
                        {isSel
                          ? <span className="btn sm select is-on" role="status"><Icon name="check" /> Ընտրված է</span>
                          : <button type="button" className="btn sm select primary" onClick={() => select(d)}>Ընտրել</button>}
                      </>
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <StudioHost dash={dash} ev={ev} studio={studio} onClose={() => setStudio(null)} />
    </section>
  );
}
