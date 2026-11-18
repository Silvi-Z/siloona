import { allow, handler, sendJson } from '../_lib/http.js'
import { availableMethods } from '../_lib/providers/index.js'

// GET /api/checkout/config — which payment methods are switched on.
// Reveals nothing secret: only method ids whose credentials are set.
export default handler(async (req, res) => {
  allow(req, ['GET'])
  const ordersEnabled = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)
  sendJson(res, 200, { ordersEnabled, methods: ordersEnabled ? availableMethods() : [] })
})
