import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { listOrders } from './checkout/checkoutApi'
import { CUSTOMER_DASHBOARD } from './features'
import { LANGS, LANG_LABELS, LANG_NAMES, rememberLang, stripLang, useLang, useText, withLang } from './i18n'

const TEXT = {
  hy: {
    home: 'Գլխավոր', invitations: 'Հրավիրատոմսեր', prices: 'Գներ', about: 'Մեր մասին', orders: 'Իմ պատվերները',
    login: 'Մուտք', dashboard: 'Վահանակ', open: 'Բացել ցանկը', close: 'Փակել ցանկը', lang: 'Լեզու',
  },
  ru: {
    home: 'Главная', invitations: 'Приглашения', prices: 'Цены', about: 'О нас', orders: 'Мои заказы',
    login: 'Вход', dashboard: 'Панель', open: 'Открыть меню', close: 'Закрыть меню', lang: 'Язык',
  },
  en: {
    home: 'Home', invitations: 'Invitations', prices: 'Prices', about: 'About', orders: 'My orders',
    login: 'Log in', dashboard: 'Dashboard', open: 'Open menu', close: 'Close menu', lang: 'Language',
  },
}

// Հայ · Рус · Eng — the same page in another language.
function LangSwitch({ className }) {
  const { pathname, search, hash } = useLocation()
  const { lang } = useLang()
  const t = useText(TEXT)
  const page = stripLang(pathname)
  return (
    <span className={`lang-switch ${className}`} role="group" aria-label={t.lang}>
      {LANGS.map((l) => (
        <Link
          key={l}
          to={withLang(l, page + search + hash)}
          hrefLang={l}
          lang={l}
          aria-label={LANG_NAMES[l]}
          aria-current={l === lang ? 'true' : undefined}
          className={l === lang ? 'on' : ''}
          onClick={() => rememberLang(l)}
        >
          {LANG_LABELS[l]}
        </Link>
      ))}
    </span>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const session = useSession()
  const { to } = useLang()
  const t = useText(TEXT)
  // «Իմ պատվերները» appears once this device has placed an order.
  const hasOrders = listOrders().length > 0
  const links = [
    { to: to('/'), label: t.home, end: true },
    { to: to('/invitations'), label: t.invitations },
    { to: to('/#prices'), label: t.prices, anchor: true },
    { to: to('/about'), label: t.about },
    ...(hasOrders ? [{ to: to('/my-orders'), label: t.orders }] : []),
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // «Գներ» is a place on the home page, not a page — a plain Link, so it
  // never shows as the current page.
  const item = (l) => (l.anchor
    ? <Link key={l.to} to={l.to}>{l.label}</Link>
    : <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>)

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-bar">
        <div className="wrap">
          <NavLink to={to('/')} className="wordmark">SILOONA</NavLink>

          <nav className="site-nav">
            {links.map(item)}
            {CUSTOMER_DASHBOARD && (session ? (
              <a target="_blank" href="/dashboard" className="nav-small">{t.dashboard}</a>
            ) : (
              <NavLink to={to('/login')} className="nav-small">{t.login}</NavLink>
            ))}
            <LangSwitch className="desk" />
          </nav>

          <button
            type="button"
            className={`menu-btn${menuOpen ? ' open' : ''}`}
            aria-label={menuOpen ? t.close : t.open}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        {links.map(item)}
        {CUSTOMER_DASHBOARD && (session ? (
          <a target="_blank" href="/dashboard" className="nav-small">{t.dashboard}</a>
        ) : (
          <NavLink to={to('/login')} className="nav-small">{t.login}</NavLink>
        ))}
        <LangSwitch className="mob" />
      </div>
    </header>
  )
}
