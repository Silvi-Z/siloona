import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { HttpError } from './http.js'

// All database access for orders/payments. The production store talks to
// Supabase with the service-role key (server only — it bypasses RLS, so it
// must never be given a VITE_ prefix or reach the browser). Tests swap in
// another store with the same methods through setStore().

let override = null
let cached = null

export function setStore(store) { override = store }

export function getStore() {
  if (override) return override
  if (cached) return cached
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new HttpError(503, 'orders_not_configured', 'Պատվերների համակարգը դեռ կարգավորված չէ։ Գրեք մեզ Instagram կամ Telegram-ում։')
  }
  cached = createSupabaseStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }))
  return cached
}

// Exceptions raised inside the SQL functions (supabase/payments.sql),
// turned into errors the customer can read.
const SQL_ERRORS = {
  order_already_paid: [409, 'Այս պատվերն արդեն վճարված է։'],
  order_has_no_amount: [409, 'Այս պատվերի գինը դեռ ճշտվում է, առցանց վճարումը հասանելի կլինի գնի հաստատումից հետո։'],
  order_cancelled: [409, 'Այս պատվերը չեղարկված է։'],
  too_many_attempts: [429, 'Վճարման փորձերի քանակը սպառված է։ Խնդրում ենք կապվել մեզ հետ։'],
  order_not_found: [404, 'Պատվերը չի գտնվել։'],
}

export function mapSqlError(err) {
  const msg = String(err?.message || err)
  for (const [code, [status, text]] of Object.entries(SQL_ERRORS)) {
    if (msg.includes(code)) return new HttpError(status, code, text)
  }
  return err instanceof Error ? err : new Error(msg)
}

function must({ data, error }) {
  if (error) throw mapSqlError(error)
  return data
}

export function createSupabaseStore(db) {
  return {
    async insertOrder(row) {
      const { data, error } = await db.from('orders').insert(row).select().single()
      if (error?.code === '23505' && String(error.message).includes('client_ref')) return { conflict: true }
      if (error) throw mapSqlError(error)
      return { order: data }
    },
    getOrder: async (id) => must(await db.from('orders').select('*').eq('id', id).maybeSingle()),
    getOrderByClientRef: async (ref) => must(await db.from('orders').select('*').eq('client_ref', ref).maybeSingle()),
    updateOrder: async (id, patch) => must(await db.from('orders').update(patch).eq('id', id).select().single()),

    listTransactions: async (orderId) => must(await db.from('payment_transactions').select('*').eq('order_id', orderId).order('created_at')),
    getTransaction: async (id) => must(await db.from('payment_transactions').select('*').eq('id', id).maybeSingle()),
    findTransaction: async (provider, merchantRef) =>
      must(await db.from('payment_transactions').select('*').eq('provider', provider).eq('merchant_ref', merchantRef).maybeSingle()),
    updateTransaction: async (id, patch) => must(await db.from('payment_transactions').update(patch).eq('id', id).select().single()),

    createAttempt: async (orderId, provider) => must(await db.rpc('create_payment_attempt', { p_order: orderId, p_provider: provider })),
    applyStatus: async (txId, status, patch, source, actor = null) =>
      must(await db.rpc('apply_payment_status', { p_tx: txId, p_status: status, p_patch: patch || {}, p_source: source, p_actor: actor })),
    async logEvent(ev) {
      const { error } = await db.from('payment_events').insert({ payload: {}, ...ev })
      if (error) console.error('[payments] could not log event', ev.kind, error.message)
    },

    getInvitationByCode: async (code) => must(await db.from('invitations').select('*').eq('code', code).maybeSingle()),
    getInvitationByOrder: async (orderId) => must(await db.from('invitations').select('*').eq('order_id', orderId).maybeSingle()),
    async createInvitation(row) {
      const { error } = await db.from('invitations').insert(row)
      if (error && error.code !== '23505') throw mapSqlError(error)
      return must(await db.from('invitations').select('*').eq('order_id', row.order_id).maybeSingle())
    },
    insertRsvp: async (row) => must(await db.from('invitation_rsvps').insert(row).select().single()),
    listRsvps: async (invitationId) => must(await db.from('invitation_rsvps').select('guest_name, status, plus, note, created_at').eq('invitation_id', invitationId).order('created_at', { ascending: false }).limit(1000)),

    // A dashboard event by its invitation link slug (the event id, or the
    // slug saved in its invitation settings).
    async getEventBySlug(slug) {
      const cols = 'id, type, title, event_date, data'
      const byId = must(await db.from('events').select(cols).eq('id', slug).maybeSingle())
      if (byId) return byId
      return must(await db.from('events').select(cols).eq('data->inv->>slug', slug).limit(1).maybeSingle())
    },
    insertReply: async (row) => must(await db.from('event_replies').insert(row).select().single()),

    // true while the caller is under the limit (supabase/guest-links.sql).
    // If the limiter itself is unavailable, requests go through.
    async rateLimit(key, windowSeconds, max) {
      const { data, error } = await db.rpc('hit_rate_limit', { p_key: key, p_window_seconds: windowSeconds, p_max: max })
      if (error) { console.error('[rate-limit] unavailable:', error.message); return true }
      return data !== false
    },

    // Customer photos for their invitation (the public «invitation-photos»
    // bucket, supabase/payments.sql). Returns the photo's public address.
    async savePhoto(buf, type) {
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type]
      const name = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`
      const bucket = db.storage.from('invitation-photos')
      const { error } = await bucket.upload(name, buf, { contentType: type, upsert: false, cacheControl: '31536000' })
      if (error) throw new Error(`photo upload failed: ${error.message}`)
      return bucket.getPublicUrl(name).data.publicUrl
    },

    async getUser(token) {
      const { data, error } = await db.auth.getUser(token)
      return error || !data?.user ? null : { id: data.user.id, email: data.user.email }
    },
    async isAdmin(userId) {
      const data = must(await db.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle())
      return !!data
    },
  }
}
