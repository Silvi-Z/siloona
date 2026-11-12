import { useEffect } from 'react'

// Adds a Google Fonts stylesheet a design needs beyond the site-wide font
// link in index.html (e.g. the thin Noto Serif Armenian weights), only once
// the design is actually shown — other pages never download it.
export function useDesignFonts(id, href) {
  useEffect(() => {
    if (document.getElementById(id)) return
    document.head.appendChild(Object.assign(document.createElement('link'), { id, rel: 'stylesheet', href }))
  }, [id, href])
}
