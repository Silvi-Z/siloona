import Icon from '../utils/icons';

// tone/icon are optional — most stats stay neutral (see Kpi call sites);
// only the ones that map unambiguously to a status (confirmed/declined/
// pending guest counts, key event dates) get a color + small icon chip.
export default function Kpi({ label, value, detail, onClick, tone, icon }) {
  return (
    <div className={`kpi ${onClick ? 'click' : ''} ${tone ? 'tone-' + tone : ''}`} onClick={onClick}>
      {icon && <span className="kpi-ic"><Icon name={icon} size={13} /></span>}
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      <div className="d">{detail}</div>
    </div>
  );
}
