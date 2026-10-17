import { useDroppable } from '@dnd-kit/react';
import { pointerIntersection } from '@dnd-kit/collision';
import type { Digit } from '@snack-market/game-core';
import { places } from '../data/places';
import type { CashInteraction } from '../hooks/useCashInteraction';

type Props = { place: typeof places[number]; digit: Digit; interaction: CashInteraction };

export function DigitTarget({ place, digit, interaction }: Props) {
  const { ref, isDropTarget } = useDroppable({ id: place.corePlace, collisionDetector: pointerIntersection });
  const error = interaction.rejected?.place === place.corePlace;
  return (
    <button ref={ref} type="button" className="digit-target" data-drop-place={place.corePlace}
      data-over={isDropTarget || undefined} aria-label={`${place.label}의 자리`}
      onClick={() => interaction.choosePlace(place.corePlace)}
      onKeyDown={(event) => {
        const index = places.findIndex((item) => item.id === place.id);
        const target = event.key === 'ArrowRight' ? (index + 1) % 4 : event.key === 'ArrowLeft' ? (index + 3) % 4 : null;
        if (target === null) return;
        event.preventDefault();
        event.currentTarget.closest('.digit-track')?.querySelector<HTMLButtonElement>(`[data-drop-place="${places[target].corePlace}"]`)?.focus();
      }}>
      <span key={error ? interaction.rejected?.key : 'normal'} className={`digit-box${error ? ' digit-error' : ''}`} data-place={place.id}>{digit}</span>
    </button>
  );
}
