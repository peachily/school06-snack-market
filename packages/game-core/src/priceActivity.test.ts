import { describe, expect, it } from 'vitest';
import { createPriceSession, priceSessionReducer, type PriceSession } from './priceActivity';
import { getDisplayedDigits } from './session';

const exercises = Array.from({ length: 30 }, (_, index) => ({ snackId: `snack${index}`, price: index === 0 ? 2307 : 1020 }));
const fresh = () => createPriceSession('price', exercises);
const context = (state: PriceSession) => ({ sessionId: state.sessionId, questionId: state.questions[state.currentIndex].id });
function complete(state: PriceSession) {
  for (const cash of state.questions[state.currentIndex].cash) {
    state = priceSessionReducer(state, { type: 'use-cash', ...context(state), cashId: cash.id, targetPlace: cash.place });
  }
  return state;
}

describe('가격만큼 옮기기 세션', () => {
  it('고정 순서와 가격을 유지하며 매 문제 36개 고정 슬롯을 제공한다', () => {
    const state = fresh();
    expect(state.questions.map((q) => ({ snackId: q.snackId, price: q.targetPrice }))).toEqual(exercises);
    for (const q of state.questions) {
      expect(q.cash).toHaveLength(36);
      expect(new Set(q.cash.map((cash) => cash.id)).size).toBe(36);
      for (const place of ['thousands', 'hundreds', 'tens', 'ones']) {
        expect(q.cash.filter((cash) => cash.place === place).map((cash) => cash.slotIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      }
    }
  });

  it('오답, 중복, 목표 초과, 0인 자리와 완료 전 다음 이동을 거부한다', () => {
    let state = fresh();
    const cash = state.questions[0].cash;
    expect(priceSessionReducer(state, { type: 'next-question', ...context(state) })).toBe(state);
    expect(priceSessionReducer(state, { type: 'use-cash', ...context(state), cashId: cash[0].id, targetPlace: 'ones' })).toBe(state);
    expect(priceSessionReducer(state, { type: 'use-cash', ...context(state), cashId: cash[18].id, targetPlace: 'tens' })).toBe(state);
    for (const index of [8, 4]) state = priceSessionReducer(state, { type: 'use-cash', ...context(state), cashId: cash[index].id, targetPlace: 'thousands' });
    for (const index of [8, 0]) expect(priceSessionReducer(state, { type: 'use-cash', ...context(state), cashId: cash[index].id, targetPlace: 'thousands' })).toBe(state);
    expect(state.questions[0].cash).toBe(cash);
    expect(getDisplayedDigits(state.questions[0]).thousands).toBe(2);
  });

  it('남은 현금과 0인 자리 조작 없이 완료하고 30번 뒤에는 출제하지 않는다', () => {
    let state = fresh();
    for (let index = 0; index < 30; index += 1) {
      expect(state.currentIndex).toBe(index);
      expect(getDisplayedDigits(state.questions[index])).toEqual({ thousands: 0, hundreds: 0, tens: 0, ones: 0 });
      state = complete(state);
      const question = state.questions[index];
      expect(question.completed).toBe(true);
      expect(question.usedCashIds.length).toBeLessThan(36);
      expect(getDisplayedDigits(question)).toEqual(question.targetDigits);
      const oldContext = context(state);
      const next = priceSessionReducer(state, { type: 'next-question', ...oldContext });
      if (index === 29) { expect(state.completed).toBe(true); expect(next).toBe(state); }
      else { expect(priceSessionReducer(next, { type: 'next-question', ...oldContext })).toBe(next); }
      state = next;
    }
  });

  it('다시 시작하면 같은 순서와 가격으로 초기화하며 이전 세션 이벤트를 무시한다', () => {
    const state = complete(fresh());
    const reset = priceSessionReducer(state, { type: 'restart', sessionId: state.sessionId, replacement: createPriceSession('new', exercises) });
    expect(reset.currentIndex).toBe(0);
    expect(reset.questions[0].usedCashIds).toEqual([]);
    expect(priceSessionReducer(reset, { type: 'next-question', ...context(state) })).toBe(reset);
    expect(() => createPriceSession('bad', exercises.slice(1))).toThrow();
    expect(() => createPriceSession('bad', exercises.map(() => exercises[0]))).toThrow();
  });
});
