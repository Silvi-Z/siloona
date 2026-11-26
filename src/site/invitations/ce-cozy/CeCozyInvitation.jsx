import { NewYearParty } from '../ce-sparkle/CeSparkleInvitation'
// after ce-sparkle.css (imported by the layout), so these colours win
import './ce-cozy.css'

// "Ձմեռային տոն" — ce-cozy. A decorated tree by a snowy window; the
// NewYearParty layout (ce-sparkle) in cream, gold and deep red (ce-cozy.css).
export default function CeCozyInvitation() {
  return <NewYearParty design="ce-cozy" variant="ccz" twinkles={false} />
}
