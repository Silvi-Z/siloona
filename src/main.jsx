import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

// Lazy-loaded so each route only pulls in its own CSS chunk — the
// marketing placeholder (styles.css) and the dashboard (dashboard.css)
// are separate design systems and must never leak into one another.
const App = lazy(() => import('./App'))
const Dashboard = lazy(() => import('./dashboard'))

const isDashboard = location.pathname.startsWith('/dashboard')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      {isDashboard ? <Dashboard /> : <App />}
    </Suspense>
  </React.StrictMode>,
)
