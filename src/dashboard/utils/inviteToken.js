// Per-guest invitation tokens must not be guessable — unlike seed.js's
// `nid()` (a plain incrementing counter, fine for internal record ids but
// trivially enumerable), these are generated from the Web Crypto RNG so one
// guest's link can't be used to discover another's.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export function genInviteToken(len = 22) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
