// The source demo's gentle harp-like waltz, synthesized live with Web Audio
// (no audio file to ship). One instance per mounted invitation; `stop()`
// must be called on unmount so music never outlives the page.
const CHORDS = [[261.6, 329.6, 392, 523.3], [220, 261.6, 329.6, 440], [174.6, 220, 261.6, 349.2], [196, 246.9, 293.7, 392]]
const ARP = [0, 1, 2, 3, 2, 1, 2, 3]

export function createMusic() {
  let ctx
  let bus
  let timer
  let i = 0
  let on = false

  function note(freq, vol, dur) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    const T = ctx.currentTime
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(0, T)
    g.gain.linearRampToValueAtTime(vol, T + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0005, T + dur)
    o.connect(g)
    g.connect(bus)
    o.start(T)
    o.stop(T + dur + 0.1)
  }

  function step() {
    const c = CHORDS[Math.floor(i / 8) % 4]
    const k = i % 8
    note(k === 0 ? c[0] / 2 : c[ARP[k]], k === 0 ? 0.1 : 0.055, k === 0 ? 2.4 : 1.6)
    i++
  }

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    ctx = new AC()
    bus = ctx.createGain()
    bus.gain.value = 0.8
    // soft echo
    const delay = ctx.createDelay(1)
    const feedback = ctx.createGain()
    const wet = ctx.createGain()
    delay.delayTime.value = 0.38
    feedback.gain.value = 0.42
    wet.gain.value = 0.4
    bus.connect(ctx.destination)
    bus.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(wet)
    wet.connect(ctx.destination)
    return true
  }

  return {
    // Returns whether music is now playing.
    toggle() {
      if (!ctx && !init()) return false
      on = !on
      if (on) { ctx.resume(); step(); timer = setInterval(step, 380) } else clearInterval(timer)
      return on
    },
    stop() {
      clearInterval(timer)
      on = false
      ctx?.close()
      ctx = null
    },
  }
}
