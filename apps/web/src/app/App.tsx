import { useState } from 'react';
import { GameActivity } from '../components/GameActivity';
import type { GameState } from '@snack-market/game-core';
import { useGameSession } from '../hooks/useGameSession';
import { ActivityHeader } from '../components/ActivityHeader';
import { snacks } from '../data/snacks';

const snackIds = snacks.map((snack) => snack.id);

export function App({ initialState }: { initialState: GameState }) {
  const game = useGameSession(initialState, snackIds);
  const [interactionEpoch, setInteractionEpoch] = useState(0);
  const restart = () => {
    setInteractionEpoch((value) => value + 1);
    if (window.confirm('현재 활동을 처음부터 다시 시작할까요?')) game.restartStudent();
  };
  return (
    <main className="classroom-layout">
      <ActivityHeader selectedStudent={game.state.activeStudentId} onSelect={(id) => { setInteractionEpoch((value) => value + 1); game.selectStudent(id); }} onRestart={restart} />
      <GameActivity key={`${game.question.id}:${interactionEpoch}`} game={game} />
    </main>
  );
}
