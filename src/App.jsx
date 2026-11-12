import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import SiteLayout from './site/SiteLayout'
import Home from './site/pages/Home'
import Invitations from './site/pages/Invitations'
import InvitationCards from './site/pages/InvitationCards'
import About from './site/pages/About'
import Login from './site/pages/Login'

// Lazy-loaded: each invitation design can be its own heavy, self-styled
// bundle (fonts, animation, generated SVG). Without this, visiting any
// ordinary site page would download every invitation's JS/CSS up front.
const InvitationPreview = lazy(() => import('./site/pages/InvitationPreview'))

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

        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/invitation-cards" element={<InvitationCards />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
