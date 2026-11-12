// Static artwork from the source demo (never user content). Ids are
// prefixed `wgr-` so they can't collide with other SVGs on the same page.

export const SYMBOLS = `
  <symbol id="wgr-corner" viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M4 56V10C4 6 7 4 10 4h46M4 30c0-10 8-16 18-16 6 0 9 3 9 7s-3 6-6 6-5-2-5-4M16 56h20c10 0 16-6 16-16 0-6-3-9-7-9s-6 3-6 6 2 5 4 5"/>
  </symbol>
  <symbol id="wgr-flourish" viewBox="0 0 260 30" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
    <path pathLength="1" d="M4 15h86c10 0 14-8 22-8 6 0 8 5 4 8-3 2-6 0-5-3M256 15h-86c-10 0-14-8-22-8-6 0-8 5-4 8 3 2 6 0 5-3"/>
    <path pathLength="1" d="M118 15l12-7 12 7-12 7Z"/>
  </symbol>`

// Misty evening garden behind the hero.
export const HERO_ART = `
  <defs>
    <linearGradient id="wgr-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e996c"/><stop offset=".6" stop-color="#58633d"/><stop offset="1" stop-color="#2d3520"/></linearGradient>
    <radialGradient id="wgr-sun" cx=".66" cy=".32" r=".5"><stop offset="0" stop-color="#f7edc9" stop-opacity=".85"/><stop offset="1" stop-color="#f7edc9" stop-opacity="0"/></radialGradient>
    <filter id="wgr-bl"><feGaussianBlur stdDeviation="6"/></filter><filter id="wgr-bl2"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="1200" height="800" fill="url(#wgr-sk)"/><rect width="1200" height="800" fill="url(#wgr-sun)"/>
  <g fill="#3c4727" opacity=".85" filter="url(#wgr-bl)"><circle cx="80" cy="300" r="170"/><circle cx="300" cy="260" r="150"/><circle cx="520" cy="310" r="140"/><circle cx="760" cy="280" r="120"/><circle cx="980" cy="300" r="150"/><circle cx="1180" cy="270" r="170"/></g>
  <g fill="#252d1a" opacity=".9" filter="url(#wgr-bl)"><circle cx="-20" cy="420" r="210"/><circle cx="230" cy="470" r="160"/><circle cx="1010" cy="450" r="170"/><circle cx="1230" cy="420" r="220"/></g>
  <path d="M0 560C250 520 450 570 700 545S1050 520 1200 550V800H0Z" fill="#47532c"/>
  <path d="M0 640C300 600 520 660 800 630S1100 610 1200 640V800H0Z" fill="#2e3820"/>
  <path d="M-20 215Q300 330 600 235T1220 200" fill="none" stroke="#f3e6c2" stroke-opacity=".5" stroke-width="1.4"/>
  <g fill="#fff0c4" filter="url(#wgr-bl)" opacity=".9"><circle cx="150" cy="268" r="9"/><circle cx="330" cy="300" r="9"/><circle cx="500" cy="285" r="9"/><circle cx="690" cy="262" r="9"/><circle cx="880" cy="240" r="9"/><circle cx="1050" cy="222" r="9"/></g>
  <path class="veil" d="M240 700C330 560 460 520 560 560c80 30 60 120 190 130 120 10 200-80 270-60-60 60-150 140-330 150-170 10-380-10-450-80Z" fill="#fdf8ec" opacity=".78" filter="url(#wgr-bl2)"/>`

// String lights over the venue section.
export const VENUE_ART = `<defs><linearGradient id="wgr-vk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c7850"/><stop offset="1" stop-color="#2c351f"/></linearGradient><filter id="wgr-vb"><feGaussianBlur stdDeviation="9"/></filter></defs><rect width="1200" height="600" fill="url(#wgr-vk)"/><g fill="#3a4527" filter="url(#wgr-vb)"><circle cx="150" cy="260" r="200"/><circle cx="520" cy="220" r="170"/><circle cx="900" cy="250" r="210"/><circle cx="1180" cy="300" r="190"/></g><path d="M0 120Q300 230 600 140T1200 110" fill="none" stroke="#f5e8c4" stroke-opacity=".5"/><g fill="#ffeab8" filter="url(#wgr-vb)"><circle cx="140" cy="170" r="12"/><circle cx="330" cy="204" r="12"/><circle cx="520" cy="190" r="12"/><circle cx="740" cy="170" r="12"/><circle cx="960" cy="148" r="12"/></g>`

export const CLIP = '<path d="M14 30h32v16H14Z" fill="#a98a52"/><path d="M18 30V14a12 12 0 0 1 24 0v16" fill="none" stroke="#d3b97c" stroke-width="3.2"/><path d="M14 30h32v6H14Z" fill="#cdb176"/>'
export const SUIT = '<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="3"/><path d="M26 30l24 36 24-36-7-5-17 14-17-14Z" fill="currentColor"/><path d="M40 32l10 6 10-6v12l-10-6-10 6Z" fill="var(--ivory)"/><circle cx="50" cy="52" r="1.8" fill="var(--ivory)"/><circle cx="50" cy="60" r="1.8" fill="var(--ivory)"/>'
export const DRESS = '<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="3"/><path d="M41 22h5l4 9 4-9h5l-2 14 12 36H31l12-36Z" fill="currentColor"/>'
