import { createGameState } from '@snack-market/game-core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { snacks } from '../data/snacks';
import { priceExercises, getPriceSnack } from '../data/priceExercises';
import { App } from './App';

function start() {
  return render(<App initialState={createGameState({ sessionId: 'navigation', snackIds: snacks.map((s) => s.id), random: () => 0.9 })} />);
}
const next = () => screen.getByRole('button', { name: '다음 문제' });
const previous = () => screen.getByRole('button', { name: '이전 문제' });

describe('완성 전 문제 이동', () => {
  it('얼마일까요?는 완성 전 다음 이동이 가능하고 다른 단계의 진행을 유지한다', () => {
    const { container } = start();
    expect(next()).toBeEnabled();
    expect(screen.queryByRole('button', { name: '이전 문제' })).toBeNull();
    const name = container.querySelector('figcaption')?.textContent;
    const arrow = next();
    act(() => { arrow.click(); arrow.click(); });
    const second = container.querySelector('figcaption')?.textContent;
    expect(second).not.toBe(name);
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('0000원');
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    expect(container.querySelector('figcaption')?.textContent).toBe(second);
    for (let i = 1; i < 29; i += 1) fireEvent.click(next());
    expect(next()).toBeDisabled();
  });

  it('얼마를 낼까요?는 고정된 30문제를 앞뒤로 이동하며 부분 진행과 양끝 버튼을 유지한다', () => {
    const { container } = start();
    fireEvent.click(screen.getByRole('button', { name: '얼마를 낼까요?' }));
    expect(screen.queryByRole('button', { name: '이전 문제' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '1,000원 지폐, 9번' }), { detail: 1 });
    fireEvent.click(screen.getByRole('button', { name: '천의 자리' }));
    fireEvent.click(next());
    expect(screen.getByText('빵또아')).toBeInTheDocument();
    fireEvent.click(previous());
    expect(screen.getByText('고구마깡')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
    expect(screen.queryByRole('button', { name: '1,000원 지폐, 9번' })).toBeNull();
    for (let i = 0; i < 30; i += 1) {
      expect(container.querySelector('figcaption')).toHaveTextContent(getPriceSnack(priceExercises[i].snackId).name);
      expect(screen.getByLabelText('목표 가격')).toHaveTextContent(`${priceExercises[i].price}원`);
      if (i < 29) fireEvent.click(next());
    }
    expect(screen.queryByRole('button', { name: '다음 문제' })).toBeNull();
    expect(previous()).toBeEnabled();
    fireEvent.click(previous());
    expect(screen.getByText('카스타드')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '얼마일까요?' }));
    fireEvent.click(screen.getByRole('button', { name: '얼마를 낼까요?' }));
    expect(screen.getByText('카스타드')).toBeInTheDocument();
  });
});
