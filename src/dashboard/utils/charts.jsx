import { useRef, useState, useMemo } from 'react';
import { moneyShort } from './format';

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2, t = .18;
    d += ` C${p1[0] + (p2[0] - p0[0]) * t} ${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t} ${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
function Frame({ labels, max, axis, W, H, pl, pr, pt, pb, xs }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map(k => {
        const v = max * k / 4, y = pt + (H - pt - pb) * (1 - k / 4);
        return (
          <g key={k}>
            <line x1={pl} x2={W - pr} y1={y} y2={y} stroke="#E7DED3" strokeDasharray={k ? '2 4' : undefined} />
            <text x={pl - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8E8284">{axis(v)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => <text key={i} x={xs(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#8E8284">{l}</text>)}
    </>
  );
}

function useTip(W, pts, labels, values, fmt) {
  const svgRef = useRef(null);
  const [tip, setTip] = useState(null); // { x, y, i }
  const show = e => {
    const svg = svgRef.current; if (!svg) return;
    const r = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = (clientX - r.left) / r.width * W;
    let i = 0, best = Infinity;
    pts.forEach((p, k) => { const dd = Math.abs(p[0] - x); if (dd < best) { best = dd; i = k; } });
    setTip({ i, px: pts[i][0], py: pts[i][1], scale: r.width / W });
  };
  const hide = () => setTip(null);
  return { svgRef, tip, show, hide };
}

export function LineChart({ labels, values, h = 250, fmt = v => v, axis = moneyShort, tipLabels }) {
  const W = 760, H = h, pl = 54, pr = 18, pt = 16, pb = 30;
  const max = useMemo(() => niceMax(Math.max(...values, 1)), [values]);
  const n = values.length;
  const xs = i => pl + (n === 1 ? 0 : i * (W - pl - pr) / (n - 1));
  const ys = v => pt + (H - pt - pb) * (1 - v / max);
  const pts = useMemo(() => values.map((v, i) => [xs(i), ys(v)]), [values, max]);
  const line = smooth(pts);
  const { svgRef, tip, show, hide } = useTip(W, pts, tipLabels || labels, values, fmt);
  return (
    <div className="chart">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onMouseMove={show} onMouseLeave={hide} onTouchStart={show}>
        <Frame labels={labels} max={max} axis={axis} W={W} H={H} pl={pl} pr={pr} pt={pt} pb={pb} xs={xs} />
        <path d={`${line} L${xs(n - 1)} ${ys(0)} L${xs(0)} ${ys(0)}Z`} fill="#6B1D2C" opacity=".05" />
        <path d={line} fill="none" stroke="#6B1D2C" strokeWidth="1.7" />
        <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r="3" fill="#6B1D2C" />
        {tip && <line x1={tip.px} x2={tip.px} y1={pt} y2={H - pb} stroke="#2A2526" strokeOpacity=".25" strokeDasharray="3 3" />}
        {tip && <circle cx={tip.px} cy={tip.py} r="4.5" fill="#FFFDFA" stroke="#6B1D2C" strokeWidth="1.6" />}
      </svg>
      {tip && (
        <div className="tip" style={{ left: tip.px * tip.scale, top: tip.py * tip.scale, opacity: 1 }}>
          <div className="tl">{(tipLabels || labels)[tip.i]}</div><b>{fmt(values[tip.i])}</b>
        </div>
      )}
    </div>
  );
}

export function BarChart({ labels, values, h = 250, fmt = v => v, axis = v => Math.round(v), tipLabels, partialLast }) {
  const W = 760, H = h, pl = 54, pr = 18, pt = 16, pb = 30;
  const max = useMemo(() => niceMax(Math.max(...values, 1)), [values]);
  const n = values.length, slot = (W - pl - pr) / n, bw = Math.min(28, slot * .46);
  const xs = i => pl + slot * i + slot / 2;
  const ys = v => pt + (H - pt - pb) * (1 - v / max);
  const pts = useMemo(() => values.map((v, i) => [xs(i), ys(v)]), [values, max]);
  const { svgRef, tip, show, hide } = useTip(W, pts, tipLabels || labels, values, fmt);
  return (
    <div className="chart">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onMouseMove={show} onMouseLeave={hide} onTouchStart={show}>
        <Frame labels={labels} max={max} axis={axis} W={W} H={H} pl={pl} pr={pr} pt={pt} pb={pb} xs={xs} />
        {values.map((v, i) => {
          const y = ys(v), hgt = ys(0) - y, isLast = i === n - 1 && partialLast;
          return <rect key={i} x={xs(i) - bw / 2} y={y} width={bw} height={Math.max(hgt, .5)} rx="1.5" fill={isLast ? '#C9A7A8' : '#6B1D2C'} opacity={tip && tip.i !== i ? .35 : isLast ? 1 : .88} />;
        })}
      </svg>
      {tip && (
        <div className="tip" style={{ left: tip.px * tip.scale, top: tip.py * tip.scale, opacity: 1 }}>
          <div className="tl">{(tipLabels || labels)[tip.i]}</div><b>{fmt(values[tip.i])}</b>
        </div>
      )}
    </div>
  );
}
