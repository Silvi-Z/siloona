// Small request/response helpers so every /api function works the same on
// Vercel (which pre-parses req.body) and on the local Vite dev server
// (plain Node request, see vite.config.js). Files under api/_lib are not
// deployed as endpoints: Vercel skips paths that start with "_".

const MAX_BODY = 64 * 1024

export class HttpError extends Error {
  constructor(status, code, message, fields) {
    super(message || code)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

function parseBody(text, contentType = '') {
  if (!text) return {}
  if (contentType.includes('application/json')) {
    try { return JSON.parse(text) } catch { throw new HttpError(400, 'bad_json', 'Սխալ հարցում։') }
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(text))
  }
  try { return JSON.parse(text) } catch { return Object.fromEntries(new URLSearchParams(text)) }
}

export async function readBody(req) {
  const ct = String(req.headers['content-type'] || '')
  let pre
  try { pre = req.body } catch { throw new HttpError(400, 'bad_body', 'Սխալ հարցում։') }
  if (pre && typeof pre === 'object' && !Buffer.isBuffer(pre)) return pre
  if (typeof pre === 'string') return parseBody(pre, ct)
  if (Buffer.isBuffer(pre)) return parseBody(pre.toString('utf8'), ct)

  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > MAX_BODY) throw new HttpError(413, 'too_large', 'Հարցումը չափազանց մեծ է։')
    chunks.push(c)
  }
  return parseBody(Buffer.concat(chunks).toString('utf8'), ct)
}

// A raw (non-JSON) body, e.g. an uploaded photo, up to `max` bytes.
export async function readRaw(req, max) {
  let pre
  try { pre = req.body } catch { pre = undefined }
  let buf
  if (Buffer.isBuffer(pre)) buf = pre
  else if (typeof pre === 'string') buf = Buffer.from(pre, 'binary')
  else {
    const chunks = []
    let size = 0
    for await (const c of req) {
      size += c.length
      if (size > max) throw new HttpError(413, 'too_large', 'Լուսանկարը չափազանց մեծ է։')
      chunks.push(c)
    }
    buf = Buffer.concat(chunks)
  }
  if (buf.length > max) throw new HttpError(413, 'too_large', 'Լուսանկարը չափազանց մեծ է։')
  return buf
}

export function getQuery(req) {
  return Object.fromEntries(new URL(req.url, 'http://local').searchParams)
}

export function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

export function sendText(res, status, text) {
  res.statusCode = status
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(text)
}

export function redirect(res, location) {
  res.statusCode = 303
  res.setHeader('Location', location)
  res.setHeader('Cache-Control', 'no-store')
  res.end()
}

export function allow(req, methods) {
  if (!methods.includes(req.method)) {
    throw new HttpError(405, 'method_not_allowed', 'Մեթոդը թույլատրված չէ։')
  }
}

// Wraps a handler: known errors become a JSON body with an Armenian
// message the UI can show as-is; anything unexpected is logged and hidden.
export function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res)
    } catch (e) {
      if (e instanceof HttpError) {
        sendJson(res, e.status, { error: e.code, message: e.message, ...(e.fields ? { fields: e.fields } : {}) })
      } else {
        console.error('[api]', req.method, req.url, e)
        sendJson(res, 500, { error: 'server_error', message: 'Սերվերի սխալ։ Խնդրում ենք փորձել մի փոքր ուշ։' })
      }
    }
  }
}

// Public origin used to build gateway return URLs. PUBLIC_SITE_URL must be
// set in production: a Host header can be spoofed.
export function siteUrl(req) {
  const fixed = process.env.PUBLIC_SITE_URL
  if (fixed) return fixed.replace(/\/+$/, '')
  if (process.env.VERCEL_ENV === 'production') {
    throw new HttpError(503, 'site_url_missing', 'Վճարման համակարգը դեռ ամբողջությամբ կարգավորված չէ։')
  }
  const proto = req.headers['x-forwarded-proto'] || 'http'
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`
}

export function bearerToken(req) {
  const h = String(req.headers.authorization || '')
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null
}
