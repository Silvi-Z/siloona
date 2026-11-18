import Overview from './Overview';
import EventDashboard from './EventDashboard';
import Invitation from './Invitation';
import Designs from './Designs';
import Guests from './Guests';
import Rsvp from './Rsvp';
import Details from './Details';
import Calendar from './Calendar';
import Events from './Events';
import Archive from './Archive';
import Account from './Account';
import Orders from './Orders';
import { useDashboard } from '../state/DashboardContext';

function EventPage() {
  const { ctx } = useDashboard();
  return <EventDashboard ev={ctx()} />;
}

export const PAGES = {
  overview: { component: Overview, modes: ['couple', 'org'] },
  event: { component: EventPage, modes: ['org'] },
  designs: { component: Designs, modes: ['couple', 'org'] },
  invitation: { component: Invitation, modes: ['couple', 'org'] },
  guests: { component: Guests, modes: ['couple', 'org'] },
  rsvp: { component: Rsvp, modes: ['couple', 'org'] },
  details: { component: Details, modes: ['couple', 'org'] },
  calendar: { component: Calendar, modes: ['couple', 'org'] },
  events: { component: Events, modes: ['org'] },
  archive: { component: Archive, modes: ['org'] },
  account: { component: Account, modes: ['couple', 'org'] },
  orders: { component: Orders, modes: ['couple', 'org'], admin: true },
};
