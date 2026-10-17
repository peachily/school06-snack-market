import { useRef } from 'react';
import { DragDropProvider, PointerSensor } from '@dnd-kit/react';
import { Feedback, PointerActivationConstraints } from '@dnd-kit/dom';
import { useCashInteraction } from '../hooks/useCashInteraction';
import type { useGameSession } from '../hooks/useGameSession';
import { snacks } from '../data/snacks';
import { PriceDigits } from './PriceDigits';
import { SnackCard } from './SnackCard';
import { Wallet } from './Wallet';

const sensors = [PointerSensor.configure({
  activationConstraints: (event) => [new PointerActivationConstraints.Distance({ value: event.pointerType === 'touch' ? 8 : 5 })],
  preventActivation: (event) => !event.isPrimary || event.button !== 0,
})];

type Props = { game: ReturnType<typeof useGameSession> };

function ActivityContent({ game }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const interaction = useCashInteraction(game.cash, game.useCash, panelRef);
  const snack = snacks.find((item) => item.id === game.question.snackId)!;
  return (
    <div ref={panelRef} className="activity-panel" id="activity-panel" role="tabpanel" aria-labelledby={`student-tab-${game.state.activeStudentId}`}>
      <SnackCard snack={snack} onNext={game.question.completed && !game.student.completed ? game.nextQuestion : undefined} />
      <PriceDigits digits={game.digits} interaction={interaction} completed={game.question.completed} />
      <Wallet cash={game.cash} interaction={interaction} />
      <span className="sr-only" role="status" aria-live="polite">{interaction.announcement}</span>
    </div>
  );
}

export function GameActivity({ game }: Props) {
  return (
    <DragDropProvider sensors={sensors} plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: { duration: 180, easing: 'ease-out' } })]}>
      <ActivityContent game={game} />
    </DragDropProvider>
  );
}
