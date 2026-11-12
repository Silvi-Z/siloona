import { TYPES } from '../data/constants';
import { fmtDL } from '../utils/format';

export default function InvitationArt({ ev }) {
  const A = '#7A2433', Ik = '#3A2A2A', bg = '#FBF6EE';
  const parts = ev.title.split(' & ');
  let y = 150;
  const nodes = [];
  nodes.push(<text key="kicker" x="150" y={y} textAnchor="middle" fontFamily="Noto Sans Armenian, sans-serif" fontSize="8.5" letterSpacing="2.6" fill={A}>{TYPES[ev.type].inv}</text>);
  y += 38;
  if (parts.length === 2) {
    nodes.push(<text key="n1" x="150" y={y} textAnchor="middle" fontFamily="Noto Serif Armenian, serif" fontSize="25" fill={Ik}>{parts[0]}</text>);
    nodes.push(<text key="amp" x="150" y={y + 27} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="22" fill={A}>&amp;</text>);
    nodes.push(<text key="n2" x="150" y={y + 56} textAnchor="middle" fontFamily="Noto Serif Armenian, serif" fontSize="25" fill={Ik}>{parts[1]}</text>);
    y += 56;
  } else {
    const words = ev.title.split(' · ');
    if (words.length === 2) {
      nodes.push(<text key="w1" x="150" y={y} textAnchor="middle" fontFamily="Noto Serif Armenian, serif" fontSize={words[0].length > 14 ? 17 : 22} fill={Ik}>{words[0]}</text>);
      nodes.push(<text key="w2" x="150" y={y + 26} textAnchor="middle" fontFamily="Noto Serif Armenian, serif" fontSize="15" fill={A}>{words[1]}</text>);
      y += 26;
    } else {
      nodes.push(<text key="single" x="150" y={y} textAnchor="middle" fontFamily="Noto Serif Armenian, serif" fontSize={ev.title.length > 18 ? 15 : 20} fill={Ik}>{ev.title}</text>);
    }
  }
  y += 30;
  nodes.push(<line key="rule" x1="134" x2="166" y1={y - 12} y2={y - 12} stroke={A} strokeWidth=".8" />);
  nodes.push(<text key="date" x="150" y={y + 6} textAnchor="middle" fontFamily="Noto Sans Armenian, sans-serif" fontSize="9.5" letterSpacing=".8" fill={Ik} opacity=".85">{fmtDL(ev.date)}{ev.time ? ` · ${ev.time}` : ''}</text>);
  if (ev.locations[0]) nodes.push(<text key="venue" x="150" y={y + 22} textAnchor="middle" fontFamily="Noto Sans Armenian, sans-serif" fontSize="8" fill={Ik} opacity=".6">{ev.locations[0].name}</text>);

  return (
    <svg viewBox="0 0 300 400" role="img" aria-label={ev.title}>
      <rect width="300" height="400" fill={bg} />
      <path d="M68 352V176a82 82 0 0 1 164 0v176" fill="none" stroke={A} />
      <path d="M78 342V178a72 72 0 0 1 144 0v164" fill="none" stroke={A} strokeWidth=".5" opacity=".6" />
      <path d="M150 82l4 4-4 4-4-4z" fill={A} />
      {nodes}
    </svg>
  );
}
