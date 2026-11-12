// Minimal dot-path get/set over plain objects and arrays, e.g.
// "schedule.0.label" or "dressCode.colors.1". Shared by every invitation
// design's Editable fields.
export function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

// Returns a new object with the value at `path` replaced — only the
// objects/arrays along the path are cloned, everything else is shared,
// so this is cheap to call on every keystroke's blur.
export function setByPath(obj, path, value) {
  const keys = path.split('.')
  const clone = Array.isArray(obj) ? obj.slice() : { ...obj }
  let cursor = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const next = cursor[key]
    cursor[key] = Array.isArray(next) ? next.slice() : { ...next }
    cursor = cursor[key]
  }
  cursor[keys[keys.length - 1]] = value
  return clone
}

// Deep-merges `override` onto `base`, only for plain objects/arrays —
// used to apply a saved partial edit on top of an invitation's defaults.
export function deepMerge(base, override) {
  if (override == null) return base
  // Lists (schedule rows, colors…) are replaced whole, never index-merged —
  // otherwise a list the user lengthened or shortened would be cut back to
  // the default's length. diffData stores arrays whole for the same reason.
  if (Array.isArray(override)) return override
  if (isPlainObject(base) && isPlainObject(override)) {
    const out = { ...base }
    for (const key of Object.keys(override)) {
      out[key] = key in base ? deepMerge(base[key], override[key]) : override[key]
    }
    return out
  }
  return override
}

// The inverse of deepMerge: only what `next` changed relative to `base`,
// or undefined if nothing did — deepMerge(base, diffData(base, next))
// reproduces `next`. Arrays are compared whole. Lets a host store just
// the user's actual edits, so un-edited content (e.g. bundled asset URLs,
// values derived from event details) keeps tracking its live source.
export function diffData(base, next) {
  if (isPlainObject(base) && isPlainObject(next)) {
    const out = {}
    for (const key of Object.keys(next)) {
      const d = key in base ? diffData(base[key], next[key]) : next[key]
      if (d !== undefined) out[key] = d
    }
    return Object.keys(out).length ? out : undefined
  }
  return JSON.stringify(base) === JSON.stringify(next) ? undefined : next
}

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}
