// Small gold spark particles fired from the wax seal when it breaks.
// Appended to the given root (not document.body) so the invitation stays
// self-contained; the root must not have a transform/filter ancestor of
// its own, or position:fixed on these particles would be hijacked (see
// the mobile-nav backdrop-filter bug fixed earlier in this project).
export function spawnDust(root, x, y) {
  if (!root) return
  for (let i = 0; i < 16; i++) {
    const el = document.createElement('i')
    el.className = 'wdb-spark'
    const angle = Math.random() * 6.283
    const dist = 30 + Math.random() * 80
    el.style.cssText = `left:${x}px;top:${y}px;--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist - 20}px`
    root.appendChild(el)
    setTimeout(() => el.remove(), 1900)
  }
}
