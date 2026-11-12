import { TYPES } from '../data/constants';

export function Badge({ map, value }) {
  const s = map[value] || { l: value, c: '' };
  return <span className={`badge ${s.c}`}><i /> {s.l}</span>;
}

export function TypeTag({ type }) {
  const t = TYPES[type];
  return <span className={`tag ${t.cls}`} style={{ color: 'var(--tc)', background: 'var(--tb)', borderColor: 'transparent' }}>{t.l}</span>;
}
