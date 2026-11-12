import { Link } from 'react-router-dom'
import { useSession } from '../lib/useSession'

export default function Footer() {
  const year = new Date().getFullYear()
  const session = useSession()

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
          {session ? <a href="/dashboard">Վահանակ</a> : <Link to="/login">Մուտք</Link>}
        </div>

        <div className="foot-col">
          <h5>Կապ</h5>
          <div className="social-row">
            <a href="#" aria-label="Instagram" title="Instagram">IG</a>
            <a href="#" aria-label="Telegram" title="Telegram">TG</a>
          </div>
        </div>
      </div>

      <div className="foot-bottom">
        <span>© {year} Siloona</span>
        <span>Պատրաստված սիրով Հայաստանում</span>
      </div>
    </footer>
  )
}
