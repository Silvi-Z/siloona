// Line icons for the contacts in contacts.js (stroke = currentColor).
export default function ContactIcon({ id }) {
  if (id === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 4.2 3.6 10.8c-.8.3-.8 1.4 0 1.7l4.1 1.5 1.6 5.1c.2.7 1.1.9 1.6.4l2.4-2.2 4.4 3.2c.6.4 1.4.1 1.6-.6l3-14.5c.2-.9-.7-1.6-1.6-1.2Z" />
        <path d="m7.7 14 9.6-6.3-7 7.3" />
      </svg>
    )
  }
  if (id === 'viber') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.2c-4.7 0-8 1.6-8 7.3 0 3.3 1.2 5.2 3.2 6.1v3.6l3.1-2.9c.6.1 1.1.1 1.7.1 4.7 0 8-1.6 8-6.9S16.7 3.2 12 3.2Z" />
        <path d="M8.3 8.4c.4-.3.9-.2 1.1.2l.6 1.1c.2.4.1.8-.2 1.1l-.4.3c.4 1.1 1.2 1.9 2.3 2.4l.3-.4c.3-.3.7-.4 1.1-.2l1.1.6c.4.2.5.8.2 1.1-.6.8-1.5 1.1-2.4.7-1.9-.8-3.2-2.1-4-4-.3-.9 0-1.8.7-2.4Z" />
        <path d="M12.6 6.4a3.4 3.4 0 0 1 3.2 3.2M12.6 8.3a1.5 1.5 0 0 1 1.3 1.3" />
      </svg>
    )
  }
  if (id === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.2 19.8 5.3 16A8.2 8.2 0 1 1 8.4 19l-4.2.8Z" />
        <path d="M9.2 8.1c.3-.3.8-.3 1 .1l.6 1.2c.1.3.1.6-.1.8l-.4.4c.5 1 1.3 1.8 2.3 2.3l.4-.4c.2-.2.5-.3.8-.1l1.2.6c.4.2.4.7.1 1-.6.6-1.4.9-2.2.6-1.8-.7-3.1-2-3.8-3.8-.3-.8 0-1.6.6-2.2Z" />
      </svg>
    )
  }
  if (id === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.6 3.8c.5-.4 1.2-.3 1.5.2l1.6 2.6c.3.5.2 1.1-.2 1.5l-1.1 1c.9 2 2.5 3.6 4.5 4.5l1-1.1c.4-.4 1-.5 1.5-.2l2.6 1.6c.5.3.6 1 .2 1.5l-1 1.3c-.8 1-2.1 1.4-3.3 1-4.3-1.5-7.4-4.6-8.9-8.9-.4-1.2 0-2.5 1-3.3l.6-.7Z" />
      </svg>
    )
  }
  if (id === 'email') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="m4 6.5 8 6 8-6" />
      </svg>
    )
  }
  return null
}
