import Icon from '../utils/icons';
import { TYPES, TYPE_ORDER } from '../data/constants';

// Shared visual category grid — used both for the first-open "what are you
// planning" gate (couple mode) and the new-event form (organizer mode), so
// picking a type always looks and feels the same across the dashboard.
export default function EventTypePicker({ value, onChange, compact }) {
  return (
    <div className={`ty-grid ${compact ? 'compact' : ''}`}>
      {TYPE_ORDER.map((k) => {
        const t = TYPES[k];
        return (
          <button type="button" key={k} className={`ty-card ${t.cls} ${value === k ? 'active' : ''}`} onClick={() => onChange(k)}>
            <span className="ty-ic"><Icon name={t.icon} size={compact ? 20 : 26} /></span>
            <span className="ty-l">{t.l}</span>
          </button>
        );
      })}
    </div>
  );
}
