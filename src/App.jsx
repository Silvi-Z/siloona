import { lazy, Suspense, useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { langOf, savedLang, stripLang, withLang } from './site/i18n'
import './styles.css'
import SiteLayout from './site/SiteLayout'
import Home from './site/pages/Home'
import Invitations from './site/pages/Invitations'
import InvitationCards from './site/pages/InvitationCards'
import About from './site/pages/About'
import Login from './site/pages/Login'
import Legal from './site/pages/Legal'
import { CUSTOMER_DASHBOARD } from './site/features'

// Lazy-loaded: each invitation design can be its own heavy, self-styled
// bundle (fonts, animation, generated SVG). Without this, visiting any
// ordinary site page would download every invitation's JS/CSS up front.
const InvitationPreview = lazy(() => import('./site/pages/InvitationPreview'))
const Checkout = lazy(() => import('./site/checkout/Checkout'))
const CheckoutResult = lazy(() => import('./site/checkout/CheckoutResult'))
const SimulatedGateway = lazy(() => import('./site/checkout/SimulatedGateway'))
const SharedInvitation = lazy(() => import('./site/pages/SharedInvitation'))
const MyOrders = lazy(() => import('./site/pages/MyOrders'))

// Every page opens at the top. Lives here, not in SiteLayout, so the
// full-page invitation routes (rendered outside SiteLayout) are covered
// too — otherwise a preview opened from the gallery would inherit the
// gallery's scroll position and land mid-invitation.
function ScrollToTop() {
  const { pathname } = useLocation()
  // Switching language keeps the reader where they are on the page.
  const page = stripLang(pathname)
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [page])
  return null
}

// <html lang> follows the address's language; and someone who chose
// Russian or English before is taken there when they open the home page
// (or come back from a payment) at the plain Armenian address.
function LangSync() {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const lang = langOf(pathname)
  useLayoutEffect(() => { document.documentElement.lang = lang }, [lang])
  useLayoutEffect(() => {
    const saved = savedLang()
    if (lang === 'hy' && saved && saved !== 'hy' && (pathname === '/' || pathname === '/checkout/result')) {
      navigate(withLang(saved, pathname + search + hash), { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// The site's pages, the same under '', '/ru' and '/en'.
const SITE_PAGES = [
  ['/', <Home />],
  ['/invitations', <Invitations />],
  ['/invitation-cards', <InvitationCards />],
  ['/about', <About />],
  ['/terms', <Legal doc="terms" />],
  ['/privacy', <Legal doc="privacy" />],
  ['/refund', <Legal doc="refund" />],
  ['/login', CUSTOMER_DASHBOARD ? <Login /> : <Navigate to="/" replace />],
  ['/my-orders', <Suspense fallback={null}><MyOrders /></Suspense>],
  ['/checkout/result', <Suspense fallback={null}><CheckoutResult /></Suspense>],
  ['/checkout/:designId', <Suspense fallback={null}><Checkout /></Suspense>],
]
const PREFIXES = ['', '/ru', '/en']

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LangSync />
      <Routes>
        {/* Outside SiteLayout on purpose: a full-page invitation preview
            must carry no site header/footer. */}
        {PREFIXES.map((p) => (
          <Route
            key={`preview${p}`}
            path={`${p}/invitations/preview/:slug`}
            element={<Suspense fallback={null}><InvitationPreview /></Suspense>}
          />
        ))}

        {/* Invitations guests open: a paid one (/i/<code>) or a dashboard event's
            general link (/i/<slug>) and each guest's own (/i/<slug>/<token>).
            Full page, no site chrome. */}
        <Route
          path="/i/:code"
          element={<Suspense fallback={null}><SharedInvitation /></Suspense>}
        />
        <Route
          path="/i/:code/:token"
          element={<Suspense fallback={null}><SharedInvitation /></Suspense>}
        />

        {/* Payment simulator's stand-in "bank page" — no site chrome, like a real gateway. */}
        <Route
          path="/checkout/simulate"
          element={<Suspense fallback={null}><SimulatedGateway /></Suspense>}
        />

        <Route element={<SiteLayout />}>
          {PREFIXES.flatMap((p) => SITE_PAGES.map(([path, element]) => (
            <Route key={p + path} path={p + (path === '/' && p ? '' : path)} element={element} />
          )))}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
