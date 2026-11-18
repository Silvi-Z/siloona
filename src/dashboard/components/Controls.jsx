import Icon from '../utils/icons';
import { num } from '../utils/format';
import TimeSelect from '../../site/invitations/shared/TimeSelect';

export function Seg({ items, value, onChange, full }) {
  return (
    <div className={`seg ${full ? 'full' : ''}`}>
      {items.map(([v, l]) => (
        <button key={v} type="button" className={String(value) === String(v) ? 'active' : ''} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs">
      {items.map(([v, l, n]) => (
        <button key={v} type="button" className={`tab ${value === v ? 'active' : ''}`} onClick={() => onChange(v)}>
          {l}{n != null && <span className="n">{num(n)}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, style }) {
  return (
    <div className="search-field" style={style}>
      <Icon name="search" />
      <input className="input" type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function SelectField({ value, onChange, options, ariaLabel }) {
  return (
    <select className="input" value={value} aria-label={ariaLabel} onChange={e => onChange(e.target.value)}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

// Always 24h: hour and minute lists (a native time input shows AM/PM in
// some browser languages, whatever the page asks). Value "18:00" or "".
export function TimeField({ value, onChange, className = 'input', ...rest }) {
  return <TimeSelect value={value} onChange={onChange} className={className} allowEmpty {...rest} />;
}
