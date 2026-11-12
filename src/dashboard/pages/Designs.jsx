import DesignPicker from '../components/DesignPicker';
import { useDashboard } from '../state/DashboardContext';

// «Բոլոր հրավերները» — the design catalog for the current event's type.
export default function Designs() {
  const dash = useDashboard();
  return <DesignPicker dash={dash} ev={dash.ctx()} />;
}
