// A real, complete print-invitation design (not a color/paper swatch) for
// the Card Invitation Catalog — shown exactly as it would be printed.
export default function GenderRevealCard() {
  return (
    <div className="card-art gr-card">
      <span className="gr-ring" aria-hidden="true" />
      <p className="eyebrow">Գենդերի բացահայտում</p>
      <h4>Աղջի՞կ, թե՞ Տղա</h4>
      <p className="ca-sub">
        Անի և Դավիթ հրավիրում են Ձեզ իրենց փոքրիկի<br />սեռի բացահայտման երեկույթին
      </p>
      <p className="ca-meta">12 Դեկտեմբերի · 18:00 · «Արև» այգի</p>
      <p className="ca-note">Հագեք վարդագույն կամ կապույտ և օգնեք մեզ գուշակել</p>
    </div>
  )
}
