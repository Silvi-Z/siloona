// A design's content for a dashboard event: the design's demo content,
// overlaid with the event's details (the per-design mapping lives in
// site/invitationPrefill.js, shared with the public /i/:code page), then
// the user's own edits from the editor, which always win (see
// InvitationStudio.jsx).
import { INVITATION_DEFAULTS, INVITATION_SECTIONS } from '../../site/invitationDefaults';
import { deepMerge, diffData, setByPath } from '../../site/invitations/shared/pathUtils';
import * as actions from './actions';
import { prefillFromEvent } from '../../site/invitationPrefill';

export { prefillFromEvent };

// One design's content for one event, as every dashboard view shows it:
//   base    — the design's demo content overlaid with the event's details
//   saved   — the user's own edits (diffs against base), if any
//   content — base + saved, i.e. what the guest would actually see
// Used by both the editor (InvitationStudio) and the live preview on
// «Իմ հրավերը», so the two can never disagree.
export function eventDesignContent(slug, ev) {
  const defaults = INVITATION_DEFAULTS[slug];
  if (!defaults) return null;
  const base = deepMerge(defaults, prefillFromEvent(slug, ev));
  const saved = ev.inv.designContent?.[slug];
  return { base, saved, content: deepMerge(base, saved) };
}

// The design's declared sections (site/invitations/<design>/sections.js) —
// what the editor offers for it, and nothing else.
export const designSections = (slug) => INVITATION_SECTIONS[slug] || [];

// Save the whole edited content (the in-place editors hand over a complete
// object) — stored as a diff against the event-derived base.
export function saveDesignEdit(ev, slug, next) {
  actions.saveDesignContent(ev, slug, diffData(eventDesignContent(slug, ev).base, next));
  return eventDesignContent(slug, ev).content;
}

// Set one field (or `hidden.<id>`) — what the dashboard's section editor uses.
export function setDesignField(ev, slug, path, value) {
  return saveDesignEdit(ev, slug, setByPath(eventDesignContent(slug, ev).content, path, value));
}

// The name the dashboard preview personalizes the greeting with: the first
// guest on the list, so the organizer sees how a real guest's link reads.
export const sampleGuestName = (ev) => ev.guests?.find(g => g.first)?.first || 'Աննա';
