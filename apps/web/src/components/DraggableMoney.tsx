import { useDraggable } from '@dnd-kit/react';
import { getCashLabel } from '../data/cash';
import type { Cash } from '../data/types';
import type { AvailableCash, CashInteraction } from '../hooks/useCashInteraction';
import { MoneyPiece } from './MoneyPiece';

type Props = { token: AvailableCash; cash: Cash; interaction: CashInteraction };

export function DraggableMoney({ token, cash, interaction }: Props) {
  const { ref, handleRef, isDragging, isDropping } = useDraggable({ id: token.id, disabled: token.used || interaction.disabled });
  return (
    <button
      ref={(element) => { ref(element); handleRef(element); }}
      type="button"
      disabled={interaction.disabled}
      className="money-button"
      data-cash-button={token.id}
      data-dragging={isDragging || isDropping || undefined}
      aria-label={`${getCashLabel(cash)}, ${token.slotIndex + 1}번`}
      aria-pressed={interaction.selectedId === token.id}
      onPointerDown={interaction.preparePointer}
      onKeyDown={interaction.preparePointer}
      onClick={(event) => interaction.selectCash(token.id, event.detail === 0)}
      onDragStart={(event) => event.preventDefault()}
    >
      <MoneyPiece cash={cash} />
    </button>
  );
}
