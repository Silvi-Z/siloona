import { useCountdown } from '../lib/useCountdown'

export default function CountdownBand({ data }) {
  const cd = useCountdown(data.eventDate)

  return (
    <section className="band" style={{ paddingTop: 34, paddingBottom: 36 }}>
      <p className="lab rv" style={{ fontSize: 'clamp(11px,2.6vw,12.5px)' }}>Հարսանիքին մնացել է՝</p>
      {cd && cd.done ? (
        <div className="cnt rv" style={{ '--dl': '.1s' }}><b style={{ fontSize: 28 }}>Այսօր մեր օրն է։</b></div>
      ) : (
        <div className="cnt rv" style={{ '--dl': '.1s' }}>
          <div><b>{cd ? cd.d : '000'}</b><span>օր</span></div>
          <em>:</em>
          <div><b>{cd ? cd.h : '00'}</b><span>ժամ</span></div>
          <em>:</em>
          <div><b>{cd ? cd.m : '00'}</b><span>րոպե</span></div>
          <em>:</em>
          <div><b>{cd ? cd.s : '00'}</b><span>վայրկյան</span></div>
        </div>
      )}
    </section>
  )
}
