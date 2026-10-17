import { randomInteger } from './random';
import type { Digit, Digits, Level, RandomSource } from './types';

export function generatePrice(level: Level, random: RandomSource): number {
  if (level !== 1 && level !== 2 && level !== 3) {
    throw new RangeError('수준은 1, 2, 3 중 하나여야 합니다.');
  }

  const thousands = randomInteger(1, 9, random);
  if (level === 1) return thousands * 1000;

  const hundreds = randomInteger(level === 2 ? 1 : 0, 9, random);
  if (level === 2) return thousands * 1000 + hundreds * 100;

  return thousands * 1000 + hundreds * 100
    + randomInteger(0, 9, random) * 10 + randomInteger(0, 9, random);
}

export function splitDigits(price: number): Digits {
  if (!Number.isInteger(price) || price < 1000 || price > 9999) {
    throw new RangeError('가격은 1000 이상 9999 이하의 정수여야 합니다.');
  }

  return Object.freeze({
    thousands: Math.floor(price / 1000) as Digit,
    hundreds: Math.floor(price / 100) % 10 as Digit,
    tens: Math.floor(price / 10) % 10 as Digit,
    ones: price % 10 as Digit,
  });
}
