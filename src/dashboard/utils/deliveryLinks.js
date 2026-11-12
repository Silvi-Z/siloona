import { CHANNELS } from '../data/constants';
import { guestInviteUrl, personalizedGreeting, fullName } from '../data/selectors';

// Builds the real, working manual-send payload for one guest on their
// chosen channel: the personalized text, their unique invite link, and
// (where the channel actually supports it) a deep link that opens the
// guest's own WhatsApp/Telegram/SMS/mail app with it prefilled. Viber has
// no public web deep-link for messaging an arbitrary phone number, so it
// gets `copyOnly: true` instead of a fabricated link.
export function buildDelivery(ev, g) {
  const ch = CHANNELS[g.channel];
  const url = `https://${guestInviteUrl(ev, g)}`;
  const greeting = personalizedGreeting(ev, g);
  const text = `${greeting}\n\n${url}`;
  const subject = `Հրավեր՝ ${ev.title}`;
  const contact = g[ch.contact];
  return {
    channel: g.channel, contactOk: !!contact, url, text,
    link: ch.copyOnly || !contact ? null : ch.link(contact, text, url, subject),
    copyOnly: !!ch.copyOnly,
  };
}

export function fullCopyText(ev, g) {
  return `${fullName(g)}\n${buildDelivery(ev, g).text}`;
}
