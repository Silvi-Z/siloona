import { useEffect, useState } from 'react'

function pad(n, l) {
  return String(n).padStart(l, '0')
}

export function useCountdown(isoDate) {
  const [value, setValue] = useState(null)

  useEffect(() => {
    const target = new Date(isoDate).getTime()
    function tick() {
      const diff = target - Date.now()
      if (diff <= 0) {
        setValue({ done: true })
        return
      }
      setValue({
        done: false,
        d: pad(Math.floor(diff / 864e5), 3),
        h: pad(Math.floor((diff % 864e5) / 36e5), 2),
        m: pad(Math.floor((diff % 36e5) / 6e4), 2),
        s: pad(Math.floor((diff % 6e4) / 1e3), 2),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isoDate])

  return value
}
