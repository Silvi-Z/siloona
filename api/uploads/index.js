import { HttpError, allow, getQuery, handler, readRaw, sendJson } from '../_lib/http.js'
import { getStore } from '../_lib/store.js'
import { rateLimit } from '../_lib/guestLinks.js'

// Customer photos for their invitation, uploaded by the checkout when an
// order is placed (the editor shrinks them to ≤1600px JPEG first).
//   POST  body = the image itself (Content-Type image/jpeg|png|webp)
//         → { url } its public address, which goes into the order's content
//   GET   ?id=…  only for the local test/demo store, which keeps photos in
//         memory; in production photos are served by Supabase Storage.
// Only real JPEG / PNG / WebP files are accepted (checked by their first
// bytes, not by what the browser claims), at most 3 MB each.

const MAX = 3 * 1024 * 1024

function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

export default handler(async (req, res) => {
  allow(req, ['GET', 'POST'])
  const store = getStore()
  if (req.method === 'GET') {
    const photo = store.getPhoto ? await store.getPhoto(String(getQuery(req).id || '')) : null
    if (!photo) throw new HttpError(404, 'not_found', 'Լուսանկարը չի գտնվել։')
    res.statusCode = 200
    res.setHeader('Content-Type', photo.type)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    return res.end(photo.buf)
  }
  // Too big by its own declared size: refuse before reading, and close the
  // connection so the unread rest of the body can't confuse the next request.
  if (Number(req.headers['content-length']) > MAX) {
    res.setHeader('Connection', 'close')
    throw new HttpError(413, 'too_large', 'Լուսանկարը չափազանց մեծ է։')
  }
  await rateLimit(store, req, 'upload')
  const buf = await readRaw(req, MAX)
  const type = sniff(buf)
  if (!type) throw new HttpError(415, 'not_image', 'Ընտրեք JPG, PNG կամ WebP լուսանկար։')
  sendJson(res, 201, { url: await store.savePhoto(buf, type) })
})
