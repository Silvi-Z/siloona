// The original placeholder invitation demo, preserved as a real working
// sample inside the catalog rather than discarded (see CLAUDE.md §8:
// existing invitation demos are valuable assets).
const guests = ['Ալեքս', 'Ջեյմի', 'Մորգան', 'Թեյլոր', 'Քրիս']

export default function SampleInvitation() {
  return (
    <div className="sample-card">
      <p className="eyebrow" style={{ marginBottom: 10 }}>Դուք հրավիրված եք</p>
      <h2>Միացե՛ք մեզ այս հատուկ տոնակատարությանը</h2>
      <p className="description">
        Պատիվ կլինի, եթե միասին նշենք այս ուրախ առիթը։ Եկեք կիսվենք համեղ կերակուրով,
        ծիծաղով ու անմոռանալի հուշերով։
      </p>

      <div className="event-details">
        <div>
          <span className="label">Ամսաթիվ</span>
          <strong>Շաբաթ, 30 Նոյեմբերի</strong>
        </div>
        <div>
          <span className="label">Ժամ</span>
          <strong>19:00</strong>
        </div>
        <div>
          <span className="label">Վայր</span>
          <strong>Sunset Garden Hall</strong>
        </div>
      </div>

      <div className="guest-list">
        <span className="label">Հյուրերի ցանկ</span>
        <ul>
          {guests.map((guest) => (
            <li key={guest}>{guest}</li>
          ))}
        </ul>
      </div>

      <button type="button" className="btn btn-primary rsvp-btn">Հաստատել մասնակցությունը</button>
    </div>
  )
}
