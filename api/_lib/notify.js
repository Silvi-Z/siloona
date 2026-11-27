import { addonName } from '../../src/site/addons.js'

// Tells Siloona about new orders, custom-design requests and payments in
// Telegram — optional: set TELEGRAM_BOT_TOKEN (from @BotFather) and
// TELEGRAM_CHAT_ID (your chat or group) to turn it on. Without them it
// does nothing. A failure here never breaks the request that caused it.

const TIMEOUT_MS = 3500

export const notifyEnabled = () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)

export async function notify(text) {
  if (!notifyEnabled()) return false
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      signal: ctrl.signal,
    })
    if (!r.ok) console.error('[notify] telegram answered', r.status)
    return r.ok
  } catch (e) {
    console.error('[notify] not sent:', e.message)
    return false
  } finally {
    clearTimeout(timer)
  }
}

const amd = (n) => (n == null ? 'գինը ճշտվում է' : `${Number(n).toLocaleString('ru-RU')} ֏`)

// The add-ons chosen at checkout (orders.addons), one per line.
function addonLines(addons) {
  if (!Array.isArray(addons) || !addons.length) return []
  return ['➕ Հավելումներ՝', ...addons.map((a) => `   · ${addonName(a.id)} — ${amd(a.price)}`)]
}

export function orderText(order, siteUrl) {
  const custom = order.customization?.request === 'custom'
  const lines = [
    custom ? `✳️ Նոր հայտ՝ անհատական դիզայն · № ${order.order_number}` : `🆕 Նոր պատվեր № ${order.order_number}`,
    `👤 ${order.customer_name}`,
    `📞 ${order.customer_phone}`,
    order.customer_contact ? `💬 Կապ՝ ${order.customer_contact}` : '',
    order.customer_email ? `✉️ ${order.customer_email}` : '',
    custom ? `Միջոցառում՝ ${order.customization.eventType || '—'}` : `Դիզայն՝ ${order.design_id} · ${order.design_option}`,
    order.customization?.names ? `Անուններ՝ ${order.customization.names}` : '',
    order.customization?.eventDate ? `Ամսաթիվ՝ ${order.customization.eventDate}` : '',
    custom && order.customization.notes ? `Գաղափարը՝ ${order.customization.notes.slice(0, 300)}` : '',
    ...addonLines(order.addons),
    `Գումար՝ ${amd(order.amount)}`,
    siteUrl ? `${siteUrl}/dashboard#orders` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

export function paymentText(order, tx, status) {
  const what = status === 'paid' ? '✅ Վճարված' : '↩️ Վերադարձված'
  const test = tx.provider === 'test' ? ' (թեստ, իրական գումար չկա)' : ''
  return `${what}${test} · պատվեր № ${order.order_number}\n${order.customer_name} · ${amd(order.amount)} · ${tx.provider}`
}
