import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useDashboard } from '../state/DashboardContext';
import Kpi from '../components/Kpi';
import EmptyState from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { SearchField, SelectField, Tabs } from '../components/Controls';
import Icon from '../utils/icons';
import { findDesign } from '../../site/designCatalog';
import { pricesFor } from '../../site/prices';
import { addonName } from '../../site/addons';
import { CUSTOM_DESIGN_ID, CUSTOM_DESIGN_LABEL, CUSTOM_EVENT_TYPES, CUSTOM_KINDS } from '../../site/customRequest';
import TimeSelect from '../../site/invitations/shared/TimeSelect';
import { detailGroups, detailValue, namesFromDetails, venueFromDetails } from '../../site/invitationDetails';

// Siloona admin: every order with its payment state. Reads go straight to
// Supabase (RLS lets only admin_users read these tables); every change goes
// through /api/admin/orders, which re-checks the admin and talks to the
// payment provider. There is deliberately no "mark as paid" switch: an
// order becomes paid only from a provider-verified transaction or from a
// recorded manual payment with a reference, tied to the admin who made it.

// The schedule in the admin form: one «16:00 Պսակադրություն» per line.
const scheduleText = (rows = []) => rows.map(r => [r.time, r.title].filter(Boolean).join(' ')).join('\n');
const parseSchedule = (text) => text.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
  const m = /^(\d{1,2}:\d{2})\s+(.*)$/.exec(l);
  return m ? { time: m[1].padStart(5, '0'), title: m[2].trim() } : { time: '', title: l };
});

export const PAY_ST = {
  unpaid: { l: 'Չվճարված', c: 'b-grey' },
  pending: { l: 'Սպասման մեջ', c: 'b-amber' },
  paid: { l: 'Վճարված', c: 'b-sage' },
  failed: { l: 'Ձախողված', c: 'b-red' },
  cancelled: { l: 'Չեղարկված', c: 'b-grey' },
  refunded: { l: 'Վերադարձված', c: 'b-rose' },
  created: { l: 'Ստեղծված', c: 'b-grey' },
};
const ORD_ST = {
  new: { l: 'Նոր', c: 'b-wine' },
  in_progress: { l: 'Ընթացքում', c: 'b-amber' },
  delivered: { l: 'Հանձնված', c: 'b-sage' },
  cancelled: { l: 'Չեղարկված', c: 'b-grey' },
};
const PROVIDER = { arca: 'Քարտ (ArCa)', idram: 'Idram', manual: 'Ձեռքով գրանցված', test: 'Թեստ (սիմուլյացիա)' };
const TestTag = () => <span className="tag" style={{ marginLeft: 6, fontSize: 10.5, color: '#6A4A12', background: '#F6EAD2', borderColor: 'transparent' }}>Թեստ</span>;
const OPTION = { diy: 'Խմբագրում', assisted: 'Պատվեր' };
const RSVP_ST = { confirmed: { l: 'Կգա', c: 'b-sage' }, declined: { l: 'Չի գա', c: 'b-grey' } };
const MANUAL = [['bank_transfer', 'Բանկային փոխանցում'], ['cash', 'Կանխիկ'], ['other', 'Այլ']];
const EVENT_KIND = {
  order_created: 'Պատվերը ստեղծվեց', attempt_created: 'Վճարման փորձ', status_pending: 'Սպասման մեջ',
  status_paid: 'Վճարված', status_failed: 'Ձախողվեց', status_cancelled: 'Չեղարկվեց', status_refunded: 'Վերադարձվեց',
  repeat_paid: 'Կրկնվող հաստատում (անտեսվեց)', repeat_pending: 'Կրկնվող (անտեսվեց)', repeat_failed: 'Կրկնվող (անտեսվեց)',
  repeat_cancelled: 'Կրկնվող (անտեսվեց)', precheck_rejected: 'Idram նախնական ստուգումը մերժվեց', precheck_repeat: 'Idram կրկնվող ստուգում',
  bad_checksum: 'Սխալ ստորագրություն (մերժվեց)', amount_mismatch: 'Գումարը չի համապատասխանում', account_mismatch: 'Սխալ հաշիվ',
  amount_mismatch_needs_review: 'Գումարը չի համապատասխանում — ստուգեք', duplicate_payment_needs_refund: 'Կրկնակի վճարում — անհրաժեշտ է վերադարձ',
  verify_error: 'Բանկի հետ ստուգումը չհաջողվեց', verified: 'Ստուգվեց բանկում', arca_callback: 'ArCa ծանուցում',
  return_order_id_mismatch: 'Վերադարձի հղումը չի համապատասխանում', refund_failed: 'Վերադարձը մերժվեց',
  order_status: 'Կարգավիճակը փոխվեց', details_updated: 'Հրավերի տվյալները թարմացվեցին', transaction_reused: 'Idram գործարքը կրկին օգտագործվեց (մերժվեց)', amount_set: 'Գինը սահմանվեց',
};
const SOURCE = { init: 'Համակարգ', return: 'Վերադարձ բանկից', callback: 'Ծանուցում', verify: 'Ստուգում', admin: 'Ադմին', precheck: 'Idram' };

const amd = (v) => v == null ? '—' : `${Number(v).toLocaleString('en-US').replace(/,/g, ' ')} ֏`;
function dt(iso) {
  if (!iso) return '—';
  const d = new Date(iso), p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
const designLabel = (id) => { if (id === CUSTOM_DESIGN_ID) return CUSTOM_DESIGN_LABEL; const d = findDesign(id); return d ? d.code : id; };

async function adminCall(session, body) {
  let r;
  try {
    r = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify(body),
    });
  } catch { throw new Error('Կապի խնդիր։'); }
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.message || `Սխալ (${r.status})`);
  return data;
}

export default function Orders() {
  const dash = useDashboard();
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) { setErr(error.message.includes('does not exist') || error.code === '42P01' ? 'Պատվերների աղյուսակը չկա․ գործարկեք supabase/payments.sql-ը։' : error.message); return; }
    setErr(''); setOrders(data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c = { all: 0 };
    for (const o of orders || []) { c.all++; c[o.payment_status] = (c[o.payment_status] || 0) + 1; }
    return c;
  }, [orders]);

  if (err) return <div className="panel"><EmptyState title="Պատվերները չբեռնվեցին" sub={err}><button className="btn sm" onClick={load}>Փորձել կրկին</button></EmptyState></div>;
  if (!orders) return <p className="muted">Բեռնվում է…</p>;

  const needle = q.trim().toLowerCase();
  const rows = orders.filter(o => (tab === 'all' || o.payment_status === tab) && (!needle ||
    [String(o.order_number), o.customer_name, o.customer_phone, o.customer_email, o.transaction_id, designLabel(o.design_id)]
      .some(v => v && String(v).toLowerCase().includes(needle))));
  const paid = orders.filter(o => o.payment_status === 'paid');
  // Simulated (test) payments are shown but never counted as revenue.
  const testPaid = paid.filter(o => o.payment_provider === 'test').length;
  const revenue = paid.filter(o => o.payment_provider !== 'test').reduce((s, o) => s + (o.amount || 0), 0);

  const open = (o) => dash.openDrawer(<OrderDrawer key={o.id} orderId={o.id} onChanged={load} />);

  return (
    <>
      <div className="kpis k4">
        <Kpi label="Վճարված պատվերներ" value={paid.length} detail={testPaid ? `${amd(revenue)} · ${testPaid} թեստային` : amd(revenue)} tone="sage" icon="check" onClick={() => setTab('paid')} />
        <Kpi label="Չվճարված" value={counts.unpaid || 0} detail="Ներառյալ գնի հայտերը" onClick={() => setTab('unpaid')} />
        <Kpi label="Սպասման մեջ" value={counts.pending || 0} detail="Վճարումը դեռ ընթացքում է" onClick={() => setTab('pending')} />
        <Kpi label="Ձախողված / չեղարկված" value={(counts.failed || 0) + (counts.cancelled || 0)} detail="Կապվեք հաճախորդի հետ" onClick={() => setTab('failed')} />
      </div>

      <div className="toolbar">
        <SearchField value={q} onChange={setQ} placeholder="№, անուն, հեռախոս, գործարք…" />
        <div className="spacer" />
        <button className="btn sm" onClick={load}>Թարմացնել</button>
      </div>
      <Tabs value={tab} onChange={setTab} items={[
        ['all', 'Բոլորը', counts.all], ['paid', 'Վճարված', counts.paid || 0], ['unpaid', 'Չվճարված', counts.unpaid || 0],
        ['pending', 'Սպասման մեջ', counts.pending || 0], ['failed', 'Ձախողված', counts.failed || 0],
        ['cancelled', 'Չեղարկված', counts.cancelled || 0], ['refunded', 'Վերադարձված', counts.refunded || 0],
      ]} />

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                <th>№</th><th>Հաճախորդ</th><th className="c-sm">Դիզայն</th><th className="num">Գումար</th>
                <th>Վճարում</th><th className="c-sm">Պատվեր</th><th className="c-sm">Եղանակ</th><th className="c-sm">Ստեղծված</th><th className="c-sm">Վճարված</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id} onClick={() => open(o)}>
                  <td className="strong nowrap">{o.order_number}{o.payment_provider === 'test' && <TestTag />}</td>
                  <td><div className="cell-2"><span className="strong">{o.customer_name}</span><small>{o.customer_phone}</small></div></td>
                  <td className="c-sm"><div className="cell-2"><span>{designLabel(o.design_id)}</span><small>{OPTION[o.design_option]}</small></div></td>
                  <td className="num">{o.amount == null ? <span className="muted">Գինը՝ հայտով</span> : amd(o.amount)}</td>
                  <td><Badge map={PAY_ST} value={o.payment_status} /></td>
                  <td className="c-sm"><Badge map={ORD_ST} value={o.order_status} /></td>
                  <td className="c-sm muted">{PROVIDER[o.payment_provider] || '—'}</td>
                  <td className="c-sm nowrap muted">{dt(o.created_at)}</td>
                  <td className="c-sm nowrap muted">{o.paid_at ? dt(o.paid_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <EmptyState title={orders.length ? 'Պատվերներ չեն գտնվել' : 'Դեռ պատվերներ չկան'} sub={orders.length ? 'Փոխեք որոնումը կամ ֆիլտրը' : 'Կայքից ձևակերպված պատվերները կհայտնվեն այստեղ'} />}
        </div>
      </div>
    </>
  );
}

function OrderDrawer({ orderId, onChanged }) {
  const dash = useDashboard();
  const { session } = useAuth();
  const [o, setO] = useState(null);
  const [txs, setTxs] = useState([]);
  const [events, setEvents] = useState([]);
  const [invitation, setInvitation] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [panel, setPanel] = useState(null); // 'manual' | 'amount' | {refundTx}
  const [form, setForm] = useState({ method: 'bank_transfer', reference: '', note: '', amount: '' });
  const [det, setDet] = useState(null); // invitation details being edited

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.from('orders').select('*').eq('id', orderId).single(),
      supabase.from('payment_transactions').select('*').eq('order_id', orderId).order('created_at'),
      supabase.from('payment_events').select('*').eq('order_id', orderId).order('created_at', { ascending: false }).limit(200),
    ]);
    if (a.error) { setErr(a.error.message); return; }
    setO(a.data); setTxs(b.data || []); setEvents(c.data || []);
    const inv = await supabase.from('invitations').select('*').eq('order_id', orderId).maybeSingle();
    setInvitation(inv.data || null);
    if (inv.data) {
      const r = await supabase.from('invitation_rsvps').select('*').eq('invitation_id', inv.data.id).order('created_at', { ascending: false });
      setRsvps(r.data || []);
    }
  }, [orderId]);
  useEffect(() => { load(); }, [load]);

  const act = async (body, label, okMsg) => {
    setBusy(label); setErr('');
    try {
      await adminCall(session, { orderId, ...body });
      setPanel(null);
      dash.toast(okMsg);
      await load(); onChanged();
      setBusy('');
      return true;
    } catch (e) { setErr(e.message); setBusy(''); return false; }
  };

  if (!o) return <div className="dr-b">{err ? <p className="err">{err}</p> : <p className="muted">Բեռնվում է…</p>}</div>;

  const design = findDesign(o.design_id);
  const z = o.customization || {};
  const groups = z.details && design?.previewSlug ? detailGroups(design.previewSlug) : [];
  const shown = (d, f) => {
    if (f.type === 'schedule') return scheduleText((d.schedule || []).filter(r => r.title)).replace(/\n/g, ' · ');
    const v = detailValue(d, f);
    return f.type === 'date' && v ? v.split('-').reverse().join('.') : v;
  };
  const catalogPrice = pricesFor(o.design_id)[o.design_option];
  const canVerify = txs.some(t => t.provider === 'arca' && t.provider_payment_id && t.status !== 'refunded');
  const canManual = o.amount != null && !['paid', 'refunded'].includes(o.payment_status) && o.order_status !== 'cancelled';
  const canSetAmount = catalogPrice == null && !['paid', 'pending', 'refunded'].includes(o.payment_status);
  const link = `${window.location.origin}/checkout/result?order=${o.id}&t=${o.access_token}`;
  const flagged = events.some(e => e.kind.endsWith('needs_refund') || e.kind.endsWith('needs_review'));
  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div className="dr-h">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow muted small">Պատվեր № {o.order_number}{o.payment_provider === 'test' && <TestTag />}</div>
          <h2 className="dr-title">{o.customer_name}</h2>
          <div className="dr-sub"><Badge map={PAY_ST} value={o.payment_status} /><Badge map={ORD_ST} value={o.order_status} /><span className="strong">{amd(o.amount)}</span></div>
        </div>
        <button className="icon-btn sm bare" onClick={dash.closeDrawer} aria-label="Փակել"><Icon name="close" /></button>
      </div>

      <div className="dr-b">
        {flagged && <p className="err" style={{ marginTop: 0 }}>Այս պատվերում կա ստուգում պահանջող իրադարձություն — տես պատմությունը ներքևում։</p>}
        {err && <p className="err" style={{ marginTop: 0 }}>{err}</p>}

        <div className="dr-sec">
          <h4>Հաճախորդ</h4>
          <dl className="kv">
            <dt>Հեռախոս</dt><dd><a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a></dd>
            <dt>Էլ. փոստ</dt><dd>{o.customer_email ? <a href={`mailto:${o.customer_email}`}>{o.customer_email}</a> : '—'}</dd>
            <dt>Telegram / Instagram</dt><dd>{o.customer_contact || '—'}</dd>
            <dt>Հաշիվ</dt><dd>{o.owner_id ? 'Մուտք գործած օգտատեր' : 'Առանց հաշվի'}</dd>
          </dl>
        </div>

        <div className="dr-sec">
          <h4>Հրավեր</h4>
          <dl className="kv">
            <dt>Դիզայն</dt><dd>{design ? `${design.code} · ${design.title}` : designLabel(o.design_id)}</dd>
            {z.request === 'custom' && (
              <>
                <dt>Միջոցառում</dt><dd>{CUSTOM_EVENT_TYPES[z.eventType] || '—'}</dd>
                <dt>Հայտ</dt><dd>{CUSTOM_KINDS[z.kind] || '—'}{z.basedOn && ` · ${designLabel(z.basedOn)}`}</dd>
                <dt>Գաղափարը</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{z.notes || '—'}</dd>
                <dt>Օրինակներ</dt><dd style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{z.references || '—'}</dd>
              </>
            )}
            <dt>Տարբերակ</dt><dd>{OPTION[o.design_option]}</dd>
            {groups.length ? groups.map(g => g.fields.map((f, i) => (
              <Fragment key={f.key}>
                <dt>{i === 0 && g.title ? <span className="strong">{g.title} · </span> : null}{f.label}</dt>
                <dd style={{ whiteSpace: 'pre-wrap' }}>{shown(z.details, f) || '—'}</dd>
              </Fragment>
            ))) : (
              <>
                <dt>Անուններ</dt><dd>{z.names || '—'}</dd>
                <dt>Ամսաթիվ</dt><dd>{z.eventDate ? `${z.eventDate.split('-').reverse().join('.')}${z.eventTime ? `, ${z.eventTime}` : ''}` : '—'}</dd>
                <dt>Վայր</dt><dd>{z.venue || '—'}</dd>
              </>
            )}
            {z.request !== 'custom' && <><dt>Ցանկություններ</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{z.notes || '—'}</dd></>}
            <dt>Կայքում խմբագրված</dt><dd>{z.content ? 'Այո — հաճախորդի փոփոխությունները կիրառված են հրավերում' : 'Ոչ'}</dd>
          </dl>
        </div>

        <div className="dr-sec">
          <h4>Հրավերի հղում <span className="spacer" />{invitation && <button className="link small" style={{ padding: 0 }} onClick={() => setDet({ names: z.names || '', eventDate: z.eventDate || '', eventTime: z.eventTime || '', venue: z.venue || '', notes: z.notes || '', details: groups.length ? { extra: {}, ...z.details, scheduleText: scheduleText(z.details.schedule) } : null })}>Խմբագրել տվյալները</button>}</h4>
          {!invitation ? (
            <p className="small muted" style={{ margin: 0 }}>Հղումը կստեղծվի վճարումից հետո։</p>
          ) : !design?.previewSlug ? (
            <p className="small muted" style={{ margin: 0 }}>Այս դիզայնը թվային էջ չունի․ հղումը հաճախորդին չի ցուցադրվում։</p>
          ) : (
            <dl className="kv">
              <dt>Հղում</dt>
              <dd style={{ wordBreak: 'break-all' }}>
                <a href={`/i/${invitation.code}`} target="_blank" rel="noopener noreferrer">{window.location.host}/i/{invitation.code}</a>
                {o.payment_status !== 'paid' && <span className="muted"> · անջատված է (պատվերը վճարված չէ)</span>}
                {o.order_status === 'cancelled' && <span className="muted"> · անջատված է (չեղարկված)</span>}
              </dd>
              <dt>RSVP</dt>
              <dd>{rsvps.length ? `${rsvps.filter(r => r.status === 'confirmed').length} կգան (+${rsvps.filter(r => r.status === 'confirmed').reduce((s, r) => s + r.plus, 0)} ուղեկից) · ${rsvps.filter(r => r.status === 'declined').length} չեն գա` : 'Պատասխաններ դեռ չկան'}</dd>
            </dl>
          )}
          {det && (
            <div className="form" style={{ marginTop: 14 }}>
              {det.details ? groups.map(g => g.fields.map(f => {
                const d = det.details;
                const setV = (v) => setDet(x => ({ ...x, details: f.key.startsWith('x:') ? { ...x.details, extra: { ...x.details.extra, [f.path]: v } } : { ...x.details, [f.key]: v } }));
                if (f.type === 'schedule') {
                  return <label key={f.key} className="full">{f.label} <span className="muted small">(մեկ տողում՝ «16:00 Պսակադրություն»)</span><textarea className="input" rows={4} value={d.scheduleText} onChange={e => setDet(x => ({ ...x, details: { ...x.details, scheduleText: e.target.value } }))} /></label>;
                }
                const v = f.key.startsWith('x:') ? d.extra?.[f.path] ?? '' : d[f.key] ?? '';
                return <label key={f.key} className={f.type === 'text' ? 'full' : ''}>{g.title ? `${g.title} · ` : ''}{f.label}{f.type === 'time' ? <TimeSelect className="input" allowEmpty value={v} onChange={setV} /> : <input className="input" type={f.type} value={v} onChange={e => setV(e.target.value)} />}</label>;
              })) : (
                <>
                  <label className="full">Անուններ<input className="input" value={det.names} onChange={e => setDet(d => ({ ...d, names: e.target.value }))} /></label>
                  <label>Ամսաթիվ<input className="input" type="date" value={det.eventDate} onChange={e => setDet(d => ({ ...d, eventDate: e.target.value }))} /></label>
                  <label>Ժամ<TimeSelect className="input" allowEmpty value={det.eventTime} onChange={v => setDet(d => ({ ...d, eventTime: v }))} /></label>
                  <label className="full">Վայր<input className="input" value={det.venue} onChange={e => setDet(d => ({ ...d, venue: e.target.value }))} /></label>
                </>
              )}
              {z.content && <p className="full small muted" style={{ margin: 0 }}>Հաճախորդը հրավերը խմբագրել է կայքում․ այն դաշտերը, որոնք նա փոխել է այնտեղ, գերակայում են այս տվյալներին։</p>}
              <div className="full" style={{ display: 'flex', gap: 8 }}>
                <button className="btn sm ghost" onClick={() => setDet(null)}>Չեղարկել</button>
                <button className="btn sm primary" disabled={!!busy} onClick={async () => {
                  let customization = det;
                  if (det.details) {
                    const { scheduleText: text, source, ...rest } = det.details;
                    const details = { ...rest, schedule: parseSchedule(text || '') };
                    customization = { notes: det.notes, details, names: namesFromDetails(details), eventDate: details.eventDate || '', eventTime: details.eventTime || '', venue: venueFromDetails(details) };
                  }
                  if (await act({ action: 'update_details', customization }, 'details', 'Հրավերի տվյալները թարմացվեցին')) setDet(null);
                }}>Պահպանել</button>
              </div>
            </div>
          )}
          {rsvps.length > 0 && (
            <div className="lines" style={{ marginTop: 12 }}>
              {rsvps.map(r => (
                <div key={r.id}>
                  <span>{r.guest_name}{r.plus ? ` +${r.plus}` : ''}{r.note && <span className="muted small"> · {r.note}</span>}</span>
                  <span className="nowrap"><Badge map={RSVP_ST} value={r.status} /> <span className="muted small">{dt(r.created_at)}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dr-sec">
          <h4>Վճարում</h4>
          <dl className="kv">
            <dt>Գումար</dt><dd>{amd(o.amount)} {o.amount != null && 'AMD'}{catalogPrice == null && <span className="muted"> · կատալոգում գին չկա</span>}</dd>
            <dt>Հավելումներ</dt><dd>{Array.isArray(o.addons) && o.addons.length ? o.addons.map(a => `${addonName(a.id)} (${amd(a.price)})`).join(', ') : '—'}</dd>
            <dt>Եղանակ</dt><dd>{PROVIDER[o.payment_provider] || '—'}</dd>
            <dt>Գործարքի համար</dt><dd style={{ wordBreak: 'break-all' }}>{o.transaction_id || '—'}</dd>
            <dt>Ստեղծված</dt><dd>{dt(o.created_at)}</dd>
            <dt>Վճարված</dt><dd>{dt(o.paid_at)}</dd>
            <dt>Հաճախորդի հղում</dt><dd><button className="link" style={{ padding: 0 }} onClick={() => navigator.clipboard?.writeText(link).then(() => dash.toast('Հղումը պատճենված է'))}>Պատճենել պատվերի էջի հղումը</button></dd>
          </dl>
        </div>

        <div className="dr-sec">
          <h4>Գործարքներ <span className="spacer" />{txs.length}</h4>
          {!txs.length && <p className="muted small" style={{ margin: 0 }}>Վճարման փորձեր դեռ չեն եղել։</p>}
          {txs.map(t => (
            <div key={t.id} className="panel" style={{ padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="strong">{PROVIDER[t.provider]}</span>
                <Badge map={PAY_ST} value={t.status} />
                <span className="spacer" />
                <span>{amd(t.amount)}</span>
              </div>
              <div className="small muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
                Siloona №՝ {t.merchant_ref} · Մատակարարի №՝ <span style={{ wordBreak: 'break-all' }}>{t.provider_payment_id || '—'}</span><br />
                {t.card_mask && <>Քարտ՝ {t.card_mask} · </>}Ստեղծված՝ {dt(t.created_at)}{t.paid_at && <> · Վճարված՝ {dt(t.paid_at)}</>}{t.refunded_at && <> · Վերադարձված՝ {dt(t.refunded_at)}</>}
                {t.error_message && <><br />Պատճառ՝ {t.error_message}{t.error_code ? ` (${t.error_code})` : ''}</>}
                {t.note && <><br />Նշում՝ {t.note}</>}
              </div>
              {t.provider === 'test' && <p className="small" style={{ margin: '6px 0 0', color: '#6A4A12' }}>Սիմուլյացիա — իրական գումար չի գանձվել։</p>}
              {t.status === 'paid' && t.provider !== 'idram' && (
                panel?.refundTx === t.id ? (
                  <div className="form" style={{ marginTop: 12 }}>
                    {t.provider === 'manual' && <label className="full">Ինչպե՞ս է վերադարձվել գումարը<input className="input" value={form.note} onChange={setF('note')} /></label>}
                    <div className="full" style={{ display: 'flex', gap: 8 }}>
                      <button className="btn sm ghost" onClick={() => setPanel(null)}>Չեղարկել</button>
                      <button className="btn sm danger" disabled={!!busy} onClick={() => act({ action: 'refund', txId: t.id, note: form.note }, 'refund', 'Գումարը վերադարձվեց')}>
                        {busy === 'refund' ? 'Ուղարկվում է…' : t.provider === 'arca' ? `Վերադարձնել ${amd(t.amount)} քարտին` : t.provider === 'test' ? 'Թեստային վերադարձ' : 'Գրանցել վերադարձը'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn sm danger" style={{ marginTop: 10 }} onClick={() => setPanel({ refundTx: t.id })}>Վերադարձ</button>
                )
              )}
              {t.status === 'paid' && t.provider === 'idram' && <p className="small muted" style={{ margin: '8px 0 0' }}>Idram-ի վերադարձը կատարվում է Idram-ի վաճառողի անձնական էջից։</p>}
            </div>
          ))}
        </div>

        {panel === 'manual' && (
          <div className="dr-sec">
            <h4>Ձեռքով վճարման գրանցում</h4>
            <p className="small muted" style={{ marginTop: 0 }}>Միայն այն դեպքում, երբ գումարն իրականում ստացվել է կայքից դուրս։ Գրանցվում է {amd(o.amount)}, Ձեր անունով, և հնարավոր չէ ջնջել։</p>
            <div className="form">
              <label>Եղանակ<SelectField value={form.method} onChange={v => setForm(f => ({ ...f, method: v }))} options={MANUAL} ariaLabel="Եղանակ" /></label>
              <label>Հղման համար<input className="input" value={form.reference} onChange={setF('reference')} placeholder="Փոխանցման / անդորրագրի №" /></label>
              <label className="full">Նշում<input className="input" value={form.note} onChange={setF('note')} /></label>
              <div className="full" style={{ display: 'flex', gap: 8 }}>
                <button className="btn sm ghost" onClick={() => setPanel(null)}>Չեղարկել</button>
                <button className="btn sm primary" disabled={!!busy || form.reference.trim().length < 3}
                  onClick={() => dash.confirm('Գրանցե՞լ վճարումը', `Պատվեր № ${o.order_number}-ը կնշվի վճարված (${amd(o.amount)}, հղում՝ ${form.reference})։`, 'Գրանցել',
                    () => act({ action: 'manual_payment', method: form.method, reference: form.reference, note: form.note }, 'manual', 'Վճարումը գրանցվեց'), false)}>
                  Գրանցել վճարումը
                </button>
              </div>
            </div>
          </div>
        )}

        {panel === 'amount' && (
          <div className="dr-sec">
            <h4>Գնի սահմանում</h4>
            <p className="small muted" style={{ marginTop: 0 }}>Այս դիզայնը կատալոգում գին չունի։ Գինը սահմանելուց հետո հաճախորդը կարող է վճարել իր պատվերի էջից։</p>
            <div className="form">
              <label>Գինը (֏)<input className="input" inputMode="numeric" value={form.amount} onChange={setF('amount')} /></label>
              <div className="full" style={{ display: 'flex', gap: 8 }}>
                <button className="btn sm ghost" onClick={() => setPanel(null)}>Չեղարկել</button>
                <button className="btn sm primary" disabled={!!busy} onClick={() => act({ action: 'set_amount', amount: Number(form.amount.replace(/\s/g, '')) }, 'amount', 'Գինը սահմանվեց')}>Պահպանել</button>
              </div>
            </div>
          </div>
        )}

        <div className="dr-sec">
          <h4>Պատմություն</h4>
          <div className="lines">
            {events.map(e => (
              <div key={e.id}>
                <span>{EVENT_KIND[e.kind] || e.kind}<span className="muted small"> · {SOURCE[e.source] || e.source}</span></span>
                <span className="muted small nowrap">{dt(e.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dr-f">
        <SelectField value={o.order_status} ariaLabel="Պատվերի կարգավիճակ"
          onChange={v => act({ action: 'set_status', status: v }, 'status', 'Կարգավիճակը թարմացվեց')}
          options={Object.entries(ORD_ST).map(([k, v]) => [k, v.l])} />
        <span className="spacer" />
        {canVerify && <button className="btn sm" disabled={!!busy} onClick={() => act({ action: 'verify' }, 'verify', 'Ստուգվեց բանկում')}>{busy === 'verify' ? 'Ստուգվում է…' : 'Ստուգել բանկում'}</button>}
        {canSetAmount && <button className="btn sm" onClick={() => setPanel('amount')}>Սահմանել գինը</button>}
        {canManual && <button className="btn sm" onClick={() => setPanel('manual')}>Գրանցել վճարում</button>}
      </div>
    </>
  );
}
