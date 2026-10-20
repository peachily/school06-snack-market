import { describe, expect, it } from 'vitest';
import { createGameState, createStudentSession, gameReducer, getCashState, getCurrentQuestion, getDisplayedDigits } from './session';
import type { GameAction, GameState } from './session';

const snackIds = Array.from({ length: 30 }, (_, i) => `snack${i + 1}`);
const fresh = () => createGameState({ sessionId: 'initial', snackIds, random: () => 0.3 });
function actionFor(state: GameState, index = 0): Extract<GameAction, { type: 'use-cash' }> {
  const student = state.students[state.activeStudentId];
  const question = getCurrentQuestion(student);
  const cash = question.cash[index];
  return { type: 'use-cash', studentId: student.studentId, sessionId: student.sessionId, questionId: question.id, cashId: cash.id, targetPlace: cash.place };
}
function finish(state: GameState): GameState {
  const count = getCurrentQuestion(state.students[state.activeStudentId]).cash.length;
  for (let i = 0; i < count; i += 1) state = gameReducer(state, actionFor(state, i));
  return state;
}
function next(state: GameState): GameAction {
  const { cashId: _cashId, targetPlace: _targetPlace, ...context } = actionFor(state);
  void _cashId; void _targetPlace;
  return { ...context, type: 'next-question' };
}

describe('학생별 게임 상태', () => {
  it('세 독립 세션과 30개 고유 문제, 초기 숫자 0을 만든다', () => {
    const state = fresh();
    expect(state.activeStudentId).toBe(1);
    for (const student of Object.values(state.students)) {
      expect(student.questions).toHaveLength(30);
      expect(new Set(student.questions.map((q) => q.snackId)).size).toBe(30);
      expect(student.currentIndex).toBe(0);
      expect(student.completed).toBe(false);
      expect(getDisplayedDigits(getCurrentQuestion(student))).toEqual({ thousands: 0, hundreds: 0, tens: 0, ones: 0 });
    }
    expect(state.students[1].questions).not.toBe(state.students[2].questions);
    expect(new Set(Object.values(state.students).map((s) => s.sessionId)).size).toBe(4);
  });

  it('5번째 문제의 부분 진행을 탭 왕복 후에도 유지한다', () => {
    let state = fresh();
    for (let i = 0; i < 4; i += 1) { state = finish(state); state = gameReducer(state, next(state)); }
    state = gameReducer(state, actionFor(state, 1));
    state = gameReducer(state, actionFor(state, 0));
    const first = state.students[1];
    state = gameReducer(state, { type: 'select-student', studentId: 2 });
    state = gameReducer(state, actionFor(state));
    const second = state.students[2];
    state = gameReducer(state, { type: 'select-student', studentId: 1 });
    expect(state.students[1]).toBe(first);
    expect(state.students[2]).toBe(second);
    expect(first.currentIndex).toBe(4);
    expect(getDisplayedDigits(getCurrentQuestion(first)).thousands).toBe(2);
  });

  it('중간 슬롯을 사용해도 목록 순서와 다른 학생 상태는 그대로다', () => {
    const state = createGameState({ sessionId: 'slots', snackIds, random: () => 0.5 });
    const snapshot = JSON.stringify(state);
    const updated = gameReducer(state, actionFor(state, 1));
    expect(JSON.stringify(state)).toBe(snapshot);
    expect(updated.students[2]).toBe(state.students[2]);
    expect(updated.students[3]).toBe(state.students[3]);
    const before = getCurrentQuestion(state.students[1]);
    const after = getCurrentQuestion(updated.students[1]);
    expect(after.cash).toBe(before.cash);
    expect(getCashState(after).map((cash) => [cash.slotIndex, cash.used])).toEqual([[0, false], [1, true], [2, false]]);
    expect(getDisplayedDigits(after).thousands).toBe(1);
  });

  it('오답·없는 현금·중복 현금·이전 세션 이벤트는 같은 상태를 반환한다', () => {
    const state = fresh();
    const action = actionFor(state);
    expect(gameReducer(state, { ...action, targetPlace: 'ones' })).toBe(state);
    expect(gameReducer(state, { ...action, cashId: 'missing' })).toBe(state);
    expect(gameReducer(state, { ...action, sessionId: 'old' })).toBe(state);
    expect(gameReducer(state, { ...action, questionId: 'old' })).toBe(state);
    const updated = gameReducer(state, action);
    expect(gameReducer(updated, action)).toBe(updated);
    const switched = gameReducer(state, { type: 'select-student', studentId: 2 });
    expect(gameReducer(switched, action)).toBe(switched);
  });

  it('목표보다 많은 현금 이동을 거부한다', () => {
    let state = finish(fresh());
    const student = state.students[1];
    const question = getCurrentQuestion(student);
    const extra = { ...question.cash[0], id: 'extra' };
    state = { ...state, students: { ...state.students, 1: { ...student, questions: [{ ...question, completed: false, cash: [...question.cash, extra] }, ...student.questions.slice(1)] } } };
    expect(gameReducer(state, actionFor(state, question.cash.length))).toBe(state);
  });

  it('완료 전 다음 이동 금지, 완료 후 한 번만 이동하고 새 문제는 0이다', () => {
    const state = fresh();
    expect(gameReducer(state, next(state))).toBe(state);
    const done = finish(state);
    expect(getCurrentQuestion(done.students[1]).completed).toBe(true);
    const action = next(done);
    const moved = gameReducer(done, action);
    expect(moved.students[1].currentIndex).toBe(1);
    expect(gameReducer(moved, action)).toBe(moved);
    expect(gameReducer(moved, actionFor(done))).toBe(moved);
    expect(getCashState(getCurrentQuestion(moved.students[1])).every((cash) => !cash.used)).toBe(true);
    expect(getDisplayedDigits(getCurrentQuestion(moved.students[1]))).toEqual({ thousands: 0, hundreds: 0, tens: 0, ones: 0 });
  });

  it('30번째 완료 즉시 종료하며 31번째 문제를 생성하지 않는다', () => {
    let state = fresh();
    const visited: string[] = [];
    for (let i = 0; i < 30; i += 1) {
      visited.push(getCurrentQuestion(state.students[1]).snackId);
      state = finish(state);
      expect(state.students[1].completed).toBe(i === 29);
      if (i < 29) state = gameReducer(state, next(state));
    }
    expect(new Set(visited).size).toBe(30);
    expect(state.students[1].currentIndex).toBe(29);
    expect(state.students[1].questions).toHaveLength(30);
    expect(gameReducer(state, next(state))).toBe(state);
    expect(gameReducer(state, actionFor(state))).toBe(state);
  });

  it('현재 학생만 새 세션으로 초기화하고 이전 이벤트를 거부한다', () => {
    const state = finish(fresh());
    const replacement = createStudentSession({ studentId: 1, sessionId: 'new', snackIds, random: () => 0 });
    const action = { type: 'restart-student', studentId: 1, sessionId: state.students[1].sessionId, replacement } as const;
    const reset = gameReducer(state, action);
    expect(reset.students[1]).toBe(replacement);
    expect(reset.students[1].currentIndex).toBe(0);
    expect(reset.students[1].completed).toBe(false);
    expect(reset.students[1].questions[0].usedCashIds).toEqual([]);
    expect(reset.students[2]).toBe(state.students[2]);
    expect(reset.students[3]).toBe(state.students[3]);
    expect(gameReducer(reset, action)).toBe(reset);
    expect(gameReducer(reset, actionFor(state))).toBe(reset);
    const switched = gameReducer(state, { type: 'select-student', studentId: 2 });
    expect(gameReducer(switched, action)).toBe(switched);
  });
});
