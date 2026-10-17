import { createGameState } from '@snack-market/game-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { snacks } from '../data/snacks';
import { App } from './App';

function setup() {
  return render(<App initialState={createGameState({ sessionId: 'interaction', snackIds: snacks.map((snack) => snack.id), random: () => 0.999 })} />);
}
const cash = () => screen.getByRole('button', { name: '1,000원 지폐, 5번' });
const digit = () => screen.getByRole('button', { name: '천의 자리' });
const amount = () => screen.getByRole('group', { name: '만든 금액' });

describe('현금 대체 조작', () => {
  it('가운데 현금만 사용하고 모든 슬롯과 나머지 순서를 유지한다', () => {
    const { container } = setup();
    const slots = Array.from(container.querySelectorAll('.wallet-slot'));
    const ids = slots.map((slot) => slot.getAttribute('data-cash-id'));
    fireEvent.click(cash(), { detail: 1 });
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('1000원');
    expect(slots[4]).toBeEmptyDOMElement();
    expect(Array.from(container.querySelectorAll('.wallet-slot'))).toEqual(slots);
    expect(slots.map((slot) => slot.getAttribute('data-cash-id'))).toEqual(ids);
    expect(container.querySelectorAll('[data-cash-button]')).toHaveLength(8);
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('1000원');
  });
  it('다른 자리는 흔들리고 사용 상태를 유지한 채 선택만 해제한다', () => {
    setup();
    fireEvent.click(cash(), { detail: 1 });
    const wrong = screen.getByRole('button', { name: '백의 자리' });
    fireEvent.click(wrong);
    expect(wrong.querySelector('.digit-error')).not.toBeNull();
    expect(cash()).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('0000원');
  });
  it('키보드 선택 시 목표 칸으로 초점을 옮기고 방향키와 취소를 지원한다', () => {
    setup();
    fireEvent.click(cash(), { detail: 0 });
    expect(digit()).toHaveFocus();
    fireEvent.keyDown(digit(), { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '백의 자리' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(cash()).toHaveFocus();
    expect(cash()).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(cash(), { detail: 0 });
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('1000원');
  });
  it('학생을 바꾸면 선택이 남지 않고 사용한 현금만 복원한다', () => {
    setup();
    fireEvent.click(cash(), { detail: 1 });
    fireEvent.click(screen.getByRole('tab', { name: '2' }));
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('0000원');
    fireEvent.click(screen.getByRole('tab', { name: '1' }));
    expect(cash()).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('0000원');
  });
  it('현금을 모두 사용해도 9를 초과하지 않는다', () => {
    const { container } = setup();
    for (const button of container.querySelectorAll('[data-cash-button]')) {
      fireEvent.click(button, { detail: 1 });
      fireEvent.click(digit());
    }
    fireEvent.click(digit());
    expect(amount()).toHaveTextContent('9000원');
    expect(container.querySelectorAll('[data-cash-button]')).toHaveLength(0);
    expect(container.querySelectorAll('.wallet-slot')).toHaveLength(36);
  });
});
