import { useCallback, useState } from 'react';
import { CompletionConfetti } from './CompletionConfetti';
import { DigitTarget } from './DigitTarget';
import type { CashInteraction } from '../hooks/useCashInteraction';
import type { Digits } from '@snack-market/game-core';
import { places } from '../data/places';

export function PriceDigits({ digits, interaction, completed = false }: { digits: Digits; interaction?: CashInteraction; completed?: boolean }) {
  const [previousCompleted, setPreviousCompleted] = useState(completed);
  const [celebrating, setCelebrating] = useState(false);
  const finish = useCallback(() => setCelebrating(false), []);
  if (previousCompleted !== completed) {
    setPreviousCompleted(completed);
    setCelebrating(completed);
  }
  return (
    <div className="price-digits" data-completed={completed || undefined} role="group" aria-label="만든 금액">
      <div className="digit-track">
        {places.map((place) => (
          <div className="digit-position" key={place.id}>
            {interaction && !completed ? <DigitTarget place={place} digit={digits[place.corePlace]} interaction={interaction} /> : <span className="digit-box" data-place={place.id}>{digits[place.corePlace]}</span>}
          </div>
        ))}
      </div>
      {celebrating && <CompletionConfetti onFinish={finish} />}
      <span className="price-unit">원</span>
    </div>
  );
}
