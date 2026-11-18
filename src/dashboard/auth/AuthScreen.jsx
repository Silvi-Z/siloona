import { useState } from 'react';
import { useAuth } from './AuthContext';
import { CUSTOMER_DASHBOARD } from '../../site/features';

export default function AuthScreen() {
  const { signUp, logIn } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    const res = mode === 'signin'
      ? await logIn({ email, password })
      : await signUp({ email, password, mode: 'couple', profileData: { name, phone: '' } });
    setBusy(false);
    if (res.error) setErr(res.error);
    else if (mode === 'signup' && res.needsConfirmation) setSentConfirm(true);
  };

  if (sentConfirm) {
    return (
      <div className="siloona-dashboard">
        <div className="auth-screen">
          <div className="auth-card">
            <p className="eyebrow">Siloona</p>
            <h1>Ստուգեք Ձեր էլ. փոստը</h1>
            <p className="muted">Հաստատման հղում ուղարկվեց {email}-ին (եթե պահանջվում է)։ Հաստատելուց հետո մուտք գործեք ստորև։</p>
            <button className="btn primary full" onClick={() => { setSentConfirm(false); setMode('signin'); }}>Անցնել մուտքի</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="siloona-dashboard">
      <div className="auth-screen">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">Siloona</p>
          <h1>{mode === 'signin' ? 'Մուտք գործել' : 'Ստեղծել հաշիվ'}</h1>

          <div className="form" style={{ marginBottom: 4 }}>
            {mode === 'signup' && (
              <label className="full">Անուն Ազգանուն<input className="input" value={name} onChange={e => setName(e.target.value)} required /></label>
            )}
            <label className="full">Email<input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
            <label className="full">Գաղտնաբառ<input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></label>
            {err && <div className="err full">{err}</div>}
          </div>

          <button className="btn primary full" type="submit" disabled={busy}>
            {busy ? '…' : mode === 'signin' ? 'Մուտք' : 'Ստեղծել հաշիվ'}
          </button>
          {CUSTOMER_DASHBOARD && (
            <button type="button" className="link" style={{ marginTop: 14 }} onClick={() => { setErr(''); setMode(mode === 'signin' ? 'signup' : 'signin'); }}>
              {mode === 'signin' ? 'Հաշիվ չունե՞ք. Ստեղծել' : 'Արդեն հաշիվ ունե՞ք. Մուտք գործել'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
