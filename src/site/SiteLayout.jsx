import { useLayoutEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ContactButton from './ContactButton'
import { useText } from './i18n'

const TITLE = {
  hy: 'Siloona — թվային հրավիրատոմսեր',
  ru: 'Siloona — цифровые приглашения',
  en: 'Siloona — digital invitations',
}

// Scroll-to-top on navigation is handled app-wide by <ScrollToTop/> in App.jsx.
export default function SiteLayout() {
  const title = useText(TITLE)
  useLayoutEffect(() => { document.title = title }, [title])
  return (
    <div className="siloona-site">
      <Header />
      <Outlet />
      <Footer />
      <ContactButton />
    </div>
  )
}
