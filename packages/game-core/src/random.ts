import type { RandomSource } from './types';

export function randomInteger(min: number, max: number, random: RandomSource): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('난수는 0 이상 1 미만이어야 합니다.');
  }
  return min + Math.floor(value * (max - min + 1));
}
