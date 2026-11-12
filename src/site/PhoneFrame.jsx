// A minimal device-frame mockup: bezel + island + screen. Used to present
// any invitation preview (real photo or generated art) as if seen on a
// phone, since guests open invitations on mobile almost exclusively.
export default function PhoneFrame({ children }) {
  return (
    <div className="phone-frame">
      <span className="phone-island" />
      <div className="phone-screen">{children}</div>
    </div>
  )
}
