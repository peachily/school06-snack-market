import { describe, expect, it } from 'vitest';
import {
  createCashTokens, createQuestion, createStudentQuestions,
  generatePrice, shuffleSnacks, splitDigits,
} from './index';
import type { Level, RandomSource } from './index';

const snackIds = Object.freeze(Array.from({ length: 30 }, (_, i) => `snack${String(i + 1).padStart(2, '0')}`));
const highest = 1 - Number.EPSILON;

function sequence(...values: number[]): RandomSource {
  let index = 0;
  return () => {
    const value = values[index++];
    if (value === undefined) throw new Error('준비한 난수를 모두 사용했습니다.');
    return value;
  };
}

function samplesForPrice(price: number, level: 3 | 4 = 4): number[] {
  const { thousands, hundreds, tens, ones } = splitDigits(price);
  return [(thousands - 0.5) / 9, (hundreds + 0.5) / 10,
    level === 3 ? (tens - 0.5) / 9 : (tens + 0.5) / 10,
    ...(level === 4 ? [(ones - 0.5) / 9] : [])];
}

describe('수준별 가격 생성', () => {
  it.each([
    [1, 1000, 9000], [2, 1100, 9900], [3, 1010, 9990], [4, 1001, 9999],
  ] as const)('수준 %i의 최솟값과 최댓값', (level, min, max) => {
    expect(generatePrice(level, () => 0)).toBe(min);
    expect(generatePrice(level, () => highest)).toBe(max);
  });

  it('수준 1의 가능한 9개 가격을 모두 확인한다', () => {
    for (let thousands = 1; thousands <= 9; thousands += 1) {
      const price = generatePrice(1, sequence((thousands - 0.5) / 9));
      expect(price).toBe(thousands * 1000);
      expect(price % 1000).toBe(0);
    }
  });

  it('수준 2의 가능한 81개 가격을 모두 확인한다', () => {
    for (let thousands = 1; thousands <= 9; thousands += 1) {
      for (let hundreds = 1; hundreds <= 9; hundreds += 1) {
        expect(generatePrice(2, sequence((thousands - 0.5) / 9, (hundreds - 0.5) / 9)))
          .toBe(thousands * 1000 + hundreds * 100);
      }
    }
  });

  it('수준 3의 가능한 810개 가격은 십의 자리가 있고 백의 자리 0을 허용한다', () => {
    for (let thousands = 1; thousands <= 9; thousands += 1) {
      for (let hundreds = 0; hundreds <= 9; hundreds += 1) {
        for (let tens = 1; tens <= 9; tens += 1) {
          const price = thousands * 1000 + hundreds * 100 + tens * 10;
          expect(generatePrice(3, sequence(...samplesForPrice(price, 3)))).toBe(price);
        }
      }
    }
  });

  it('수준 4의 가능한 8100개 가격은 일의 자리가 있고 백·십의 자리 0을 허용한다', () => {
    for (let price = 1001; price <= 9999; price += 1) {
      if (price % 10 === 0) continue;
      expect(generatePrice(4, sequence(...samplesForPrice(price)))).toBe(price);
    }
  });

  it.each([1001, 3045, 5007, 8431])('수준 4에서 %i를 생성한다', (price) => {
    expect(generatePrice(4, sequence(...samplesForPrice(price)))).toBe(price);
  });

  it.each([-0.01, 1, NaN, Infinity])('잘못된 난수 %s를 거부한다', (sample) => {
    expect(() => generatePrice(1, () => sample)).toThrow(RangeError);
    expect(() => shuffleSnacks(snackIds, () => sample)).toThrow(RangeError);
  });

  it('범위 밖 수준을 거부한다', () => {
    expect(() => generatePrice(5 as Level, () => 0)).toThrow(RangeError);
  });
});

describe('자릿값과 고정 현금 목록', () => {
  it.each([
    [1020, { thousands: 1, hundreds: 0, tens: 2, ones: 0 }],
    [3420, { thousands: 3, hundreds: 4, tens: 2, ones: 0 }],
    [5007, { thousands: 5, hundreds: 0, tens: 0, ones: 7 }],
    [9999, { thousands: 9, hundreds: 9, tens: 9, ones: 9 }],
  ] as const)('%i를 정확한 자릿값으로 분리한다', (price, digits) => {
    expect(splitDigits(price)).toEqual(digits);
  });

  it.each([999, 10000, 1020.5, NaN, Infinity, -1000])('잘못된 가격 %s를 거부한다', (price) => {
    expect(() => splitDigits(price)).toThrow(RangeError);
    expect(() => createCashTokens(price, 'q1')).toThrow(RangeError);
  });

  it('3420원의 현금을 자리별 순서와 0부터 시작하는 슬롯에 배치한다', () => {
    const cash = createCashTokens(3420, 'q1');
    expect(cash.map(({ denomination, slotIndex }) => [denomination, slotIndex])).toEqual([
      [1000, 0], [1000, 1], [1000, 2],
      [100, 0], [100, 1], [100, 2], [100, 3],
      [10, 0], [10, 1],
    ]);
    expect(cash.filter((token) => token.place === 'ones')).toHaveLength(0);
    expect(new Set(cash.map((token) => token.id)).size).toBe(9);
    expect(cash.reduce((sum, token) => sum + token.denomination, 0)).toBe(3420);
  });

  it('최대 36개 현금을 각 자리의 슬롯 0~8에 배치한다', () => {
    const cash = createCashTokens(9999, 'q1');
    expect(cash).toHaveLength(36);
    for (const place of ['thousands', 'hundreds', 'tens', 'ones']) {
      expect(cash.filter((token) => token.place === place).map((token) => token.slotIndex))
        .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    }
  });

  it('현금 목록과 슬롯은 수정·삭제할 수 없고 사용 ID를 별도로 관리할 수 있다', () => {
    const cash = createCashTokens(3000, 'q1');
    const usedIds = new Set([cash[1].id]);
    expect(cash.map((token) => usedIds.has(token.id))).toEqual([false, true, false]);
    expect(Reflect.deleteProperty(cash, '1')).toBe(false);
    expect(Reflect.set(cash[2], 'slotIndex', 1)).toBe(false);
    expect(cash.map((token) => token.slotIndex)).toEqual([0, 1, 2]);
    expect(createCashTokens(3000, 'q1')).toEqual(cash);
    expect(createCashTokens(3000, 'q2').some((token) => cash.some((other) => other.id === token.id))).toBe(false);
  });

  it('빈 문제 ID는 거부한다', () => {
    expect(() => createCashTokens(1000, ' ')).toThrow();
  });
});

describe('Fisher–Yates 과자 셔플', () => {
  it('0을 주입하면 예상 순열이 나오고 입력은 변하지 않는다', () => {
    const shuffled = shuffleSnacks(snackIds, sequence(...Array<number>(29).fill(0)));
    expect(shuffled).toEqual([...snackIds.slice(1), snackIds[0]]);
    expect(new Set(shuffled).size).toBe(30);
    expect([...shuffled].sort()).toEqual([...snackIds].sort());
    expect(snackIds[0]).toBe('snack01');
  });

  it('상한 직전 난수로 원래 순서가 나오는 것도 허용한다', () => {
    expect(shuffleSnacks(snackIds, sequence(...Array<number>(29).fill(highest)))).toEqual(snackIds);
  });

  it.each([
    snackIds.slice(1), [...snackIds, 'snack31'],
    [...snackIds.slice(0, 29), 'snack01'], [...snackIds.slice(0, 29), ' '],
  ].map((ids) => ({ ids })))('누락·초과·중복·빈 ID가 있는 목록은 거부한다', ({ ids }) => {
    expect(() => shuffleSnacks(ids, () => 0)).toThrow();
  });
});

describe('문제 구성', () => {
  it.each([
    [1, 1000, 5000, 1000, 9000],
    [2, 1100, 5500, 1100, 9900],
    [3, 1110, 5550, 1010, 9990],
    [4, 1111, 5555, 1001, 9999],
  ] as const)('수준 %i는 첫 세 문제만 1~5를 쓰고 네 번째부터 전체 범위를 쓴다', (studentId, introMin, introMax, normalMin, normalMax) => {
    for (const [random, firstPrice, laterPrice] of [[() => 0, introMin, normalMin], [() => highest, introMax, normalMax]] as const) {
      const questions = createStudentQuestions({ studentId, sessionId: 'intro', snackIds, random });
      expect(questions.slice(0, 3).map((q) => q.targetPrice)).toEqual([firstPrice, firstPrice, firstPrice]);
      expect(questions.slice(3).map((q) => q.targetPrice)).toEqual(Array(27).fill(laterPrice));
      for (const question of questions) expect(question.cash.reduce((sum, cash) => sum + cash.denomination, 0)).toBe(question.targetPrice);
    }
  });

  it('과자 ID와 독립적으로 가격을 생성하고 목표 수량·현금과 일치시킨다', () => {
    const question = createQuestion({ questionId: 'q1', snackId: 'snack01', level: 3, random: sequence(...samplesForPrice(3420, 3)) });
    expect(question.snackId).toBe('snack01');
    expect(question.targetPrice).toBe(3420);
    expect(question.targetDigits).toEqual({ thousands: 3, hundreds: 4, tens: 2, ones: 0 });
    expect(question.cash.reduce((sum, token) => sum + token.denomination, 0)).toBe(question.targetPrice);
    const other = createQuestion({ questionId: 'q2', snackId: 'snack30', level: 3, random: sequence(...samplesForPrice(3420, 3)) });
    expect(other.targetPrice).toBe(question.targetPrice);
  });

  it('학생별 30문제를 독립 생성하고 가격 중복과 학생 간 과자 중복을 허용한다', () => {
    const first = createStudentQuestions({ studentId: 1, sessionId: 's1', snackIds, random: () => 0 });
    const snapshot = JSON.stringify(first);
    const second = createStudentQuestions({ studentId: 2, sessionId: 's1', snackIds, random: () => highest });
    expect(first).toHaveLength(30);
    expect(second).toHaveLength(30);
    expect(first.map((q) => q.snackId)).toEqual([...snackIds.slice(1), snackIds[0]]);
    expect(second.map((q) => q.snackId)).toEqual(snackIds);
    expect(new Set(first.map((q) => q.targetPrice))).toEqual(new Set([1000]));
    expect(second.slice(0, 3).map((q) => q.targetPrice)).toEqual([5500, 5500, 5500]);
    expect(new Set(second.slice(3).map((q) => q.targetPrice))).toEqual(new Set([9900]));
    expect(new Set([...first, ...second].map((q) => q.id)).size).toBe(60);
    const tokens = [...first, ...second].flatMap((q) => q.cash);
    expect(new Set(tokens.map((token) => token.id)).size).toBe(tokens.length);
    expect(JSON.stringify(first)).toBe(snapshot);
    const restart = createStudentQuestions({ studentId: 1, sessionId: 's2', snackIds, random: () => 0 });
    expect(restart[0].cash[0].id).not.toBe(first[0].cash[0].id);
    expect(createStudentQuestions({ studentId: 1, sessionId: 's1', snackIds, random: () => 0 })).toEqual(first);
  });

  it('같은 난수를 쓰면 학생 간 동일 순서가 나와도 허용한다', () => {
    const first = createStudentQuestions({ studentId: 1, sessionId: 's1', snackIds, random: () => 0 });
    const third = createStudentQuestions({ studentId: 3, sessionId: 's1', snackIds, random: () => 0 });
    expect(third.map((q) => q.snackId)).toEqual(first.map((q) => q.snackId));
    expect(third[0]).not.toBe(first[0]);
    expect(third[0].cash).not.toBe(first[0].cash);
  });

  it('빈 세션·과자 ID를 거부한다', () => {
    expect(() => createStudentQuestions({ studentId: 1, sessionId: '', snackIds, random: () => 0 })).toThrow();
    expect(() => createQuestion({ questionId: 'q1', snackId: '', level: 1, random: () => 0 })).toThrow();
  });
});
