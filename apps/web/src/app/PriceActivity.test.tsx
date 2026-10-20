import { createGameState } from '@snack-market/game-core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { snacks } from '../data/snacks';
import { priceExercises, getPriceSnack } from '../data/priceExercises';
import { App } from './App';

function start() {
  const result = render(<App initialState={createGameState({ sessionId: 'test', snackIds: snacks.map((s) => s.id), random: () => 0 })} />);
  const toggle = () => fireEvent.click(result.container.querySelector('#activity-switch')!);
  return { ...result, toggle };
}
function move(index: number, denomination = '1,000원 지폐', place = '천의 자리') {
  fireEvent.click(screen.getByRole('button', { name: `${denomination}, ${index}번` }), { detail: 1 });
  fireEvent.click(screen.getByRole('button', { name: place }));
}

describe('가격만큼 옮기기 연결', () => {
  it('사용자가 지정한 30개 이름·가격·순서와 기존 이미지를 연결한다', () => {
    expect(priceExercises.map((item) => [getPriceSnack(item.snackId).name, item.price])).toEqual([
      ['고구마깡', 2000], ['빵또아', 1000], ['꼬깔콘', 2300], ['빼빼로', 3000], ['고래밥', 2100], ['수박바', 1900],
      ['돼지바', 1050], ['양파링', 2030], ['마가렛트', 3500], ['엄마손파이', 4200], ['몽쉘', 5280], ['오감자', 2307],
      ['마이쮸', 1850], ['오뜨', 6020], ['바나나우유', 4900], ['요맘때', 5230], ['말랑카우', 3090], ['월드콘', 1550],
      ['바나나킥', 2070], ['자두바', 4805], ['메로나', 3165], ['죠스바', 2008], ['버터와플', 8105], ['짜요짜요', 4782],
      ['붕어싸만코', 1005], ['찰붕어빵', 2250], ['빠다코코낫', 7386], ['촉촉한초코칩', 6027], ['카스타드', 4063], ['칸쵸', 1905],
    ]);
    for (const exercise of priceExercises) expect(getPriceSnack(exercise.snackId).imageSrc).toBe(snacks.find((s) => s.id === exercise.snackId)?.imageSrc);
  });

  it('전환 시 두 활동의 진행과 선택 학생을 유지하고 가격은 새 활동에만 표시한다', () => {
    const { toggle, container } = start();
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    move(1);
    toggle();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.getByLabelText('목표 가격')).toHaveTextContent('2000원');
    expect(container.querySelectorAll('[data-cash-button]')).toHaveLength(36);
    move(9);
    toggle();
    expect(screen.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByLabelText('목표 가격')).toBeNull();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
    toggle();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
    expect(screen.queryByRole('button', { name: '1,000원 지폐, 9번' })).toBeNull();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: '다시 시작' }));
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('0000원');
    toggle();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('1000원');
    confirm.mockRestore();
  });

  it('잔여 현금이 있어도 완료하고 다음 문제를 한 번만 진행하며 초과를 흔들림으로 알린다', () => {
    const { toggle, container } = start();
    toggle();
    move(1, '100원 동전', '백의 자리');
    expect(container.querySelector('.digit-error')).not.toBeNull();
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('0000원');
    move(9); move(4);
    expect(container.querySelector('.completion-confetti')).not.toBeNull();
    expect(container.querySelectorAll('[data-cash-button]:disabled')).toHaveLength(34);
    const next = screen.getByRole('button', { name: '다음 문제' });
    act(() => { next.click(); next.click(); });
    expect(screen.getByText('빵또아')).toBeInTheDocument();
    expect(screen.getByLabelText('목표 가격')).toHaveTextContent('1000원');
    expect(container.querySelectorAll('[data-cash-button]')).toHaveLength(36);
    expect(container.querySelector('.completion-confetti')).toBeNull();
    move(1);
    fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
    expect(screen.getByText('꼬깔콘')).toBeInTheDocument();
    move(1); move(2); move(3);
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('2000원');
    expect(container.querySelector('.digit-error')).not.toBeNull();
    expect(screen.getByRole('button', { name: '1,000원 지폐, 3번' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: '다음 문제' })).toBeNull();
    move(1, '100원 동전', '백의 자리'); move(2, '100원 동전', '백의 자리'); move(3, '100원 동전', '백의 자리');
    expect(screen.getByRole('group', { name: '만든 금액' })).toHaveTextContent('2300원');
    expect(screen.getByRole('button', { name: '다음 문제' })).toBeInTheDocument();
  });
});
