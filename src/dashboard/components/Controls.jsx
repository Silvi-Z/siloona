import Icon from '../utils/icons';
import { num } from '../utils/format';

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

// lang="en-GB" forces the native time picker to render in 24h format
// regardless of the browser/OS's default locale — the stored value
// ("18:00") is already 24h everywhere, this only affects the picker UI.
export function TimeField({ value, onChange, className = 'input', ...rest }) {
  return <input className={className} type="time" lang="en-GB" value={value} onChange={e => onChange(e.target.value)} {...rest} />;
}
