import EventTypePicker from './EventTypePicker';
import * as actions from '../data/actions';

// Shown instead of the whole dashboard the moment a couple-mode event has
// no type yet (a fresh account) — the platform is not wedding-only, so
// nothing event-specific (names, dates, wedding fields) renders until the
// user picks what they're actually planning.
export default function EventTypeGate({ dash, ev }) {
  const pick = (type) => {
    actions.setEventType(ev, type);
    dash.bump();
    dash.go('details');
  };
  return (
    <div className="ty-gate">
      <div className="ty-gate-in">
        <p className="eyebrow">Siloona</p>
        <h1>Ի՞նչ միջոցառում եք կազմակերպում</h1>
        <p className="muted">Ընտրեք կատեգորիան՝ Ձեր վահանակը հարմարեցնելու համար։ Կարող եք փոխել այն ավելի ուշ։</p>
        <EventTypePicker value={ev.type} onChange={pick} />
      </div>
    </div>
  );
}
