export const NAV = {
  couple: [{ items: [['overview', 'Գլխավոր'], ['designs', 'Բոլոր հրավերները'], ['invitation', 'Իմ հրավերը'], ['guests', 'Հյուրեր'], ['rsvp', 'RSVP պատասխաններ'], ['details', 'Միջոցառման մանրամասներ'], ['calendar', 'Օրացույց']] }],
  org: [
    { label: 'Աշխատանքային տարածք', items: [['overview', 'Ընդհանուր պատկեր'], ['events', 'Միջոցառումներ'], ['calendar', 'Օրացույց'], ['archive', 'Արխիվ']] },
    { label: 'Ընթացիկ միջոցառում', switcher: true, items: [['event', 'Վահանակ'], ['designs', 'Բոլոր հրավերները'], ['invitation', 'Իմ հրավերը'], ['guests', 'Հյուրեր'], ['rsvp', 'RSVP'], ['details', 'Մանրամասներ']] },
  ],
};
export const TITLES = {
  couple: { overview: 'Գլխավոր', designs: 'Բոլոր հրավերները', invitation: 'Իմ հրավերը', guests: 'Հյուրեր', rsvp: 'RSVP պատասխաններ', details: 'Միջոցառման մանրամասներ', calendar: 'Օրացույց', account: 'Կարգավորումներ', orders: 'Պատվերներ և վճարումներ' },
  org: { overview: 'Ընդհանուր պատկեր', events: 'Միջոցառումներ', calendar: 'Օրացույց', archive: 'Արխիվ', event: 'Միջոցառման վահանակ', designs: 'Բոլոր հրավերները', invitation: 'Իմ հրավերը', guests: 'Հյուրեր', rsvp: 'RSVP', details: 'Միջոցառման մանրամասներ', account: 'Կարգավորումներ', orders: 'Պատվերներ և վճարումներ' },
};
// Shown only to Siloona admins (AuthContext isAdmin), in either mode.
export const ADMIN_NAV = { label: 'Siloona', items: [['orders', 'Պատվերներ']] };
export const SCOPED = ['event', 'designs', 'invitation', 'guests', 'rsvp', 'details'];
export const PAGE_MODES = {
  overview: ['couple', 'org'], designs: ['couple', 'org'], invitation: ['couple', 'org'], guests: ['couple', 'org'], rsvp: ['couple', 'org'],
  details: ['couple', 'org'], calendar: ['couple', 'org'], account: ['couple', 'org'],
  event: ['org'], events: ['org'], archive: ['org'], orders: ['couple', 'org'],
};
