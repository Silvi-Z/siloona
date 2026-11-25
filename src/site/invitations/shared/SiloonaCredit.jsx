import { pick, useInvLang } from './invLang'

const TEXT = {
  hy: 'Հրավերը ստեղծված է Siloona-ում',
  ru: 'Приглашение создано в Siloona',
  en: 'Invitation made with Siloona',
}

// The quiet «made with Siloona» line at the very end of every invitation.
// It takes the design's own font and colour (inherit) and only softens
// them, so it belongs to the invitation rather than to the Siloona site —
// no logo, no motion. Each design places it as the last thing in its own
// page column; `className` lets a design adjust the spacing in its CSS.
export default function SiloonaCredit({ design, className = '', style }) {
  const lang = useInvLang()
  const href = `https://siloona.am${lang === 'hy' ? '' : '/' + lang}`
    + `?utm_source=invitation&utm_medium=footer&utm_campaign=${encodeURIComponent(design)}`
  return (
    <p className={`siloona-credit ${className}`.trim()} style={{ ...WRAP, ...style }}>
      <a href={href} target="_blank" rel="noopener" style={LINK}>{pick(TEXT, lang)}</a>
    </p>
  )
}

const WRAP = {
  // The bottom room keeps the line clear of the floating controls some
  // pages pin to the bottom corners (music button, preview language bar).
  margin: 0, padding: '24px 20px calc(76px + env(safe-area-inset-bottom, 0px))', textAlign: 'center',
  fontSize: 11, lineHeight: 1.4, letterSpacing: '.04em', fontWeight: 'inherit',
  fontStyle: 'normal', textTransform: 'none', opacity: 0.5,
  position: 'relative', zIndex: 1,
}
const LINK = { color: 'inherit', font: 'inherit', textDecoration: 'none' }
