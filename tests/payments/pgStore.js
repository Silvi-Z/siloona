import fs from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

// Test-only store: the same methods as api/_lib/store.js, backed by an
// in-memory Postgres (PGlite) loaded with the REAL supabase/schema.sql and
// supabase/payments.sql, so the SQL state machine itself is what's tested.
// Supabase's auth schema and roles are stubbed just enough to load.

const STUB = `
  create schema if not exists auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create role anon; create role authenticated; create role service_role;
`

export const USERS = {
  admin: { id: '00000000-0000-4000-8000-00000000000a', token: 'admin-token', email: 'admin@test.local' },
  customer: { id: '00000000-0000-4000-8000-00000000000c', token: 'customer-token', email: 'customer@test.local' },
}

export async function createPgStore() {
  const photos = new Map()
  const db = new PGlite()
  const root = new URL('../../supabase/', import.meta.url)
  await db.exec(STUB)
  // gen_random_uuid() is built into Postgres 13+; PGlite has no pgcrypto to load.
  await db.exec(fs.readFileSync(new URL('schema.sql', root), 'utf8').replace(/create extension[^;]*;/i, ''))
  await db.exec(fs.readFileSync(new URL('payments.sql', root), 'utf8'))
  await db.exec(fs.readFileSync(new URL('guest-links.sql', root), 'utf8'))
  await db.exec(fs.readFileSync(new URL('seating.sql', root), 'utf8'))
  await db.exec(fs.readFileSync(new URL('order-events.sql', root), 'utf8'))
  await db.exec(fs.readFileSync(new URL('addons.sql', root), 'utf8'))
  for (const u of Object.values(USERS)) {
    await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, '{"mode":"org"}')`, [u.id, u.email])
  }
  await db.query('insert into admin_users (user_id) values ($1)', [USERS.admin.id])

  const one = async (sql, params) => (await db.query(sql, params)).rows[0] || null
  const many = async (sql, params) => (await db.query(sql, params)).rows
  const fix = (r) => r && Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : typeof v === 'bigint' ? Number(v) : v]))
  const JSONB = new Set(['customization', 'raw', 'payload', 'addons', 'features'])
  const update = async (table, id, patch) => {
    const keys = Object.keys(patch)
    const sets = keys.map((k, i) => `${k} = $${i + 2}${JSONB.has(k) ? '::jsonb' : ''}`).join(', ')
    const vals = keys.map((k) => (JSONB.has(k) ? JSON.stringify(patch[k]) : patch[k]))
    return fix(await one(`update ${table} set ${sets} where id = $1 returning *`, [id, ...vals]))
  }
  const sqlErr = (e) => { throw new Error(e.message) }

  const store = {
    db,
    async insertOrder(row) {
      const keys = Object.keys(row)
      const vals = keys.map((k) => (JSONB.has(k) ? JSON.stringify(row[k]) : row[k]))
      try {
        const r = await one(`insert into orders (${keys.join(', ')}) values (${keys.map((k, i) => `$${i + 1}${JSONB.has(k) ? '::jsonb' : ''}`).join(', ')}) returning *`, vals)
        return { order: fix(r) }
      } catch (e) {
        if (String(e.message).includes('client_ref')) return { conflict: true }
        throw e
      }
    },
    getOrder: async (id) => fix(await one('select * from orders where id = $1', [id])),
    getOrderByClientRef: async (ref) => fix(await one('select * from orders where client_ref = $1', [ref])),
    updateOrder: (id, patch) => update('orders', id, patch),
    listTransactions: async (orderId) => (await many('select * from payment_transactions where order_id = $1 order by created_at, merchant_ref', [orderId])).map(fix),
    getTransaction: async (id) => fix(await one('select * from payment_transactions where id = $1', [id])),
    findTransaction: async (provider, ref) => fix(await one('select * from payment_transactions where provider = $1 and merchant_ref = $2', [provider, ref])),
    updateTransaction: (id, patch) => update('payment_transactions', id, patch),
    createAttempt: async (orderId, provider) => fix(await one('select * from create_payment_attempt($1, $2)', [orderId, provider]).catch(sqlErr)),
    applyStatus: async (txId, status, patch, source, actor = null) =>
      (await one('select apply_payment_status($1, $2, $3::jsonb, $4, $5) as r', [txId, status, JSON.stringify(patch || {}), source, actor])).r,
    async logEvent(ev) {
      await db.query('insert into payment_events (order_id, transaction_id, source, kind, payload, actor) values ($1, $2, $3, $4, $5::jsonb, $6)',
        [ev.order_id || null, ev.transaction_id || null, ev.source, ev.kind, JSON.stringify(ev.payload || {}), ev.actor || null])
    },
    getInvitationByCode: async (code) => fix(await one('select * from invitations where code = $1', [code])),
    getInvitationByOrder: async (orderId) => fix(await one('select * from invitations where order_id = $1', [orderId])),
    async createInvitation(row) {
      await db.query('insert into invitations (code, order_id, design_id) values ($1, $2, $3) on conflict do nothing', [row.code, row.order_id, row.design_id])
      return fix(await one('select * from invitations where order_id = $1', [row.order_id]))
    },
    insertRsvp: async (r) => fix(await one('insert into invitation_rsvps (invitation_id, guest_name, status, plus, note) values ($1, $2, $3, $4, $5) returning *', [r.invitation_id, r.guest_name, r.status, r.plus, r.note])),
    listRsvps: async (invitationId) => (await many('select guest_name, status, plus, note, created_at from invitation_rsvps where invitation_id = $1 order by id desc', [invitationId])).map(fix),
    rsvps: async (invitationId) => many('select guest_name, status, plus, note from invitation_rsvps where invitation_id = $1 order by id', [invitationId]),

    async getUser(token) {
      const u = Object.values(USERS).find((x) => x.token === token)
      return u ? { id: u.id, email: u.email } : null
    },
    isAdmin: async (userId) => !!(await one('select 1 from admin_users where user_id = $1', [userId])),

    // Dashboard events (published invitations) and what guests do with them
    async getEventBySlug(slug) {
      return fix(await one(`select id, owner_id, type, title, event_date, data from events where id = $1 or data -> 'inv' ->> 'slug' = $1 order by (id = $1) desc limit 1`, [slug]))
    },
    getOrderByEvent: async (eventId) => fix(await one('select * from orders where event_id = $1', [eventId])),
    insertReply: async (r) => fix(await one('insert into event_replies (event_id, guest_token, kind, guest_name, status, plus, note) values ($1, $2, $3, $4, $5, $6, $7) returning *', [r.event_id, r.guest_token ?? null, r.kind, r.guest_name ?? null, r.status ?? null, r.plus ?? null, r.note ?? null])),
    replies: async (eventId) => many('select guest_token, kind, guest_name, status, plus, note from event_replies where event_id = $1 order by id', [eventId]),
    getSeatingPlan: async (target) => {
      const [col, val] = Object.entries(target)[0]
      if (!['invitation_id', 'event_id'].includes(col)) throw new Error('bad seating target')
      return fix(await one(`select id, enabled, reveal_at from seating_plans where ${col} = $1`, [val]))
    },
    listSeats: async (planId) => many('select guest_name, table_label from seating where plan_id = $1', [planId]),
    // what scripts/import-seating.js does through Supabase's rpc()
    importSeating: async ({ invitation = null, event = null, revealAt = null, enabled = null, rows = null }) =>
      (await one('select import_seating($1, $2, $3, $4, $5::jsonb) as r', [invitation, event, revealAt, enabled, rows ? JSON.stringify(rows) : null])).r,
    rateLimit: async (key, windowSeconds, max) => (await one('select hit_rate_limit($1, $2, $3) as ok', [key, windowSeconds, max])).ok,

    // Photos kept in memory, served back by GET /api/uploads?id=…
    async savePhoto(buf, type) {
      const id = Math.random().toString(16).slice(2) + Date.now().toString(16)
      photos.set(id, { buf, type })
      return `/api/uploads?id=${id}`
    },
    getPhoto: async (id) => photos.get(id) || null,

    // what scripts/import-seating.js does after an import: the invitation gets the seating feature
    grantFeature: (invitationId, feature) => db.query('update invitations set features = features || $2::jsonb where id = $1 and not (features ? $3)', [invitationId, JSON.stringify([feature]), feature]),

    // test helpers
    events: async (orderId) => (await many('select source, kind from payment_events where order_id = $1 order by id', [orderId])),
  }
  // createAttempt wraps SQL errors the same way the Supabase store does.
  const { mapSqlError } = await import('../../api/_lib/store.js')
  const raw = store.createAttempt
  store.createAttempt = (...a) => raw(...a).catch((e) => { throw mapSqlError(e) })
  return store
}
