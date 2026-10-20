import { useState } from 'react';
import { GameActivity } from '../components/GameActivity';
import type { GameState } from '@snack-market/game-core';
import { useGameSession } from '../hooks/useGameSession';
import { ActivityHeader } from '../components/ActivityHeader';
import { usePriceSession } from '../hooks/usePriceSession';
import { snacks } from '../data/snacks';

const snackIds = snacks.map((snack) => snack.id);

export function App({ initialState }: { initialState: GameState }) {
  const game = useGameSession(initialState, snackIds);
  const priceGame = usePriceSession();
  const [priceActivity, setPriceActivity] = useState(false);
  const [interactionEpoch, setInteractionEpoch] = useState(0);
  const restart = () => {
    setInteractionEpoch((value) => value + 1);
    if (window.confirm('현재 활동을 처음부터 다시 시작할까요?')) {
      if (priceActivity) priceGame.restart();
      else game.restartStudent();
    }
  };
  return (
    <main className="classroom-layout">
      <ActivityHeader priceActivity={priceActivity} onToggleActivity={() => setPriceActivity((value) => !value)} selectedStudent={game.state.activeStudentId} onSelect={(id) => { setInteractionEpoch((value) => value + 1); game.selectStudent(id); }} onRestart={restart} />
      <GameActivity key={`${priceActivity}:${(priceActivity ? priceGame : game).question.id}:${interactionEpoch}`} game={priceActivity ? priceGame : game} studentId={game.state.activeStudentId} priceActivity={priceActivity} />
    </main>
  );
}
