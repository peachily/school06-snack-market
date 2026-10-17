import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createGameState } from '@snack-market/game-core';
import { useGameSession } from './useGameSession';

const snackIds = Array.from({ length: 30 }, (_, i) => `snack${i}`);
const fresh = () => createGameState({ sessionId: 'test', snackIds, random: () => 0.3 });

describe('useGameSession', () => {
  it('StrictMode 재렌더링과 학생 전환 후 가격·진행 상태를 유지한다', () => {
    const initialState = fresh();
    const { result, rerender } = renderHook(() => useGameSession(initialState, snackIds), { wrapper: StrictMode });
    const initialPrice = result.current.question.targetPrice;
    const cash = result.current.cash[1];
    act(() => result.current.useCash(cash.id, cash.place));
    act(() => result.current.selectStudent(2));
    act(() => result.current.selectStudent(1));
    rerender();
    expect(result.current.question.targetPrice).toBe(initialPrice);
    expect(result.current.cash[1].used).toBe(true);
    expect(result.current.digits.thousands).toBe(1);
    const previous = result.current.state;
    act(() => result.current.nextQuestion());
    expect(result.current.state).toBe(previous);
  });

  it('완료 후 다음 문제를 연결하고 재시작은 현재 학생만 변경한다', () => {
    const { result } = renderHook(() => useGameSession(fresh(), snackIds));
    for (const cash of result.current.cash) act(() => result.current.useCash(cash.id, cash.place));
    expect(result.current.question.completed).toBe(true);
    act(() => result.current.nextQuestion());
    expect(result.current.student.currentIndex).toBe(1);
    expect(result.current.digits.thousands).toBe(0);
    const other = result.current.state.students[2];
    act(() => result.current.restartStudent());
    expect(result.current.student.currentIndex).toBe(0);
    expect(result.current.state.students[2]).toBe(other);
  });

  it('새로 마운트하면 전달된 새 초기 상태에서 시작한다', () => {
    const first = renderHook(() => useGameSession(fresh(), snackIds));
    act(() => first.result.current.useCash(first.result.current.cash[0].id, 'thousands'));
    first.unmount();
    const second = renderHook(() => useGameSession(fresh(), snackIds));
    expect(second.result.current.digits.thousands).toBe(0);
    expect(second.result.current.state.activeStudentId).toBe(1);
  });
});
