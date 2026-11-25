import { Link } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { CUSTOMER_DASHBOARD } from './features'
import { CONTACTS, opensTab } from './contacts'
import ContactIcon from './ContactIcon'
import { useLang, useText } from './i18n'

const TEXT = {
  hy: {
    motto: 'Ամեն կարևոր պահ ունի իր պատմությունը', nav: 'Ուղղություններ', invitations: 'Հրավիրատոմսեր',
    cards: 'Հրավերի քարտեր', prices: 'Գներ', about: 'Մեր մասին', orders: 'Իմ պատվերները', login: 'Մուտք', dashboard: 'Վահանակ',
    contact: 'Կապ', write: 'Գրել մեզ', made: 'Պատրաստված սիրով Հայաստանում',
    legal: 'Իրավական տեղեկատվություն', terms: 'Պայմաններ', privacy: 'Գաղտնիություն', refund: 'Վերադարձ և չեղարկում',
  },
  ru: {
    motto: 'У каждого важного момента своя история', nav: 'Разделы', invitations: 'Приглашения',
    cards: 'Пригласительные открытки', prices: 'Цены', about: 'О нас', orders: 'Мои заказы', login: 'Вход', dashboard: 'Панель',
    contact: 'Связь', write: 'Написать нам', made: 'Сделано с любовью в Армении',
    legal: 'Правовая информация', terms: 'Условия', privacy: 'Конфиденциальность', refund: 'Возврат и отмена',
  },
  en: {
    motto: 'Every meaningful moment has its own story', nav: 'Explore', invitations: 'Invitations',
    cards: 'Invitation cards', prices: 'Prices', about: 'About', orders: 'My orders', login: 'Log in', dashboard: 'Dashboard',
    contact: 'Contact', write: 'Write to us', made: 'Made with love in Armenia',
    legal: 'Legal', terms: 'Terms', privacy: 'Privacy', refund: 'Refunds and cancellation',
  },
}

export default function Footer() {
  const year = new Date().getFullYear()
  const session = useSession()
  const { to } = useLang()
  const t = useText(TEXT)
  // «Գրել մեզ» opens a chat — there is no contact page.
  const chat = CONTACTS.find((c) => c.id === 'telegram') || CONTACTS[0]

  return (
    <footer className="site-footer" id="contact">
      <div className="wrap">
        <div className="foot-col">
          <h5>Siloona</h5>
          <span className="serif" style={{ fontSize: 15, color: 'var(--ink)' }}>{t.motto}</span>
        </div>

        <div className="foot-col">
          <h5>{t.nav}</h5>
          <Link to={to('/invitations')}>{t.invitations}</Link>
          <Link to={to('/invitation-cards')}>{t.cards}</Link>
          <Link to={to('/#prices')}>{t.prices}</Link>
          <Link to={to('/about')}>{t.about}</Link>
          <Link to={to('/my-orders')}>{t.orders}</Link>
          {CUSTOMER_DASHBOARD && (session ? <a href="/dashboard">{t.dashboard}</a> : <Link to={to('/login')}>{t.login}</Link>)}
        </div>

        {CONTACTS.length > 0 && (
          <div className="foot-col">
            <h5>{t.contact}</h5>
            {chat && <a href={chat.href} target="_blank" rel="noopener noreferrer">{t.write}</a>}
            <div className="social-row">
              {CONTACTS.map((x) => (
                <a key={x.id} href={x.href} aria-label={x.name} title={x.name} {...(opensTab(x.href) && { target: '_blank', rel: 'noopener noreferrer' })}><ContactIcon id={x.id} /></a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="foot-bottom">
        <span>© {year} Siloona</span>
        <nav className="foot-legal" aria-label={t.legal}>
          <Link to={to('/terms')}>{t.terms}</Link>
          <Link to={to('/privacy')}>{t.privacy}</Link>
          <Link to={to('/refund')}>{t.refund}</Link>
        </nav>
        <span>{t.made}</span>
      </div>
    </footer>
  )
}
