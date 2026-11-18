import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { listOrders } from './checkout/checkoutApi'

const LINKS = [
  { to: '/', label: 'Գլխավոր' },
  { to: '/invitations', label: 'Հրավիրատոմսեր' },
  { to: '/about', label: 'Մեր մասին' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const session = useSession()
  // «Իմ պատվերները» appears once this device has placed an order.
  const hasOrders = listOrders().length > 0
  const links = hasOrders ? [...LINKS, { to: '/my-orders', label: 'Իմ պատվերները' }] : LINKS

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-bar">
        <div className="wrap">
          <NavLink to="/" className="wordmark">SILOONA</NavLink>

          <nav className="site-nav">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
            {session ? (
              <a target="_blank" href="/dashboard" className="nav-cta">Վահանակ</a>
            ) : (
              <NavLink to="/login" className="nav-cta">Մուտք</NavLink>
            )}
          </nav>

          <button
            type="button"
            className={`menu-btn${menuOpen ? ' open' : ''}`}
            aria-label={menuOpen ? 'Փակել ցանկը' : 'Բացել ցանկը'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}>
            {l.label}
          </NavLink>
        ))}
        {session ? (
          <a target="_blank" href="/dashboard">Վահանակ</a>
        ) : (
          <NavLink to="/login">Մուտք</NavLink>
        )}
      </div>
    </header>
  )
}
