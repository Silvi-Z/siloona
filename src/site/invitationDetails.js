// The details a design needs to become a customer's own invitation — what
// checkout asks for in «Հրավերի մանրամասներ», what the order stores
// (orders.customization.details) and what the public /i/:code page turns
// back into the design's content.
//
// No per-design lists: each design's prefill mapping (invitationPrefill.js)
// is run once with marker values, which shows which event details the
// design uses and where it puts them; the design's own editor sections
// (sections.js) give the labels and grouping. A few more personal fields
// the event shape doesn't cover (godparents, contact phone, city) are taken
// from the sections directly ("extras").
import { PREFILL, prefillFromEvent } from './invitationPrefill'
import { INVITATION_DEFAULTS, INVITATION_SECTIONS } from './invitationDefaults'
import { deepMerge, diffData, getByPath, setByPath } from './invitations/shared/pathUtils'

const M = (k) => `⟦${k}⟧`
const MARKER = /⟦([^⟧]+)⟧/g
const PROBE_DATE = '2031-01-02'

const probeEvent = (withDeadline) => ({
  title: M('title'), company: M('company'),
  person1: { first: M('p1') }, person2: { first: M('p2') },
  celebrant: { first: M('one'), age: M('age') }, child: { first: M('child') },
  parents: { father: M('father'), mother: M('mother') },
  date: new Date(2031, 0, 2), time: '07:08',
  locations: [0, 1].map((i) => ({ name: M(`place${i}.name`), address: M(`place${i}.address`), time: M(`place${i}.time`) })),
  schedule: [{ time: '13:14', title: M('schedule') }],
  inv: withDeadline ? { deadline: new Date(2033, 4, 6) } : {},
})

function leaves(v, path = [], out = []) {
  if (typeof v === 'string') out.push([path.join('.'), v])
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) leaves(x, [...path, k], out)
  return out
}

// A pattern that finds a name inside a phrase («Լիլիթը դառնում է»,
// «Աննայի ընտանիք», «Ժամը 11:00»), allowing for the Armenian ending the
// prefill gave it: the marker got «ը»/«ի», a real name may get «ն»/«յի».
function phraseRe(probe, marker) {
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const [before, after] = probe.split(marker)
  let tail = esc(after)
  if (after.startsWith('ը')) tail = '(?:ը|ն)' + esc(after.slice(1))
  else if (after.startsWith('ի')) tail = '(?:յի|ի)' + esc(after.slice(1))
  return new RegExp(`^${esc(before)}(.+?)${tail}$`)
}

// Who the invitation is for, in the order asked. The label is the design's
// own when it shows the detail as a field of its own; otherwise (a name
// that only appears inside a sentence) this one.
const PEOPLE = {
  p1: 'Անուն', p2: 'Անուն', one: 'Անունը', child: 'Երեխայի անունը', age: 'Տարիքը',
  father: 'Ծնող 1', mother: 'Ծնող 2', company: 'Ընկերությունը', title: 'Միջոցառման անվանումը',
}
const EXTRA_LAST = new Set(['first', 'second', 'phone', 'telegram', 'city', 'place'])
const isExtra = (path) => !path.startsWith('title.') && (EXTRA_LAST.has(path.split('.').at(-1)) || path.endsWith('contacts.name'))

const cache = {}

// { fields: [{ key, path, label, type, required, group, groupTitle, re? }] }
// in the design's own section order, or null for an unknown design.
export function detailFields(slug) {
  if (slug in cache) return cache[slug]
  const fn = PREFILL[slug]
  const sections = INVITATION_SECTIONS[slug]
  if (!fn || !sections) return (cache[slug] = null)
  const defaults = INVITATION_DEFAULTS[slug]

  const out = leaves(fn(probeEvent(true)))
  const withoutDeadline = new Set(leaves(fn(probeEvent(false))).map(([p]) => p))
  const direct = {}
  const phrase = {}
  const phraseAll = {} // every sentence holding one name: { key: [{ path, re }] }
  let datePath = null
  let schedulePath = null
  let deadlinePath = null
  for (const [path, v] of out) {
    if (!withoutDeadline.has(path)) { deadlinePath ??= path; continue }
    if (v.startsWith(PROBE_DATE)) { datePath ??= path; continue }
    const found = [...v.matchAll(MARKER)]
    for (const m of found) {
      const key = m[1]
      if (key === 'schedule') schedulePath ??= path.split('.').slice(0, -2).join('.')
      else if (v === m[0]) direct[key] ??= path
      else if (found.length === 1) {
        phrase[key] ??= { path, re: phraseRe(v, m[0]) }
        ;(phraseAll[key] ||= []).push({ path, re: phraseRe(v, m[0]) })
      }
    }
  }

  // Which other content is built from each person's name or age (a
  // sentence, a signature, a monogram letter): the paths that change when
  // only that one detail changes. Used to keep them in step (syncNames).
  const derived = {}
  const base = new Map(out)
  for (const key of Object.keys(PEOPLE)) {
    const ev = probeEvent(true)
    const alt = 'Zalt' // a different first letter too, so monograms show up
    if (key === 'p1') ev.person1.first = alt
    else if (key === 'p2') ev.person2.first = alt
    else if (key === 'one') ev.celebrant.first = alt
    else if (key === 'age') ev.celebrant.age = alt
    else if (key === 'child') ev.child.first = alt
    else if (key === 'father') ev.parents.father = alt
    else if (key === 'mother') ev.parents.mother = alt
    else ev[key] = alt
    const paths = leaves(fn(ev)).filter(([p, v]) => base.get(p) !== v).map(([p]) => p).filter((p) => p !== direct[key])
    if (paths.length) derived[key] = paths
  }

  // Where each content path sits in the design's editor.
  const info = {}
  sections.forEach((s, si) => {
    if (s.role) return
    s.fields.forEach((f, fi) => { info[f.path] = { label: f.label, section: s.id, title: s.title, order: si * 100 + fi } })
  })

  const fields = []
  const covered = new Set()
  const add = (f) => {
    const at = info[f.path] || {}
    covered.add(f.path)
    fields.push({ group: at.section || f.key, groupTitle: at.title || '', order: at.order ?? 9999, ...f, label: f.label || at.label || '' })
  }
  const pathOf = (k) => direct[k] || phrase[k]?.path

  for (const [key, fallback] of Object.entries(PEOPLE)) {
    const path = pathOf(key)
    if (path) add({ key, path, re: direct[key] ? undefined : phrase[key].re, label: direct[key] ? '' : fallback, type: 'text', required: true, inputMode: key === 'age' ? 'numeric' : undefined })
  }
  if (datePath) {
    add({ key: 'eventDate', path: datePath, label: 'Ամսաթիվ', type: 'date', required: true })
    add({ key: 'eventTime', path: datePath, label: 'Ժամ', type: 'time', required: true })
  }
  const places = [0, 1].filter((i) => pathOf(`place${i}.name`))
  for (const i of places) {
    const namePath = pathOf(`place${i}.name`)
    const base = namePath.split('.').slice(0, -1).join('.')
    // Two places in one editor section («Վայրերը»): name each group after
    // the place itself («Պսակադրություն», «Հանդիսություն»).
    const own = getByPath(defaults, `${base}.label`) || getByPath(defaults, `${base}.title`)
    const sec = info[namePath]
    const group = { group: `place${i}`, groupTitle: places.length > 1 && own ? own : sec?.title || 'Վայրը' }
    // The address is asked too: it is what the map link searches.
    for (const [part, required] of [['name', true], ['time', true], ['address', true]]) {
      const key = `place${i}.${part}`
      const path = pathOf(key)
      if (!path) continue
      add({ ...group, key, path, re: direct[key] ? undefined : phrase[key].re, type: part === 'time' ? 'time' : 'text', required, order: (sec?.order ?? 9000) + i * 10 + (part === 'name' ? 0 : part === 'time' ? 1 : 2) })
    }
  }
  if (schedulePath) add({ key: 'schedule', path: schedulePath, label: 'Ծրագիր', type: 'schedule' })
  if (deadlinePath) add({ key: 'deadline', path: deadlinePath, label: 'Պատասխանել մինչև', type: 'date', noReverse: true })

  sections.forEach((s) => {
    if (s.role) return
    for (const f of s.fields) {
      if (f.type !== 'text' || covered.has(f.path) || !isExtra(f.path)) continue
      add({ key: `x:${f.path}`, path: f.path, type: f.path.endsWith('phone') ? 'tel' : 'text' })
    }
  })

  fields.sort((a, b) => a.order - b.order)
  return (cache[slug] = { fields, derived, direct, phraseAll })
}

// The fields grouped as the design's editor groups them, for display.
export function detailGroups(slug) {
  const spec = detailFields(slug)
  if (!spec) return []
  const groups = []
  for (const f of spec.fields) {
    const last = groups.at(-1)
    if (last && (last.id === f.group || (f.groupTitle && last.title === f.groupTitle))) last.fields.push(f)
    else groups.push({ id: f.group, title: f.groupTitle, fields: [f] })
  }
  return groups
}

const str = (v) => (typeof v === 'string' ? v.trim() : '')
export const detailValue = (d, f) => (f.key.startsWith('x:') ? str(d?.extra?.[f.path]) : str(d?.[f.key]))
const hasSchedule = (d) => (d?.schedule || []).some((r) => str(r.title))

// Required fields still empty (keys), for validation.
export function missingDetails(slug, d) {
  const spec = detailFields(slug)
  return spec ? spec.fields.filter((f) => f.required && !detailValue(d, f)).map((f) => f.key) : []
}

export function eventFromDetails(d = {}) {
  const s = (k) => str(d[k])
  const date = /^\d{4}-\d{2}-\d{2}$/.test(s('eventDate')) ? new Date(`${s('eventDate')}T00:00:00`) : undefined
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(s('deadline')) ? new Date(`${s('deadline')}T00:00:00`) : undefined
  const locations = [0, 1].map((i) => ({
    name: s(`place${i}.name`),
    // The map link searches the address — with none, the venue's name.
    address: s(`place${i}.address`) || s(`place${i}.name`),
    time: s(`place${i}.time`) || undefined,
  }))
  while (locations.length && !locations.at(-1).name) locations.pop()
  return {
    title: s('title'), company: s('company'),
    person1: { first: s('p1') }, person2: { first: s('p2') },
    celebrant: { first: s('one'), age: s('age') }, child: { first: s('child') },
    parents: { father: s('father'), mother: s('mother') },
    date, time: /^\d{2}:\d{2}$/.test(s('eventTime')) ? s('eventTime') : undefined,
    locations,
    schedule: (d.schedule || []).filter((r) => str(r.title)).map((r) => ({ time: str(r.time), title: str(r.title), ...(r.icon ? { icon: r.icon } : {}) })),
    inv: { deadline },
  }
}

// The design content these details make. An optional detail left empty is
// cleared rather than left showing the demo's (a demo phone number or
// godparent on a real invitation) — except for details read back from the
// customer's own edited invitation, where the edits already decide.
export function contentFromDetails(slug, d = {}) {
  const spec = detailFields(slug)
  if (!spec) return {}
  // Worked on the full content (so a path into a list — a phone in
  // rsvp.contacts.0 — keeps the list), then reduced back to the changes.
  const defaults = INVITATION_DEFAULTS[slug]
  let c = deepMerge(defaults, prefillFromEvent(slug, eventFromDetails(d)))
  const clearEmpty = d.source !== 'editor'
  const dropItems = [] // list items whose only detail was left empty (a 2nd «call» button with no number)
  for (const f of spec.fields) {
    if (f.key.startsWith('x:')) {
      const v = detailValue(d, f)
      const item = /^(.*)\.(\d+)\.[^.]+$/.exec(f.path)
      if (!v && clearEmpty && item) dropItems.push([item[1], Number(item[2])])
      else if (v || clearEmpty) c = setByPath(c, f.path, v)
    } else if (f.type === 'schedule') {
      if (!hasSchedule(d) && clearEmpty) c = setByPath(c, f.path, [])
    } else if (clearEmpty && !detailValue(d, f) && f.key !== 'eventDate' && f.key !== 'eventTime' && !f.key.endsWith('.address')) {
      c = setByPath(c, f.path, '')
    }
  }
  for (const [list, i] of dropItems.sort((a, b) => b[1] - a[1])) {
    const arr = getByPath(c, list)
    if (Array.isArray(arr)) c = setByPath(c, list, arr.filter((_, j) => j !== i))
  }
  return diffData(defaults, c) || {}
}

// The reverse: the details as they stand in a design's content — the demo
// (for placeholders) or what the customer edited on the site.
export function detailsFromContent(slug, content) {
  const spec = detailFields(slug)
  if (!spec || !content) return null
  const d = { extra: {} }
  for (const f of spec.fields) {
    if (f.noReverse) continue
    const raw = getByPath(content, f.path)
    if (f.type === 'schedule') {
      // (a design's own extras on a row, like wd-mono's icon, ride along)
      d.schedule = Array.isArray(raw) ? raw.map((r) => ({ time: str(r?.time), title: str(r?.label ?? r?.title), ...(r?.icon ? { icon: r.icon } : {}) })) : []
      continue
    }
    const v = str(raw)
    if (f.key === 'eventDate' || f.key === 'eventTime') {
      const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(v)
      d[f.key] = !m ? '' : f.key === 'eventDate' ? m[1] : m[2] && m[2] !== '00:00' ? m[2] : ''
    } else if (f.key.startsWith('x:')) {
      d.extra[f.path] = v
    } else {
      const got = f.re ? (f.re.exec(v)?.[1] || '').trim() : v
      d[f.key] = f.type === 'time' ? (/(\d{1,2}:\d{2})/.exec(got)?.[1]?.padStart(5, '0') || '') : got
    }
  }
  return d
}

// One line for the order's «names» (what the admin list and page title
// show): the couple, the celebrant, or the company.
export function namesFromDetails(d = {}) {
  const s = (k) => str(d[k])
  if (s('p1') && s('p2')) return `${s('p1')} & ${s('p2')}`
  if (s('father') && s('mother') && s('child')) return s('child')
  return s('one') || s('child') || s('p1') || s('company') || s('title') || ''
}

export function venueFromDetails(d = {}) {
  return [str(d['place0.name']), str(d['place0.address'])].filter(Boolean).join(', ')
}

// After an edit: if a person's name (or the age) changed, rewrite the
// sentences built from it — «Լիլիթը դառնում է» → «Աննան դառնում է»,
// «Լիլիթի ընտանիք» → «Աննայի ընտանիք», the monogram letter — with the right
// Armenian ending. A sentence the customer has written themselves (no
// longer what the old name would give) is left alone.
export function syncNames(slug, prev, next) {
  const spec = detailFields(slug)
  if (!spec || !Object.keys(spec.derived).length) return next
  // A sentence with the name was edited («Աննան դառնում է»): take the new
  // name from it, so the name itself (and the rest below) follows.
  for (const [k, list] of Object.entries(spec.phraseAll)) {
    const own = spec.direct[k]
    if (!own || !PEOPLE[k]) continue
    for (const { path, re } of list) {
      const v = getByPath(next, path)
      if (v === getByPath(prev, path) || typeof v !== 'string') continue
      const name = re.exec(v.trim())?.[1]?.trim()
      if (name && getByPath(next, own) === getByPath(prev, own)) next = setByPath(next, own, name)
    }
  }
  const a = detailsFromContent(slug, prev)
  const b = detailsFromContent(slug, next)
  const changed = Object.keys(spec.derived).filter((k) => str(a[k]) !== str(b[k]) && str(b[k]))
  if (!changed.length) return next
  const was = prefillFromEvent(slug, eventFromDetails(a))
  const now = prefillFromEvent(slug, eventFromDetails(b))
  let out = next
  for (const k of changed) {
    for (const p of spec.derived[k]) {
      const cur = getByPath(prev, p)
      const v = getByPath(now, p)
      if (typeof v === 'string' && cur === getByPath(was, p) && getByPath(next, p) === cur) out = setByPath(out, p, v)
    }
  }
  return out
}

// The editing wizard's answers applied to the content being edited: only
// what the details decide is replaced, the customer's other edits stay.
export function applyDetails(slug, content, d) {
  const spec = detailFields(slug)
  if (!spec) return content
  const gen = deepMerge(INVITATION_DEFAULTS[slug], contentFromDetails(slug, d))
  const paths = new Set(spec.fields.map((f) => f.path))
  // everything the prefill writes (sentences, monograms, place lists…)
  const walk = (v, path) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k, x] of Object.entries(v)) walk(x, [...path, k])
    else if (path.length) paths.add(path.join('.'))
  }
  walk(prefillFromEvent(slug, eventFromDetails(d)), [])
  let out = content
  for (const p of paths) {
    const v = getByPath(gen, p)
    if (v !== undefined) out = setByPath(out, p, v)
  }
  return out
}
