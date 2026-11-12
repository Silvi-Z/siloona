import { useState } from 'react'

export default function Login() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Բարի գալուստ</h1>
        <p className="sub">Մուտք գործեք ձեր Siloona հաշիվ</p>

        <div className={`form-msg${submitted ? ' show' : ''}`}>
          Հաշիվների կառավարումը դեռ մշակման փուլում է։ Շուտով հասանելի կլինի։
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Էլ. փոստ</label>
            <input id="login-email" type="email" autoComplete="email" required placeholder="name@example.com" />
          </div>
          <div className="field">
            <label htmlFor="login-password">Գաղտնաբառ</label>
            <input id="login-password" type="password" autoComplete="current-password" required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary">Մուտք</button>
        </form>

        <p className="auth-note">Հաճախորդ չե՞ք դեռ։ Կապվեք մեզ հետ՝ ձեր հրավիրատոմսը պատվիրելու համար։</p>
      </div>
    </div>
  )
}
