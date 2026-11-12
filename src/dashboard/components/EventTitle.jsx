import { titleParts } from '../data/selectors';

export default function EventTitle({ ev }) {
  const parts = titleParts(ev);
  if (!parts) return <>{ev.title}</>;
  return <>{parts[0]}<span className="amp">&amp;</span>{parts[1]}</>;
}
