export default function RsvpBar({ stats, lg }) {
  const t = stats.confirmed + stats.declined + stats.pending || 1;
  return (
    <div className={`rbar ${lg ? 'lg' : ''}`}>
      <span className="c-conf" style={{ width: `${stats.confirmed / t * 100}%` }} />
      <span className="c-dec" style={{ width: `${stats.declined / t * 100}%` }} />
      <span className="c-pend" style={{ width: `${stats.pending / t * 100}%` }} />
    </div>
  );
}
