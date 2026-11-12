import { useEffect, useRef } from 'react'

// Scroll-reveal wrapper (`.rv` → `.rv.in`). Each element observes itself
// on mount, so parts that appear later (a section shown again from the
// editor) reveal too. Never put the class on an <Editable> directly —
// its className changes in edit mode and would drop `.in`.
export default function Rv({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`rv ${className}`.trim()} {...rest}>{children}</Tag>
}
