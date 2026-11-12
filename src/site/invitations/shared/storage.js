// Persists per-invitation edits in localStorage, namespaced by slug, so
// the "future invitation editor" required by the catalog integration has
// somewhere real to write to without needing a backend yet. Swapping
// this for an API call later is a one-file change — nothing in the
// component tree needs to know where edits are stored.
const KEY_PREFIX = 'siloona:invitation-edit:'

export function loadOverride(slug) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slug)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveOverride(slug, data) {
  try {
    localStorage.setItem(KEY_PREFIX + slug, JSON.stringify(data))
  } catch {
    // Storage full or unavailable (private browsing) — edits still work
    // for the current session, they just won't persist across reloads.
  }
}

export function clearOverride(slug) {
  try {
    localStorage.removeItem(KEY_PREFIX + slug)
  } catch {
    // ignore
  }
}
