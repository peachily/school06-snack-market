import { describe, expect, it } from 'vitest';
import { createGameState, gameReducer, getCurrentQuestion, getDisplayedDigits, type StudentId } from './index';

describe('네 단계 전체 활동 통합', () => {
  it('서로 번갈아 진행해도 120문제의 현금·완료·독립성이 유지된다', () => {
    let seed = 73;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const snackIds = Array.from({ length: 30 }, (_, i) => `snack-${i + 1}`);
    let state = createGameState({ sessionId: 'integration', snackIds, random });
    const visited = new Map<StudentId, Set<string>>(([1, 2, 3, 4] as const).map((id) => [id, new Set<string>()]));
    for (let index = 0; index < 30; index += 1) {
      for (const studentId of [1, 2, 3, 4] as const) {
        state = gameReducer(state, { type: 'select-student', studentId });
        const student = state.students[studentId];
        const others = Object.values(state.students).filter((item) => item.studentId !== studentId);
        const question = getCurrentQuestion(student);
        const context = { studentId, sessionId: student.sessionId, questionId: question.id };
        visited.get(studentId)!.add(question.snackId);
        expect(student.currentIndex).toBe(index);
        expect(question.cash.reduce((sum, cash) => sum + cash.denomination, 0)).toBe(question.targetPrice);
        expect(gameReducer(state, { type: 'next-question', ...context }).students[studentId].currentIndex).toBe(Math.min(index + 1, 29));
        const order = [...question.cash].reverse();
        for (const [used, cash] of order.entries()) {
          const action = { type: 'use-cash', ...context, cashId: cash.id, targetPlace: cash.place } as const;
          state = gameReducer(state, action);
          expect(gameReducer(state, action)).toBe(state);
          expect(getCurrentQuestion(state.students[studentId]).completed).toBe(used === order.length - 1);
        }
        expect(getDisplayedDigits(getCurrentQuestion(state.students[studentId]))).toEqual(question.targetDigits);
        for (const other of others) expect(state.students[other.studentId]).toBe(other);
        const next = { type: 'next-question', ...context } as const;
        const moved = gameReducer(state, next);
        expect(gameReducer(moved, next)).toBe(moved);
        if (index === 29) expect(moved).toBe(state);
        state = moved;
      }
    }
    for (const student of Object.values(state.students)) {
      expect(student.completed).toBe(true);
      expect(student.questions).toHaveLength(30);
      expect(visited.get(student.studentId)?.size).toBe(30);
    }
  });
});
