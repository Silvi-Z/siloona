import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import SiteLayout from './site/SiteLayout'
import Home from './site/pages/Home'
import Invitations from './site/pages/Invitations'
import InvitationCards from './site/pages/InvitationCards'
import About from './site/pages/About'
import Login from './site/pages/Login'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Outside SiteLayout on purpose: a full-page invitation preview
            must carry no site header/footer. */}
        <Route
          path="/invitations/preview/:slug"
          element={<Suspense fallback={null}><InvitationPreview /></Suspense>}
        />

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
          <Route path="/" element={<Home />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/invitation-cards" element={<InvitationCards />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={CUSTOMER_DASHBOARD ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/my-orders" element={<Suspense fallback={null}><MyOrders /></Suspense>} />
          <Route path="/checkout/result" element={<Suspense fallback={null}><CheckoutResult /></Suspense>} />
          <Route path="/checkout/:designId" element={<Suspense fallback={null}><Checkout /></Suspense>} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
