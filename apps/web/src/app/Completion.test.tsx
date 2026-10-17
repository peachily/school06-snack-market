import { createCashTokens, createGameState, splitDigits } from '@snack-market/game-core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { snacks } from '../data/snacks';
import { App } from './App';

const fresh = () => createGameState({ sessionId: 'completion', snackIds: snacks.map((snack) => snack.id), random: () => 0 });
function moveMoney(name = '1,000원 지폐, 1번', place = '천의 자리') {
  fireEvent.click(screen.getByRole('button', { name }), { detail: 1 });
  fireEvent.click(screen.getByRole('button', { name: place }));
}
afterEach(() => vi.useRealTimers());

describe('완료와 다음 문제', () => {
  it('1020은 세 현금 사용 후에만 완료하며 폭죽은 한 번만 표시한다', () => {
    vi.useFakeTimers();
    const state = fresh();
    const student = state.students[3];
    const current = student.questions[0];
    const question = { ...current, targetPrice: 1020, targetDigits: splitDigits(1020), cash: createCashTokens(1020, current.id) };
    const { container } = render(<App initialState={{ ...state, activeStudentId: 3, students: { ...state.students, 3: { ...student, questions: [question, ...student.questions.slice(1)] } } }} />);
    moveMoney();
    moveMoney('10원 동전, 2번', '십의 자리');
    expect(screen.queryByRole('button', { name: '다음 문제' })).toBeNull();
    moveMoney('10원 동전, 1번', '십의 자리');
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1020원');
    expect(container.querySelector('.price-digits')).toHaveAttribute('data-completed', 'true');
    expect(container.querySelector('.completion-confetti')).not.toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(container.querySelector('.completion-confetti')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    fireEvent.click(screen.getByRole('tab', { name: '3' }));
    expect(container.querySelector('.completion-confetti')).toBeNull();
    expect(container.querySelector('.price-digits')).toHaveAttribute('data-completed', 'true');
    expect(screen.getByRole('button', { name: '다음 문제' })).toBeInTheDocument();
  });

  it('애니메이션 중 연속 다음 클릭은 한 문제만 진행하고 모든 표시를 초기화한다', () => {
    const { container } = render(<App initialState={fresh()} />);
    moveMoney();
    const previous = container.querySelector('.snack-card figcaption')?.textContent;
    const next = screen.getByRole('button', { name: '다음 문제' });
    act(() => { next.click(); next.click(); });
    expect(container.querySelector('.snack-card figcaption')?.textContent).not.toBe(previous);
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('0000원');
    expect(container.querySelector('.price-digits')).not.toHaveAttribute('data-completed');
    expect(container.querySelector('.completion-confetti')).toBeNull();
    expect(container.querySelectorAll('[data-cash-button]')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '다음 문제' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('0000원');
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    expect(container.querySelector('.snack-card figcaption')?.textContent).not.toBe(previous);
  });

  it('30종을 각 한 번 진행하고 마지막에는 상단 다시 시작만 제공한다', () => {
    const { container } = render(<App initialState={fresh()} />);
    const names = new Set();
    for (let index = 0; index < 30; index += 1) {
      names.add(container.querySelector('.snack-card figcaption')?.textContent);
      moveMoney();
      if (index < 29) fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
    }
    expect(names.size).toBe(30);
    expect(screen.queryByRole('button', { name: '다음 문제' })).toBeNull();
    expect(screen.getByRole('button', { name: '다시 시작' })).toBeInTheDocument();
    expect(container.querySelector('.completion-confetti')).not.toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
    expect(screen.queryByRole('button', { name: '다음 문제' })).toBeNull();
    expect(container.querySelector('.completion-confetti')).toBeNull();
  });
});
