import { ActivityHeader } from '../components/ActivityHeader';
import { PriceDigits } from '../components/PriceDigits';
import { SnackCard } from '../components/SnackCard';
import { Wallet } from '../components/Wallet';
import { snacks } from '../data/snacks';

export function App() {
  return (
    <main className="classroom-layout">
      <ActivityHeader />
      <div className="activity-panel" id="activity-panel" role="tabpanel" aria-labelledby="student-tab-1">
        <SnackCard snack={snacks[0]} />
        <PriceDigits />
        <Wallet />
      </div>
    </main>
  );
}
