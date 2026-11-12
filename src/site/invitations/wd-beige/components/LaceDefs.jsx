// Shared <symbol> definitions referenced by every lace frame's generated
// <use> tiles (see lib/svgAssets.js). Rendered once per invitation.
export default function LaceDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <g id="wdb-lm">
          <circle r="5" fill="none" stroke="#fff" strokeWidth="1.3" />
          <circle r="1.5" fill="#fff" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <ellipse key={k} cx="0" cy="-8.4" rx="2.5" ry="3.6" transform={`rotate(${k * 60})`} fill="none" stroke="#fff" strokeWidth="1.1" />
          ))}
        </g>
        <g id="wdb-ls">
          <path d="M-9 3Q0 -9 9 3" fill="none" stroke="#fff" strokeWidth="1.2" />
          <circle cy="-2" r="1.1" fill="#fff" />
        </g>
      </defs>
    </svg>
  )
}
