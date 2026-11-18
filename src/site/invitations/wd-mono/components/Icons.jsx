// Fine line icons in the spirit of a hand-drawn ink sketch: thin round
// strokes, a few loose accent marks (sparkles, small hearts). 48×48 grid,
// drawn in currentColor. `ICON_NAMES` is the order a schedule item's icon
// cycles through when tapped while editing.

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round' }

const heart = (x, y, s = 1) => `M${x} ${y + 2.2 * s}c-1.6-1.3-3-2.4-3-3.8 0-1 .8-1.7 1.6-1.7.6 0 1.1.3 1.4.8.3-.5.8-.8 1.4-.8.8 0 1.6.7 1.6 1.7 0 1.4-1.4 2.5-3 3.8z`

const ICONS = {
  church: (
    <>
      <path d="M24 4v7M21 7h6" />
      <path d="M17 19l7-8 7 8" />
      <path d="M18 18v24h12V18" />
      <path d="M18 26l-9 6v10h9M30 26l9 6v10h-9" />
      <path d="M21.5 42v-6a2.5 2.5 0 0 1 5 0v6" />
      <path d={heart(24, 21, 0.9)} />
      <path d="M12 36.5h2M34 36.5h2" />
      <path d="M5 42h38" />
    </>
  ),
  glasses: (
    <>
      <path d="M13 13l7 2-1.6 7.2a4 4 0 0 1-7.4 1.5" />
      <path d="M11.2 23.6L9 33M6 32.4l6 1.4" />
      <path d="M35 13l-7 2 1.6 7.2a4 4 0 0 0 7.4 1.5" />
      <path d="M36.8 23.6L39 33M42 32.4l-6 1.4" />
      <path d="M12.4 18l6 1.6M29.6 19.6l6-1.6" opacity=".55" />
      <path d="M24 5v3M20.5 7l1.4 2M27.5 7l-1.4 2" />
      <path d={heart(24, 13, 0.7)} />
    </>
  ),
  rings: (
    <>
      <circle cx="19.5" cy="28" r="9" />
      <circle cx="28.5" cy="28" r="9" />
      <path d="M17 14l2.5-3.5L22 14l-2.5 2.5z" />
      <path d="M33 11v2.5M31.7 12.2h2.6M13 12v2M12 13h2M37 17l1 1M11 20l-1 1" />
      <path d={heart(24, 7, 0.7)} />
    </>
  ),
  pin: (
    <>
      <path d="M24 41s-11-11.6-11-20a11 11 0 0 1 22 0c0 8.4-11 20-11 20z" />
      <path d={heart(24, 20, 1.2)} />
      <path d="M10 40c4 2.6 24 2.6 28 0M14 38.5l-4 1.5 4 1.5" opacity=".6" />
    </>
  ),
  plate: (
    <>
      <circle cx="24" cy="25" r="11" />
      <circle cx="24" cy="25" r="7.5" opacity=".6" />
      <path d="M8 13v7a2.2 2.2 0 0 0 4.4 0v-7M10.2 13v24" />
      <path d="M38 13c-2.2 1.5-3 4.5-3 7.5s1 3.5 3 3.5v13" />
    </>
  ),
  cake: (
    <>
      <path d="M11 41h26M13 41V30h22v11M16 30v-6h16v6" />
      <path d="M13 34c2 1.6 3.5 1.6 5.5 0s3.5-1.6 5.5 0 3.5 1.6 5.5 0 3.5-1.6 5.5 0" />
      <path d="M24 24v-5M24 15.5c-1.3-1.2-1.3-2.6 0-4 1.3 1.4 1.3 2.8 0 4z" />
      <path d={heart(18.5, 26, 0.6)} /><path d={heart(29.5, 26, 0.6)} />
    </>
  ),
  disco: (
    <>
      <path d="M24 5v6" />
      <circle cx="24" cy="24" r="12" />
      <path d="M12 24h24M13.6 18h20.8M13.6 30h20.8M24 12c-4 3.4-4 20.6 0 24M24 12c4 3.4 4 20.6 0 24" opacity=".7" />
      <path d="M40 9v4M38 11h4M8 33v3M6.5 34.5h3M39 37l1.5 1.5M9 11l1.4 1.4" />
    </>
  ),
  photos: (
    <>
      <path d="M8.5 13.5l17-3 4 22.7-17 3z" />
      <path d="M11 17l12-2.1 2.4 13.7-12 2.1z" opacity=".6" />
      <path d="M24.5 15.5l15.6 4.6-5.8 20.8-15.6-4.6" />
      <path d="M26 21l10.8 3.2-3.6 12.7" opacity=".6" />
      <path d={heart(18, 21, 0.9)} />
      <path d={heart(31, 27, 0.9)} />
    </>
  ),
  music: (
    <>
      <path d="M14 33V17l9-2.5v16" />
      <circle cx="11.5" cy="33.5" r="2.6" />
      <circle cx="20.5" cy="31" r="2.6" />
      <path d="M33 30V16l5 3" />
      <circle cx="30.5" cy="30.5" r="2.6" />
      <path d="M8 10l1 1.5M40 8v3M38.5 9.5h3M27 40h2M36 38l1.5 1M18 41.5l1.5-1" />
    </>
  ),
  envelope: (
    <>
      <path d="M8 15h32v22H8z" />
      <path d="M8 15l16 13 16-13" />
      <path d={heart(24, 31, 0.9)} />
    </>
  ),
}

export const ICON_NAMES = ['rings', 'pin', 'church', 'glasses', 'plate', 'cake', 'disco', 'music', 'photos', 'envelope']

export default function Icon({ name, size = 46, className, title }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined} {...P}>
      {title && <title>{title}</title>}
      {ICONS[name] || ICONS.rings}
    </svg>
  )
}
