import { Link } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { CUSTOMER_DASHBOARD } from './features'

// Siloona's profiles. TODO: put the real Instagram and Telegram links in
// href. One without a link isn't shown, nor is «Կապ» when none has one.
const SOCIAL = [
  {
    name: 'Instagram', href: '',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Telegram', href: '',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 4.2 3.6 10.8c-.8.3-.8 1.4 0 1.7l4.1 1.5 1.6 5.1c.2.7 1.1.9 1.6.4l2.4-2.2 4.4 3.2c.6.4 1.4.1 1.6-.6l3-14.5c.2-.9-.7-1.6-1.6-1.2Z" />
        <path d="m7.7 14 9.6-6.3-7 7.3" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const session = useSession()
  const social = SOCIAL.filter((x) => x.href)

  return (
    <footer className="site-footer" id="contact">
      <div className="wrap">
        <div className="foot-col">
          <h5>Siloona</h5>
          <span className="serif" style={{ fontSize: 15, color: 'var(--ink)' }}>
            Ամեն կարևոր պահ ունի իր պատմությունը
          </span>
        </div>

        <div className="foot-col">
          <h5>Ուղղություններ</h5>
          <Link to="/invitations">Հրավիրատոմսեր</Link>
          <Link to="/invitation-cards">Հրավերի քարտեր</Link>
          <Link to="/about">Մեր մասին</Link>
          <Link to="/my-orders">Իմ պատվերները</Link>
          {CUSTOMER_DASHBOARD && (session ? <a href="/dashboard">Վահանակ</a> : <Link to="/login">Մուտք</Link>)}
        </div>

        {social.length > 0 && (
          <div className="foot-col">
            <h5>Կապ</h5>
            <div className="social-row">
              {social.map((x) => (
                <a key={x.name} href={x.href} aria-label={x.name} title={x.name} target="_blank" rel="noopener noreferrer">{x.icon}</a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="foot-bottom">
        <span>© {year} Siloona</span>
        <span>Պատրաստված սիրով Հայաստանում</span>
      </div>
    </footer>
  )
}
