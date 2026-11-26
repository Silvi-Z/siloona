// Persists per-invitation edits in localStorage, namespaced by slug, so
// the "future invitation editor" required by the catalog integration has
// somewhere real to write to without needing a backend yet. Swapping
// this for an API call later is a one-file change — nothing in the
// component tree needs to know where edits are stored.
const KEY_PREFIX = 'siloona:invitation-edit:'
// One set of edits per invitation language: the Armenian ones keep the
// original key; Russian / English go under «slug@ru» / «slug@en».
const keyOf = (slug, lang) => KEY_PREFIX + (lang && lang !== 'hy' ? `${slug}@${lang}` : slug)

export function loadOverride(slug, lang) {
  try {
    const raw = localStorage.getItem(keyOf(slug, lang))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveOverride(slug, data, lang) {
  try {
    localStorage.setItem(keyOf(slug, lang), JSON.stringify(data))
  } catch {
    // Storage full or unavailable (private browsing) — edits still work
    // for the current session, they just won't persist across reloads.
  }
}

export function clearOverride(slug, lang) {
  try {
    localStorage.removeItem(keyOf(slug, lang))
  } catch {
    // ignore
  }
}
