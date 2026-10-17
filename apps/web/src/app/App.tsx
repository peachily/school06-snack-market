import type { GameState } from '@snack-market/game-core';
import { useGameSession } from '../hooks/useGameSession';
import { ActivityHeader } from '../components/ActivityHeader';
import { PriceDigits } from '../components/PriceDigits';
import { SnackCard } from '../components/SnackCard';
import { Wallet } from '../components/Wallet';
import { snacks } from '../data/snacks';

const snackIds = snacks.map((snack) => snack.id);

export function App({ initialState }: { initialState: GameState }) {
  const game = useGameSession(initialState, snackIds);
  const snack = snacks.find((item) => item.id === game.question.snackId)!;
  const restart = () => {
    if (window.confirm('현재 활동을 처음부터 다시 시작할까요?')) game.restartStudent();
  };
  return (
    <main className="classroom-layout">
      <ActivityHeader selectedStudent={game.state.activeStudentId} onSelect={game.selectStudent} onRestart={restart} />
      <div className="activity-panel" id="activity-panel" role="tabpanel" aria-labelledby={`student-tab-${game.state.activeStudentId}`}>
        <SnackCard snack={snack} onNext={game.question.completed && !game.student.completed ? game.nextQuestion : undefined} />
        <PriceDigits digits={game.digits} />
        <Wallet cash={game.cash} />
      </div>
    </main>
  );
}
