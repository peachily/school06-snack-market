import { randomInteger } from './random';
import type { RandomSource } from './types';

export function shuffleSnacks(snackIds: readonly string[], random: RandomSource): readonly string[] {
  if (snackIds.length !== 30 || new Set(snackIds).size !== 30 || snackIds.some((id) => id.trim() === '')) {
    throw new Error('비어 있지 않은 고유 과자 ID가 정확히 30개 필요합니다.');
  }

  const shuffled = [...snackIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = randomInteger(0, index, random);
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return Object.freeze(shuffled);
}
