import { splitDigits } from './price';
import type { CashToken, Place, SlotIndex } from './types';

const denominations = [
  ['thousands', 1000],
  ['hundreds', 100],
  ['tens', 10],
  ['ones', 1],
] as const satisfies readonly (readonly [Place, CashToken['denomination']])[];

export function createCashTokens(price: number, questionId: string): readonly CashToken[] {
  if (questionId.trim() === '') throw new Error('문제 ID가 필요합니다.');
  const digits = splitDigits(price);

  return Object.freeze(denominations.flatMap(([place, denomination]) =>
    Array.from({ length: digits[place] }, (_, slotIndex) => Object.freeze({
      id: JSON.stringify([questionId, place, slotIndex]),
      place,
      denomination,
      slotIndex: slotIndex as SlotIndex,
    })),
  ));
}
