import { useEffect, useState } from 'react';
import { nowX } from '../utils/format';

function parts(targetMs) {
  let ms = Math.max(0, targetMs - nowX().getTime());
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4);
  const s = Math.floor((ms - m * 6e4) / 1000);
  return [[d, 'օր'], [h, 'ժամ'], [m, 'րոպե'], [s, 'վայրկյան']];
}

export default function CountdownClock({ target }) {
  const [vals, setVals] = useState(() => parts(target.getTime()));
  useEffect(() => {
    const id = setInterval(() => setVals(parts(target.getTime())), 1000);
    return () => clearInterval(id);
  }, [target]);
  return (
    <div className="cd">
      {vals.map(([v, l]) => (
        <div key={l}><b>{String(v).padStart(2, '0')}</b><small>{l}</small></div>
      ))}
    </div>
  );
}
