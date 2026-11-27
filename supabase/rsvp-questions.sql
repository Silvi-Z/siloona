-- Siloona: the couple's own RSVP questions (the `extra_rsvp_question`
-- add-on, src/site/addons.js). Run after personal-links.sql, in the
-- Supabase SQL editor. It only ADDS columns; safe to re-run.
--
--   invitations.settings   the invitation's settings the couple keeps on
--                          their order page; here { rsvpQuestions: [
--                            { id, type: text|choice|yesno, text, options?, required? } ] }
--                          (1–3 questions, checked by api/_lib/rsvpQuestions.js)
--   invitation_rsvps.answers  a guest's answers: { "<question id>": "…" }

alter table invitations add column if not exists settings jsonb not null default '{}'::jsonb;
alter table invitations drop constraint if exists invitations_settings_object;
alter table invitations add constraint invitations_settings_object check (jsonb_typeof(settings) = 'object');

alter table invitation_rsvps add column if not exists answers jsonb;
alter table invitation_rsvps drop constraint if exists invitation_rsvps_answers_object;
alter table invitation_rsvps add constraint invitation_rsvps_answers_object check (answers is null or jsonb_typeof(answers) = 'object');
