// A real, complete print-invitation design (not a color/paper swatch) for
// the Card Invitation Catalog — shown exactly as it would be printed.
export default function BirthdayCard() {
  return (
    <div className="card-art bd-card">
      <span className="bd-dot d1" aria-hidden="true" />
      <span className="bd-dot d2" aria-hidden="true" />
      <span className="bd-dot d3" aria-hidden="true" />
      <p className="eyebrow">Ծննդյան տոն</p>
      <p className="bd-age">30</p>
      <h4>Լուսինեի տարեդարձը</h4>
      <p className="ca-meta">7 Փետրվարի · 19:00 · «Վերտա» ռեստորան</p>
      <p className="ca-note">Ներկայություն խնդրվում է հաստատել մինչև 1 Փետրվարի</p>
    </div>
  )
}
