// Shown instead of a broken screen or silently-faked data when the
// dashboard's Supabase backend hasn't been connected yet.
export default function SetupScreen() {
  return (
    <div className="siloona-dashboard">
      <div className="auth-screen">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <p className="eyebrow">Siloona</p>
          <h1>Վահանակի backend-ը դեռ կարգավորված չէ</h1>
          <ol style={{ margin: '18px 0', paddingLeft: 20, lineHeight: 1.9, color: 'var(--ink-2)' }}>
            <li>Ստեղծեք նախագիծ <b>supabase.com</b>-ում</li>
            <li>Գործարկեք <code>supabase/schema.sql</code> SQL խմբագրիչում</li>
            <li>Project Settings → API-ից վերցրեք Project URL և anon key</li>
            <li>Ստեղծեք <code>.env.local</code> (տես <code>.env.example</code>) և վերագործարկեք dev սերվերը</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
