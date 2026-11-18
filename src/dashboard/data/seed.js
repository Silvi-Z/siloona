// Deterministic PRNG so the mock dataset is identical on every load
// (same seed as the original prototype).
let seedState = 240611;
export const R = () => {
  seedState |= 0;
  seedState = (seedState + 0x6D2B79F5) | 0;
  let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const pick = a => a[Math.floor(R() * a.length)];
export const rint = (a, b) => a + Math.floor(R() * (b - a + 1));
export const wpick = obj => {
  let t = 0;
  for (const k in obj) t += obj[k];
  let r = R() * t;
  for (const k in obj) { r -= obj[k]; if (r <= 0) return k; }
  return Object.keys(obj)[0];
};
export const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Record ids (guests, groups, …) must stay unique across visits: saved
// events keep the ids they were given, so a counter restarting at 1 on
// every page load would hand a new guest an id already in use. Starting
// from the current time keeps every session's ids above earlier ones.
let uidCounter = Date.now();
export const nid = p => p + uidCounter++;
